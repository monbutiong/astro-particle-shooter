import { useState } from 'react';
import { useBackgroundMusic, playClickSound } from '../hooks/useAudio';

const characters = [
  {
    id: 'red',
    name: 'Red Blaze',
    color: 'red',
    bgColor: 'from-red-500 to-orange-600',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    perk: 'FIRE POWER',
    perkIcon: '💥',
    perkDescription: 'Maximum damage output',
    stats: {
      damage: '★★★★★',
      fireRate: '★★★☆☆',
      speed: '★★★☆☆',
      defense: '★★☆☆☆',
    },
    bonuses: {
      bulletDamage: 1.5, // +50% damage
      bulletSize: 1.3,   // +30% bullet size
      fireRate: 1.0     // Normal fire rate (400ms)
    }
  },
  {
    id: 'blue',
    name: 'Blue Lightning',
    color: 'blue',
    bgColor: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    perk: 'SPEED',
    perkIcon: '⚡',
    perkDescription: 'Fastest movement & firing',
    stats: {
      damage: '★★★☆☆',
      fireRate: '★★★★☆',
      speed: '★★★★★',
      defense: '★★☆☆☆',
    },
    bonuses: {
      speed: 1.4,      // +40% speed
      fireRate: 0.825,  // 330ms fire rate
      bulletSpeed: 1.5 // +50% bullet speed
    }
  },
  {
    id: 'pink',
    name: 'Pink Star',
    color: 'pink',
    bgColor: 'from-pink-500 to-purple-600',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-400',
    perk: 'RAPID FIRE',
    perkIcon: '⚡',
    perkDescription: 'Fastest firing speed',
    stats: {
      damage: '★★☆☆☆',
      fireRate: '★★★★★',
      speed: '★★★☆☆',
      defense: '★★★☆☆',
    },
    bonuses: {
      fireRate: 0.675   // 270ms fire rate (fastest!)
    }
  },
  {
    id: 'yellow',
    name: 'Yellow Shield',
    color: 'yellow',
    bgColor: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    perk: 'BALANCE',
    perkIcon: '⚖️',
    perkDescription: 'Balanced all-rounder',
    stats: {
      damage: '★★★★☆',
      fireRate: '★★★★☆',
      speed: '★★★★☆',
      defense: '★★★★☆',
    },
    bonuses: {
      damage: 1.2,     // +20% damage
      speed: 1.2,      // +20% speed
      lives: 1,        // +1 extra life
      shieldRegen: true // Shield regeneration
    },
    fireRate: 1.0     // Normal fire rate (400ms)
  }
];

const CharacterSelect = ({ onSelectCharacter }) => {
  const [selectedChar, setSelectedChar] = useState(null);

  // Play background music
  useBackgroundMusic(true, '/assets/audio/menu-background.mp3');

  const handleSelect = (character) => {
    playClickSound();
    setSelectedChar(character);
  };

  const handleConfirm = () => {
    if (selectedChar) {
      playClickSound();
      onSelectCharacter(selectedChar);
    }
  };

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/images/select-a-character.png')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative text-center space-y-4 p-4 md:p-6 max-w-5xl w-full">
        
        <p className="text-white/80 text-sm">Choose your pilot:</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => handleSelect(character)}
              className={`relative p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                selectedChar?.id === character.id
                  ? `${character.borderColor} border-3 bg-gradient-to-b ${character.bgColor} shadow-2xl`
                  : 'border border-gray-600/80 bg-black/40 hover:border-gray-500'
              }`}
            >
              {selectedChar?.id === character.id && (
                <div className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-10 animate-pulse">
                  ✓
                </div>
              )}

              {/* Character Avatar (Pilot) - Enlarged with spaceship overlay on right */}
              <div className="mb-2 flex justify-center relative">
                <img
                  src={`/assets/player/${character.id}-ready.png`}
                  alt={`${character.name} pilot`}
                  className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain drop-shadow-2xl"
                />
                
                {/* Spaceship - Overlay on right side, positioned to overlap half of ship */}
                <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/4 ${
                  selectedChar?.id === character.id ? 'animate-bounce' : ''
                }`}>
                  <img
                    src={`/assets/player/${character.id}-ship.fw.png`}
                    alt={character.name}
                    className="w-16 h-12 md:w-18 md:h-14 lg:w-20 lg:h-16 object-contain drop-shadow-2xl"
                    style={{ animationDuration: '1s' }}
                  />
                </div>
              </div>

              {/* Character Name */}
              <h3 className={`title-text text-sm md:text-base font-bold ${character.textColor} mb-1 mt-2`}>
                {character.name}
              </h3>

              {/* Perk Badge - Compact */}
              <div className={`inline-block px-2 py-1 rounded-full bg-gradient-to-r ${character.bgColor} mb-2`}>
                <div className="text-white text-xs">
                  <span className="mr-1">{character.perkIcon}</span>
                  <span className="font-bold">{character.perk}</span>
                </div>
              </div>

              {/* Stats - Compact */}
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-white/70 text-left">DMG:</div>
                <div className="text-yellow-400 text-right">{character.stats.damage}</div>
                <div className="text-white/70 text-left">SPD:</div>
                <div className="text-yellow-400 text-right">{character.stats.speed}</div>
                <div className="text-white/70 text-left">RATE:</div>
                <div className="text-yellow-400 text-right">{character.stats.fireRate}</div>
                <div className="text-white/70 text-left">DEF:</div>
                <div className="text-yellow-400 text-right">{character.stats.defense}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Character Preview */}
        {selectedChar && (
          <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedChar.bgColor} border-2 ${selectedChar.borderColor} backdrop-blur-md`}>
            <h3 className="text-white text-sm md:text-base font-bold mb-1">
              {selectedChar.name} Selected
            </h3>
            <p className="text-white/90 text-xs md:text-sm">
              {selectedChar.perkIcon} {selectedChar.perk}: {selectedChar.perkDescription}
            </p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selectedChar}
          className="title-text px-8 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-lg font-bold rounded-xl hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-md"
        >
          LAUNCH MISSION 🚀
        </button>
      </div>
    </div>
  );
};

export default CharacterSelect;
