# Fotu Frontend 🖼️

The frontend of Fotu is a modern, responsive gallery application built with React 19, Vite, and TypeScript. It provides a fluid user experience for managing and viewing media libraries.

## ✨ Key Features

- **Dynamic Gallery**: Visualizes photos and videos with a responsive grid and virtual lists for high performance.
- **Job Monitoring**: Real-time status updates for backend jobs (scanning, hashing).
- **Map View**: Interactive map for exploring media metadata and locations.
- **Modern UI**: Sleek design with glassmorphism, dark mode support, and smooth transitions.
- **Selection System**: Robust multi-select capability for batch operations.

## 🚀 Core Technologies

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Maps**: Leaflet & React Leaflet
- **Virtualization**: React Virtuoso
- **Real-time**: Socket.io-client
- **Styling**: Vanilla CSS (Modern CSS features)

## 🏗️ Architecture

### 1. State Management
Used React's Context API to manage shared state across the application:
- `PhotoContext`: Manages media library data and caching.
- `JobContext`: Handles real-time job status updates via Socket.io.
- `SettingsContext`: Manages application-wide settings.
- `SelectionContext`: Handles multi-select state.
- `ThemeContext`: Manages light/dark mode.

### 2. Routing
Built with React Router 7, featuring a clean layout structure and protected routes.
- **Pages**: Gallery, Map View, Jobs, Settings, Sources.

### 3. Components
Atomic component design for high reusability:
- **UI Components**: Cards, Buttons, Inputs, Modals.
- **Gallery Components**: Masonry-like grid, high-performance image rendering.
- **Job Components**: Progress bars, detailed job cards, real-time logs.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm

### Installation & Run
```bash
pnpm install
pnpm dev
```

The app will be available at `http://localhost:5173`. Make sure the backend is running at `http://localhost:3000`.

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── api/          # API client and type definitions
│   ├── app/          # Navigation, routing, and theme definitions
│   ├── components/   # Reusable UI components
│   ├── context/      # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Main view components
│   ├── services/     # Business logic and external API services
│   ├── styles/       # Global styles and design tokens
│   ├── types/        # Global TypeScript types
│   ├── utils/        # Helper functions
│   ├── main.tsx      # Application entry point
│   └── index.css     # Global CSS
├── public/           # Static assets
└── vite.config.ts    # Vite configuration
```

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server with Hot Module Replacement (HMR) |
| `pnpm build` | Compiles the application for production |
| `pnpm lint` | Runs ESLint to check for code quality issues |
| `pnpm preview` | Starts a local server to preview the production build |
