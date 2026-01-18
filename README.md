# Galactic Barrage

An epic space shooter game built with React, Vite, and Capacitor.

## Features

- Fast-paced space shooter gameplay
- Multiple character selection with unique ships
- Progressive difficulty through 13 stages
- Boss battles at each stage
- Power-ups and ship evolution system
- Mobile-optimized with Android back button support
- High score tracking with local storage
- Daily credits system for replayability

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Capacitor** - Native mobile app wrapper
- **Howler.js** - Audio management
- **Firebase** - Backend services

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Sync with Android
npx cap sync android

# Open Android Studio
npx cap open android
```

## Game Controls

- **Desktop**: Arrow keys to move, Space to shoot
- **Mobile**: Touch and drag to move, auto-shoot enabled
- **Android Back Button**: Navigates through screens with confirmation dialogs

## Project Structure

- `/src/components` - React components (game, character select, name entry)
- `/src/engine` - Game engine logic
- `/src/utils` - Utility functions (storage, audio)
- `/assets` - Images and audio files
