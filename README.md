# 📻 Hz Radio

**Hz Radio** — the unit of frequency. A modern, polished web radio app built with Next.js 15, React 19, and Zustand.

## 🚀 What It Does

Hz Radio lets you discover and stream radio stations from around the world. Select a station, hit play, and enjoy — with smart auto-recovery that scans for the next working station if one fails.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Zustand](https://img.shields.io/badge/Zustand-5-764abc)

## ✨ Highlights

- **Auto-Scan Playback** — if a station fails to play, the app automatically scans and plays the next available station, cycling through all options before giving up
- **Geolocation Discovery** — detects your country and surfaces relevant local stations via [Radio Browser API](https://de1.api.radio-browser.info/)
- **Favorites System** — save and manage your favorite stations with persistent local storage
- **Dark/Light Theme** — system-aware theme with manual toggle, persisted across sessions
- **Mobile-First Design** — touch-optimized controls, responsive layout, and smooth transitions

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand 5 with persistence middleware |
| Icons | Lucide React |
| Audio | HTML5 Audio + custom audio manager |
| Data | Radio Browser API |

## 📁 Architecture

```
app/
├── api/stations/route.ts      # Radio Browser API proxy
├── globals.css                # Tailwind + theme variables
├── layout.tsx                 # Root layout, fonts, theme init
└── page.tsx                   # Main app shell, state orchestration

components/
├── NowPlaying.tsx             # Station info + live status indicator
├── PlaybackControls.tsx       # Previous, play/pause, stop, next
├── VolumeControl.tsx          # Full-width volume slider
├── RadioDial.tsx              # Station navigation dial
├── StationList.tsx            # Scrollable station list
└── Favorites.tsx              # Saved stations manager

stores/
└── radioStore.ts              # Zustand store (favorites, volume, playback)

lib/
├── audio.ts                   # Audio manager singleton
└── location.ts                # Geolocation utilities
```

## 🎯 Key Engineering Decisions

- **Zustand over Context** — lightweight, boilerplate-free state with built-in persistence for favorites and volume
- **App Router** — modern Next.js patterns with server components where possible
- **Custom Audio Manager** — singleton pattern for clean audio lifecycle management
- **Retry Logic with Circuit Breaker** — bounded scan attempts prevent infinite loops during playback failures
- **CSS Module Declarations** — proper TypeScript support for CSS imports with `bundler` module resolution

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📝 Recent Work

- Implemented auto-scan playback recovery with bounded retry logic
- Refactored state management to Zustand 5 with persistence
- Built mobile-first responsive UI with Tailwind CSS 4
- Added geolocation-based station discovery
- Created custom audio manager with singleton lifecycle

---

*Built with ❤️ using Next.js*
