// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import SpaceSnakeGame from './components/SpaceSnakeGameNew'; // ✅ NEW IMPLEMENTATION - Uses separate Game Engine
import NameEntry from './components/NameEntry';
import CharacterSelect from './components/CharacterSelect';
import { storage } from './utils/storage';
import { App as CapacitorApp } from '@capacitor/app';

function App() {
  const [gameState, setGameState] = useState('nameEntry'); // 'nameEntry', 'characterSelect', 'playing'
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Handle Android back button
  useEffect(() => {
    const backButtonListener = CapacitorApp.addListener('backButton', (data) => {
      // Check if we're in a Capacitor environment (mobile app)
      if (window.Capacitor) {
        switch (gameState) {
          case 'playing':
            // In game, show confirmation before exiting
            if (window.confirm('Exit game and go back to character select?')) {
              handleBackToCharacterSelect();
            }
            // Don't exit the app, just return to character select
            break;
          
          case 'characterSelect':
            // On character select, show exit confirmation
            if (window.confirm('Do you want to exit the app?')) {
              CapacitorApp.exitApp();
            }
            break;
          
          case 'nameEntry':
          default:
            // On name entry or default, show exit confirmation
            if (window.confirm('Do you want to exit the app?')) {
              CapacitorApp.exitApp();
            }
            break;
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      backButtonListener.then((handler) => handler.remove());
    };
  }, [gameState]); // Re-run when gameState changes

  // Check for saved player name on mount and auto-forward to character select
  useEffect(() => {
    const savedName = storage.loadPlayerName();
    if (savedName && savedName !== 'Player') {
      setPlayerName(savedName);
      setGameState('characterSelect');
    }
  }, []);

  const handleNameSubmit = useCallback(() => {
    setGameState('characterSelect');
  }, []);

  const handleCharacterSelect = useCallback((character) => {
    setSelectedCharacter(character);
    setGameState('playing');
  }, []);

  const handleBackToNameEntry = useCallback(() => {
    setPlayerName('');
    setGameState('nameEntry');
  }, []);

  const handleBackToCharacterSelect = useCallback(() => {
    setSelectedCharacter(null);
    setGameState('characterSelect');
  }, []);

  return (
    <div className="w-full h-screen bg-slate-950">
      {gameState === 'nameEntry' && (
        <NameEntry
          playerName={playerName}
          setPlayerName={setPlayerName}
          onNext={handleNameSubmit}
        />
      )}

      {gameState === 'characterSelect' && (
        <CharacterSelect
          playerName={playerName}
          onSelectCharacter={handleCharacterSelect}
        />
      )}

      {gameState === 'playing' && (
        <SpaceSnakeGame
          playerName={playerName}
          characterType={selectedCharacter?.id || 'blue'} // Map character object to type string
          onMenuReturn={handleBackToCharacterSelect}
        />
      )}
    </div>
  );
}

export default App;
