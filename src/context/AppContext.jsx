import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserTrips, getActiveTrip } from '../services/tripService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [trips, setTrips]             = useState([]);
  const [activeTrip, setActiveTrip]   = useState(null);
  const [tripsLoading, setTripsLoading] = useState(false);

  // Ref para guardar o uid atual — evita closure stale
  const uidRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      uidRef.current = firebaseUser?.uid ?? null;
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const loadTrips = useCallback(async (uid) => {
    const targetUid = uid ?? uidRef.current;
    if (!targetUid) {
      setTrips([]);
      setActiveTrip(null);
      return;
    }
    setTripsLoading(true);
    try {
      const [all, active] = await Promise.all([
        getUserTrips(targetUid),
        getActiveTrip(targetUid),
      ]);
      setTrips(all);
      setActiveTrip(active);
    } catch (e) {
      console.error('Erro ao carregar viagens:', e);
    } finally {
      setTripsLoading(false);
    }
  }, []);

  // Carrega viagens quando o user muda
  useEffect(() => {
    if (!authLoading) {
      loadTrips(user?.uid ?? null);
    }
  }, [user, authLoading, loadTrips]);

  const reloadTrips = useCallback(() => {
    return loadTrips(uidRef.current);
  }, [loadTrips]);

  return (
    <AppContext.Provider value={{
      user, authLoading,
      trips, setTrips,
      activeTrip, setActiveTrip,
      tripsLoading,
      reloadTrips,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
};
