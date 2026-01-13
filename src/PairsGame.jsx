import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- GAME CONSTANTS ---
const GAME_WIDTH = 360; // Standard mobile portrait width
const GAME_HEIGHT = 640; // Standard mobile portrait height
const PLAYER_SHIP_SIZE = 48;
const ENEMY_RADIUS = 20; // Slightly larger for better visuals
const ENEMY_SPACING = ENEMY_RADIUS * 2 + 10; // Distance between enemy centers
const ENEMY_HEALTH_DECREMENT = 10;
const BULLET_MOVE_SPEED = 600; // Pixels per second
const ENEMY_PATH_SPEED = 40; // Pixels per second (Even SLOWER snake movement)
const SHOTS_PER_SECOND = 6;
const BOSS_HEALTH_INITIAL = 9999; // Using 9999 as it's closer to 6866 and implies a large number
const BOSS_SIZE_MULTIPLIER = 1.5;

// Helper for generating unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Game Element Components ---

const Player = ({ x }) => (
  <div
    style={{ left: `${x}px` }}
    className={`absolute bottom-5 w-${PLAYER_SHIP_SIZE/4} h-${PLAYER_SHIP_SIZE/4} flex items-center justify-center transition-transform duration-50`}
  >
    {/* Simple SVG/CSS ship with NEON GREEN glow */}
    <svg className="w-full h-full drop-shadow-[0_0_8px_#10b981] animate-pulse-slow" viewBox="0 0 100 100">
      <polygon points="50,0 10,90 90,90" fill="#10b981" />
      {/* Thrusters - always firing, NEON YELLOW */}
      <rect x="25" y="90" width="10" height="15" fill="#facc15" className="animate-pulse" />
      <rect x="65" y="90" width="10" height="15" fill="#facc15" className="animate-pulse" />
    </svg>
  </div>
);

const Bullet = ({ id, x, y }) => (
  // Neon Blue/Cyan Bullet
  <div
    key={id}
    style={{ left: `${x}px`, bottom: `${y}px` }}
    className="absolute w-2 h-8 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/80"
  />
);

const Connector = ({ startX, startY, endX, endY }) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const connectorStyle = {
        left: `${startX}px`,
        bottom: `${startY}px`,
        width: `${distance}px`,
        // Center the connector vertically (height is 4px, so -2px transform)
        transformOrigin: '0 50%', 
        transform: `translateY(-2px) rotate(${angle}deg)`, 
    };

    // Neon Green/White connector for the chain
    return (
        <div 
            style={connectorStyle} 
            className="absolute h-1 bg-white opacity-70 shadow-lg shadow-green-400/80"
        />
    );
};


const Enemy = ({ id, x, y, health, isBoss }) => {
  // BOSS COLORS: Neon Red/Pink
  const bossColor = 'bg-pink-600';
  const bossGlow = 'shadow-pink-400/90 drop-shadow-[0_0_8px_#ec4899]';
  
  // REGULAR ENEMY COLORS: White/Yellow/Green based on health
  const colorClass = health >= 150 ? 'bg-yellow-400' : health >= 75 ? 'bg-green-500' : 'bg-white';
  const glowClass = health >= 150 ? 'shadow-yellow-300/80 drop-shadow-[0_0_4px_#facc15]' : health >= 75 ? 'shadow-green-300/80 drop-shadow-[0_0_4px_#34d399]' : 'shadow-white/80 drop-shadow-[0_0_4px_#ffffff]';

  const baseSize = ENEMY_RADIUS * 2;
  const size = isBoss ? baseSize * BOSS_SIZE_MULTIPLIER : baseSize;
  
  return (
    <div
      key={id}
      // Position the div based on its top-left corner
      style={{ left: `${x}px`, bottom: `${y}px`, width: `${size}px`, height: `${size}px` }}
      className={`absolute flex items-center justify-center text-black font-extrabold text-sm transition-all duration-100 ease-out 
                  ${isBoss ? bossGlow : glowClass}`}
    >
      <div 
        // Use a rounded circle for the enemy body
        className={`w-full h-full rounded-full flex items-center justify-center 
                    ${isBoss ? bossColor : colorClass} border-2 border-white`}
      >
          <span className={`${isBoss ? 'text-lg text-white drop-shadow-[0_0_5px_#f472b6]' : 'text-sm text-black'}`}>
            {health}
          </span>
      </div>
    </div>
  );
};

// --- Game Path Function ---
// 'distance' represents the progress along the path (in pixels)
const getEnemyPathX = (distance) => {
    // Increased amplitude and slightly lower frequency for more pronounced ZIG-ZAG
    const amplitude = 120; 
    const frequency = 0.015; 
    const center = GAME_WIDTH / 2;
    return center + amplitude * Math.cos(distance * frequency);
};

const getEnemyPathY = (distance) => {
    // Moves linearly down the screen from the top (GAME_HEIGHT)
    return GAME_HEIGHT - distance; 
};

// --- Main Game Component ---
export const App = () => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_SHIP_SIZE / 2); 
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const gameLoopRef = useRef();
  const gameAreaRef = useRef();
  const lastTimeRef = useRef(0);
  const shotTimerRef = useRef(0); // For time-based shooting

  // --- Initial Setup and Spawning ---
  const initializeEnemies = useCallback(() => {
    const initialEnemies = [];
    // Regular enemies
    for (let i = 0; i < 20; i++) {
        const distanceAlongPath = -i * ENEMY_SPACING; // Negative distance places them off-screen initially
        initialEnemies.push({
            id: generateId(),
            health: i % 4 === 0 ? 150 : 50 + i * 5, // Varied health
            t: distanceAlongPath, // 't' is now distance along the path
            isBoss: false,
        });
    }
    // Add the big boss block (at the end of the initial chain)
    initialEnemies.push({
        id: generateId(),
        health: BOSS_HEALTH_INITIAL,
        t: -20 * ENEMY_SPACING, // Place it behind the last regular enemy
        isBoss: true,
    });
    setEnemies(initialEnemies);
  }, []);

  useEffect(() => {
    initializeEnemies();
  }, [initializeEnemies]);

  // --- Input Handling (Player Movement) ---
  const handleMove = useCallback((clientX) => {
    const rect = gameAreaRef.current.getBoundingClientRect();
    let newX = clientX - rect.left - PLAYER_SHIP_SIZE / 2; // Center the ship
    // Clamp player X position within game boundaries
    newX = Math.max(0, Math.min(newX, GAME_WIDTH - PLAYER_SHIP_SIZE)); 
    setPlayerX(newX);
  }, []);

  useEffect(() => {
    // ... (Input handlers remain the same)
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const onTouchMove = (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            handleMove(e.touches[0].clientX);
        }
    };
    const onMouseMove = (e) => {
        if (e.buttons === 1) { 
            handleMove(e.clientX);
        }
    };

    gameArea.addEventListener('touchmove', onTouchMove, { passive: false });
    gameArea.addEventListener('mousemove', onMouseMove);

    return () => {
      gameArea.removeEventListener('touchmove', onTouchMove);
      gameArea.removeEventListener('mousemove', onMouseMove);
    };
  }, [handleMove]);


  // --- Game Loop (Physics and Updates) ---
  const gameUpdate = useCallback((currentTime) => {
    if (gameOver) {
        lastTimeRef.current = currentTime; 
        return;
    }

    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;
    shotTimerRef.current += deltaTime;

    let collisionOccurred = false;
    let updatedEnemies = [...enemies];
    
    // 1. Move Bullets and Check Collisions
    setBullets(prevBullets => {
      const newBullets = [];
      const bulletMoveDistance = BULLET_MOVE_SPEED * deltaTime;

      prevBullets.forEach(bullet => {
        const newY = bullet.y + bulletMoveDistance;
        let hit = false;

        for (let i = 0; i < updatedEnemies.length; i++) {
          const enemy = updatedEnemies[i];
          const radius = enemy.isBoss ? ENEMY_RADIUS * BOSS_SIZE_MULTIPLIER : ENEMY_RADIUS;

          const enemyCenterX = getEnemyPathX(enemy.t);
          const enemyCenterY = getEnemyPathY(enemy.t);
          
          const bulletCenterX = bullet.x + 1; 
          const bulletCenterY = newY + 4; 
          
          const dx = bulletCenterX - enemyCenterX; 
          const dy = bulletCenterY - enemyCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Collision check: bullet center to enemy center distance
          if (distance < radius + 5) { 
            updatedEnemies[i].health -= ENEMY_HEALTH_DECREMENT;
            hit = true;
            collisionOccurred = true;
            setScore(s => s + ENEMY_HEALTH_DECREMENT);
            break; 
          }
        }

        if (!hit && newY < GAME_HEIGHT) {
          newBullets.push({ ...bullet, y: newY });
        }
      });
      
      return newBullets;
    });

    // Handle enemy updates resulting from collisions
    if (collisionOccurred) {
        const aliveEnemies = updatedEnemies.filter(e => e.health > 0);
        
        // This is the core logic for chain/link removal:
        // Check if the boss (or any enemy) died.
        if (aliveEnemies.length < updatedEnemies.length) {
            // Find the index of the enemy that was linked to the one that just died
            // In a snake, the link is always between i and i-1. 
            // The enemy that died is removed, so the next enemy (if it exists) will now be the new head/body segment.
            // The chain visually handles this automatically in the render loop by just connecting
            // the remaining enemies in their new order.
        }

        setEnemies(aliveEnemies);
        updatedEnemies = aliveEnemies; 
    }
    
    // 2. Move Enemies (Slower, time-based movement)
    setEnemies(prevEnemies => {
        const moveDistance = ENEMY_PATH_SPEED * deltaTime; 
        
        const newEnemies = prevEnemies.map(enemy => ({
            ...enemy,
            t: enemy.t + moveDistance // Advance along the path
        }));

        // Check for game over (enemy reaches the bottom line)
        const hitBottom = newEnemies.some(enemy => getEnemyPathY(enemy.t) <= PLAYER_SHIP_SIZE + 5); // Check against player height
        if (hitBottom) {
            setGameOver(true);
        }

        return newEnemies.filter(enemy => getEnemyPathY(enemy.t) > 0);
    });

    // 3. Auto-Fire Bullets (Time-based firing)
    const fireInterval = 1 / SHOTS_PER_SECOND;
    if (shotTimerRef.current >= fireInterval) {
      setBullets(prev => [
        ...prev,
        { id: generateId(), x: playerX + PLAYER_SHIP_SIZE / 2 - 1, y: PLAYER_SHIP_SIZE / 2 }, 
      ]);
      shotTimerRef.current = 0; 
    }
    
    // Schedule next update
    gameLoopRef.current = requestAnimationFrame(gameUpdate);

  }, [gameOver, enemies, playerX]);


  // --- Start/Stop Game Loop Effect ---
  useEffect(() => {
    if (!gameOver) {
      lastTimeRef.current = performance.now(); 
      gameLoopRef.current = requestAnimationFrame(gameUpdate);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameUpdate, gameOver]);


  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    initializeEnemies(); // Use the new function to re-initialize
    lastTimeRef.current = performance.now(); 
    requestAnimationFrame(gameUpdate);
  };

  // --- Render ---
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-900 text-white p-4 font-mono">
      {/* Game Container (Portrait View) */}
      <div 
        ref={gameAreaRef}
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
        className="relative bg-black border-4 border-emerald-400 shadow-2xl shadow-emerald-900/50 overflow-hidden touch-none"
      >
        {/* Background Stars/Glow - More sparse and neon */}
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-color-indigo-900)_0%,_var(--tw-color-black)_100%)]">
            <div className="absolute w-1 h-1 bg-cyan-200 rounded-full shadow-lg shadow-cyan-400 top-1/4 left-1/3"></div>
            <div className="absolute w-1 h-1 bg-pink-200 rounded-full shadow-lg shadow-pink-400 top-3/4 right-1/4"></div>
            <div className="absolute w-2 h-2 bg-green-300 rounded-full shadow-lg shadow-green-500 top-1/2 left-1/2 animate-pulse-slow opacity-90"></div>
        </div>

        {/* Score Display - Neon White/Cyan */}
        <div className="absolute top-4 left-4 text-2xl font-extrabold text-white drop-shadow-[0_0_5px_#67e8f9] z-50">
          Score: {score}
        </div>

        {/* Enemies and Connectors */}
        {enemies.map((enemy, index) => {
          const radius = enemy.isBoss ? ENEMY_RADIUS * BOSS_SIZE_MULTIPLIER : ENEMY_RADIUS;
          const centerX = getEnemyPathX(enemy.t);
          const centerY = getEnemyPathY(enemy.t);
          
          // Component position (top-left corner): Center - Radius
          const x = centerX - radius;
          const y = centerY - radius;
          
          const connector = (index > 0) ? (
            <Connector 
              key={`conn-${enemy.id}`}
              // Start at previous enemy's center
              startX={getEnemyPathX(enemies[index - 1].t)}
              startY={getEnemyPathY(enemies[index - 1].t)}
              // End at current enemy's center
              endX={centerX}
              endY={centerY}
            />
          ) : null;
          
          return (
            <React.Fragment key={enemy.id}>
              {/* Connector is rendered behind the enemy */}
              {connector} 
              <Enemy x={x} y={y} health={enemy.health} isBoss={enemy.isBoss} />
            </React.Fragment>
          );
        })}

        {/* Bullets */}
        {bullets.map(bullet => (
          <Bullet key={bullet.id} x={bullet.x} y={bullet.y} />
        ))}

        {/* Player */}
        <Player x={playerX} />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-50">
            <h2 className="text-4xl font-black text-red-500 mb-4 drop-shadow-[0_0_10px_#f87171]">GAME OVER</h2>
            <p className="text-xl text-white mb-8">Final Score: {score}</p>
            <button
              onClick={restartGame}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow-lg hover:bg-green-500 transition-all duration-200 transform hover:scale-105 active:scale-95 drop-shadow-[0_0_10px_#4ade80]"
            >
              Restart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;