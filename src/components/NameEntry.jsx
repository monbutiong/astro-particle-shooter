import { useState } from 'react';
import { useBackgroundMusic, playClickSound } from '../hooks/useAudio';

const NameEntry = ({ playerName, setPlayerName, onNext }) => {
  const [localName, setLocalName] = useState(playerName || '');

  // Play background music
  useBackgroundMusic(true, '/assets/audio/menu-background.mp3');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localName.trim()) {
      playClickSound();
      setPlayerName(localName.trim());
      onNext();
    }
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/images/login-background.png')" }}
    >
      {/* Dark gradient overlay at bottom to cover any image gaps */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      
      <div className="relative text-center space-y-6 p-8 max-w-md mx-auto">
        <div className="space-y-3">
          <p className="text-white text-xl font-semibold drop-shadow-lg">Enter Player Name:</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Blurred box container */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-2 border border-cyan-400/30">
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder=""
                maxLength={20}
                className="w-full px-6 py-4 text-2xl text-center bg-black/30 border-2 border-cyan-400/60 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/30 transition-all"
                autoFocus
              />
            </div>
            
            {/* Blurred button container */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-2 border border-cyan-400/30">
              <button
                type="submit"
                disabled={!localName.trim()}
                className="w-full title-text px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-xl font-bold rounded-xl hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                CONTINUE →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NameEntry;
