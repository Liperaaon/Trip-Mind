<div align="center">

# ✈️ TripPlanner

**O seu companheiro de viagem definitivo. Construído na Web, desenhado para o seu bolso.**

[![Status](https://img.shields.io/badge/Status-WIP%20(Em%20Desenvolvimento)-FF9900?style=flat-square)](#)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](#)
[![Mobile Ready](https://img.shields.io/badge/Mobile-iOS%20%7C%20Android-black?style=flat-square&logo=apple)](#)

<img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000&q=80" alt="App Preview em um iPhone" width="800" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 20px 0;" />

*O TripPlanner traz uma interface minimalista e fluida para organizar o seu roteiro dia-a-dia, explorar mapas e guardar memórias.*

</div>

---

## 💡 A Visão

Por que construir mais um site se podemos ter a fluidez de um app nativo? O TripPlanner nasceu como uma aplicação web (`React` + `Tailwind`), mas a sua alma é 100% mobile. 

A arquitetura de UI foi desenhada com atenção obsessiva aos detalhes nativos:
* 🤌 **Touch-First:** Microinterações (`active:scale`), `BottomNav` acessível com o polegar e sem scrollbars poluindo a tela[cite: 1, 7].
* 📱 **Safe Areas:** Respeito absoluto aos *notches* e barras de gestos (`env(safe-area-inset-bottom)`) do iOS e Android[cite: 2, 3, 4, 7].
* 🎯 **Roadmap Mobile:** O código está estruturado para, num futuro próximo, ser empacotado como **APK** e **App iOS** nativos.

---

## ✨ Features em Destaque

| 🧭 **Dashboard Inteligente** | 🗺️ **Mapas Dinâmicos** |
| :--- | :--- |
| Interface limpa com resumo do dia e progresso de atividades. Base preparada para futuras dicas via IA[cite: 3]. | Integração nativa com geolocalização, controle de câmera suave e busca de POIs em tempo real[cite: 5]. |

| 📅 **Planner Intuitivo** | 🪄 **Setup Rápido** |
| :--- | :--- |
| Roteiro dia-a-dia categorizado visualmente. Edição rápida, checklists e anotações ricas[cite: 4]. | Wizard de 4 passos com auto-complete global de cidades via API Nominatim (OpenStreetMap)[cite: 9]. |

---

## 🛠️ Tech Stack & Arquitetura

Sob o capô, o projeto mantém uma estrutura escalável e componentizada[cite: 1, 7, 8, 9, 10]:

- **Core:** React (Hooks, Context API).
- **Styling:** Tailwind CSS (focado em Glassmorphism, transições fluidas e paletas tonais).
- **Maps:** `react-leaflet` turbinado com OpenStreetMap[cite: 5, 9].
- **Backend (WIP):** Estrutura de *Services* pronta para plugar o Firebase (Auth, Firestore).

<details>
<summary>📂 <b>Ver estrutura de pastas</b></summary>
```text
src/
├── components/       # Componentes burros/UI (BottomNav, Modal, Widgets)
├── context/          # Estado global da viagem e do usuário
├── screens/          # Views fullscreen (Auth)
├── services/         # API wrappers (tripService, authService)
├── tabs/             # O coração do app (Home, Itinerary, Map, Profile)
└── App.jsx           # Entry point com roteamento condicional
