import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, where, orderBy, serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Referências ─────────────────────────────────────────────

const tripsCol = (uid)           => collection(db, 'users', uid, 'trips');
const tripRef  = (uid, tid)      => doc(db, 'users', uid, 'trips', tid);
const actsCol  = (uid, tid)      => collection(db, 'users', uid, 'trips', tid, 'activities');
const actRef   = (uid, tid, aid) => doc(db, 'users', uid, 'trips', tid, 'activities', aid);

// ─── Viagens ─────────────────────────────────────────────────

/**
 * Cria uma nova viagem para o usuário.
 */
export async function createTrip(uid, data) {
  const ref = await addDoc(tripsCol(uid), {
    ...data,
    status: 'upcoming',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Retorna todas as viagens do usuário.
 * Ordenação feita no cliente para evitar necessidade de índice composto.
 */
export async function getUserTrips(uid) {
  // Query simples sem orderBy — não exige índice
  const snap = await getDocs(tripsCol(uid));
  const trips = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Ordena por startDate decrescente no cliente
  return trips.sort((a, b) => {
    const da = a.startDate ? new Date(a.startDate) : new Date(0);
    const db_ = b.startDate ? new Date(b.startDate) : new Date(0);
    return db_ - da;
  });
}

/**
 * Retorna a viagem ativa (status 'active') ou a upcoming mais próxima.
 * Usa query simples por status e ordena no cliente — sem índice composto.
 */
export async function getActiveTrip(uid) {
  // Busca todas as viagens de uma vez (evita múltiplas queries com orderBy)
  const snap = await getDocs(tripsCol(uid));
  const all  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // 1️⃣ Prioridade: viagem com status 'active'
  const active = all.find((t) => t.status === 'active');
  if (active) return active;

  // 2️⃣ Fallback: upcoming mais próxima (menor startDate >= hoje)
  const today = new Date().toISOString().split('T')[0];
  const upcoming = all
    .filter((t) => t.status === 'upcoming')
    .sort((a, b) => {
      const da = a.startDate || '';
      const db_ = b.startDate || '';
      return da.localeCompare(db_);
    });

  // Prefere a mais próxima que ainda não passou; senão pega a última criada
  const next = upcoming.find((t) => (t.startDate || '') >= today) || upcoming[0];
  return next || null;
}

/**
 * Atualiza campos de uma viagem.
 */
export async function updateTrip(uid, tripId, data) {
  await updateDoc(tripRef(uid, tripId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deleta uma viagem e todas as suas atividades em batch.
 */
export async function deleteTrip(uid, tripId) {
  const batch    = writeBatch(db);
  const actsSnap = await getDocs(actsCol(uid, tripId));
  actsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(tripRef(uid, tripId));
  await batch.commit();
}

// ─── Atividades ──────────────────────────────────────────────

/**
 * Adiciona uma atividade a uma viagem.
 */
export async function addActivity(uid, tripId, data) {
  const ref = await addDoc(actsCol(uid, tripId), {
    ...data,
    done: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Retorna todas as atividades de uma viagem.
 * Ordenação feita no cliente para evitar índice composto (day + time).
 */
export async function getActivities(uid, tripId) {
  // Query simples sem orderBy
  const snap = await getDocs(actsCol(uid, tripId));
  const acts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Ordena por dia e depois por hora no cliente
  return acts.sort((a, b) => {
    if (a.day !== b.day) return (a.day || 0) - (b.day || 0);
    return (a.time || '').localeCompare(b.time || '');
  });
}

/**
 * Marca/desmarca atividade como feita.
 */
export async function toggleActivity(uid, tripId, actId, done) {
  await updateDoc(actRef(uid, tripId, actId), {
    done,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deleta uma atividade.
 */
export async function deleteActivity(uid, tripId, actId) {
  await deleteDoc(actRef(uid, tripId, actId));
}
