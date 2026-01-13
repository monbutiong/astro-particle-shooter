// src/App.jsx
import { useState } from 'react';
import SpaceSnakeGame from './SpaceSnakeGame';
import NameEntry from './components/NameEntry';
import CharacterSelect from './components/CharacterSelect';

function App() {
  const [gameState, setGameState] = useState('nameEntry'); // 'nameEntry', 'characterSelect', 'playing'
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleNameSubmit = () => {
    setGameState('characterSelect');
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setGameState('playing');
  };

  const handleBackToNameEntry = () => {
    setPlayerName('');
    setGameState('nameEntry');
  };

  const handleBackToCharacterSelect = () => {
    setSelectedCharacter(null);
    setGameState('characterSelect');
  };

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
          character={selectedCharacter}
          onBackToMenu={handleBackToNameEntry}
          onChangeCharacter={handleBackToCharacterSelect}
        />
      )}
    </div>
  );
}

export default App;
