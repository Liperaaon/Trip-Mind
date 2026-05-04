<div align="center">

# ✈️ TripPlanner

**Arquitetura Web Moderna Aplicada à Experiência Mobile Nativa**

[![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-FF9900?style=for-the-badge)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](#)

<img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80" alt="App Preview" width="100% border-radius: 16px; box-shadow: 0 4px 30px rgba(0,0,0,0.1);" />

</div>

## 📖 Sobre o Projeto

O **TripPlanner** é uma aplicação focada no planeamento completo de viagens. Construído como uma *Single Page Application* (SPA), o seu principal diferencial é a UI/UX rigorosamente arquitetada para replicar a sensação de uma aplicação móvel nativa[cite: 1, 7], preparando o terreno para uma futura compilação mobile (Android/iOS).

O objetivo deste projeto é demonstrar o domínio sobre o ecossistema React moderno, incluindo gestão de estado complexa, integração de mapas em tempo real, consumo de APIs externas e construção de interfaces fluídas com Tailwind CSS.

---

## 🏗️ Decisões Arquiteturais e Engenharia

Para garantir escalabilidade e manutenção, o projeto adota padrões sólidos de engenharia de software:

### 1. Separação de Responsabilidades (SoC)
A interface de utilizador está estritamente separada da lógica de negócios e persistência de dados. Interações com a base de dados ou APIs externas são isoladas na camada `services/`[cite: 3, 4], permitindo que os componentes visuais permaneçam limpos e focados apenas na renderização.

### 2. Gestão de Estado Global com Context API
Em vez de prop-drilling excessivo, o estado da aplicação (sessão do utilizador, viagem ativa, viagens guardadas) é gerido centralmente através do `AppContext`[cite: 1, 2, 3]. Isso garante que os dados estejam disponíveis instantaneamente e de forma sincronizada entre as diferentes *Tabs* do utilizador.

### 3. Padrão "App Shell"
O `App.jsx` implementa o padrão *App Shell*, controlando os fluxos de autenticação e garantindo que o núcleo da interface (Shell) só é carregado e renderizado quando a sessão do utilizador é validada, exibindo uma *splash screen* durante a verificação[cite: 1].

### 4. Otimização de Performance
* **Dynamic Imports:** Funcionalidades pesadas ou específicas (como funções de exclusão no `HomeTab`) são importadas dinamicamente (`await import(...)`) para evitar o inchaço do *bundle* principal no carregamento inicial[cite: 3].
* **Debouncing na API:** O modal de pesquisa de destinos implementa um *debounce* customizado (através de `useRef` e `setTimeout`) nas chamadas à API do Nominatim, poupando requisições de rede e evitando rate-limiting enquanto o utilizador digita[cite: 9].

---

## 📱 UX/UI e Desenvolvimento Mobile-First

A aplicação foi desenvolvida sob o paradigma *mobile-first*, com foco absoluto na experiência tátil:

* **Padrões de Navegação:** Implementação de uma *Bottom Navigation Bar* flutuante e *Safe Areas* (`env(safe-area-inset-bottom)`) para evitar conflitos com a barra de gestos nativa dos sistemas iOS e Android[cite: 7].
* **Prevenção de Comportamentos Web:** Remoção completa de *scrollbars* (`no-scrollbar`) e desativação do *tap-highlight* do navegador (`-webkit-tap-highlight-color: transparent`) para eliminar o aspecto de website e reforçar a perceção de app[cite: 1].
* **Microinterações:** Uso extensivo de animações de transição, *scale* em interações de toque ativo (`active:scale`) e renderização condicional suave de modais e popovers[cite: 3, 7].

---

## ✨ Features Principais

1. **Dashboard Inteligente (Home):** Resumo visual do dia, barra de progresso de atividades dinâmicas e preparação para integração de comandos via Inteligência Artificial[cite: 3].
2. **Geolocalização Interativa (Mapas):** Integração com `React-Leaflet` com marcadores HTML customizados, controlo da câmara para seguir a localização do utilizador em tempo real e pesquisa de Pontos de Interesse[cite: 5].
3. **Planeador de Itinerários:** Gestão CRUD completa de roteiros por dia, com categorias de atividades, horários e inputs expansíveis para detalhes adicionais[cite: 4].
4. **Wizard de Criação de Viagem:** Um fluxo de formulário de múltiplas etapas (Continente ➔ Destino ➔ Datas ➔ Orçamento) usando a API de geocodificação do OpenStreetMap para autocomplete de cidades a nível mundial[cite: 9].

---

## 💻 Tech Stack

* **Ecossistema Core:** React.js, Context API, Hooks (useState, useEffect, useCallback, useRef)
* **Estilização & UI:** Tailwind CSS, Lucide React (Ícones)
* **Mapas & Dados:** Leaflet, React-Leaflet, OpenStreetMap API (Nominatim)
* **Estrutura Backend (Em Integração):** Preparado para arquitetura Serverless via Firebase (Autenticação, Firestore)

---

## 📂 Estrutura de Diretórios
```text
src/
├── components/       # Componentes isolados e reutilizáveis (BottomNav, Modals, Widgets)
├── context/          # Provedores de contexto para estado global (AppContext)
├── screens/          # Telas completas de fluxo independente (AuthScreen)
├── services/         # Wrappers de integração externa e regras de negócio (API/DB)
├── tabs/             # Core views da navegação inferior (Home, Itinerary, Map, etc.)
└── App.jsx           # Roteamento condicional e App Shell
