/**
 * Space Snake Game - React UI Component
 * 
 * This component handles ONLY React UI concerns:
 * - Menus
 * - HUD (Heads Up Display)
 * - Pause/Game Over screens
 * - Event handling for UI interactions
 * 
 * ALL gameplay logic is in the separate GameEngine module
 * following "THE RIGHT Techniques for Games in React"
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import GameEngine from '../engine/GameEngine';

const SpaceSnakeGameNew = ({ playerName, onMenuReturn, characterType = 'blue' }) => {
  // ==================== REFS (No re-renders!) ====================
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  
  // ==================== REACT STATE (UI only) ====================
  const [gameState, setGameState] = useState('menu'); // menu, loading, playing, paused, gameover
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [finalScore, setFinalScore] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bossWarning, setBossWarning] = useState(false);
  const [bossTimer, setBossTimer] = useState(60);
  const [avatarState, setAvatarState] = useState('normal'); // normal, happy, hurt
  
  // Character colors
  const characterColors = {
    blue: '#4488ff',
    red: '#ff4444',
    pink: '#ff44ff',
    yellow: '#ffff44'
  };
  
  // ==================== CALLBACKS (Game → React communication) ====================
  const handleScoreChange = useCallback((newScore) => {
    setScore(newScore);
  }, []);
  
  const handlePlayerHit = useCallback((hp) => {
    setLives(hp);
    setAvatarState('hurt');
    setTimeout(() => setAvatarState('normal'), 500);
  }, []);
  
  const handleLevelUp = useCallback((newLevel) => {
    setLevel(newLevel);
    setBossWarning(true);
    setTimeout(() => setBossWarning(false), 3000);
    setAvatarState('happy');
    setTimeout(() => setAvatarState('normal'), 1000);
  }, []);
  
  const handleBossSpawn = useCallback((bossStage) => {
    setBossWarning(true);
    setTimeout(() => setBossWarning(false), 3000);
  }, []);
  
  const handleGameOver = useCallback((finalScoreValue) => {
    setFinalScore(finalScoreValue);
    setGameState('gameover');
  }, []);
  
  const handleGameStart = useCallback(() => {
    setGameState('playing');
  }, []);
  
  const handleGamePause = useCallback(() => {
    setGameState('paused');
  }, []);
  
  const handleGameResume = useCallback(() => {
    setGameState('playing');
  }, []);
  
  // ==================== INITIALIZATION ====================
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Initialize game engine
    const engine = new GameEngine(canvas, {
      onScoreChange: handleScoreChange,
      onPlayerHit: handlePlayerHit,
      onLevelUp: handleLevelUp,
      onBossSpawn: handleBossSpawn,
      onGameOver: handleGameOver,
      onGameStart: handleGameStart,
      onGamePause: handleGamePause,
      onGameResume: handleGameResume
    });
    
    gameEngineRef.current = engine;
    
    // Set player color
    engine.player.color = characterColors[characterType] || characterColors.blue;
    
    // Load player ship image
    engine.loadPlayerShip(characterType);
    
    // Preload assets
    const loadAssets = async () => {
      setGameState('loading');
      engine.assetLoader.onProgress = (loaded, total) => {
        setLoadingProgress(Math.floor((loaded / total) * 100));
      };
      
      await engine.preloadAssets();
      setGameState('menu');
    };
    
    loadAssets();
    
    // Boss timer update loop
    const bossTimerInterval = setInterval(() => {
      if (gameEngineRef.current && gameState === 'playing') {
        const timer = gameEngineRef.current.getBossTimer();
        setBossTimer(timer);
      }
    }, 100);
    
    // Cleanup
    return () => {
      clearInterval(bossTimerInterval);
      if (engine.isRunning) {
        engine.stop();
      }
    };
  }, [characterType]);
  
  // ==================== GAME CONTROLS ====================
  const startGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
      gameEngineRef.current.start();
      setScore(0);
      setLives(3);
      setLevel(1);
    }
  }, []);
  
  const pauseGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
    }
  }, []);
  
  const resumeGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume();
    }
  }, []);
  
  const quitGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
    }
    onMenuReturn();
  }, [onMenuReturn]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
      }
      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'menu') {
          startGame();
        } else if (gameState === 'gameover') {
          startGame();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, startGame, pauseGame, resumeGame]);
  
  // ==================== RENDER ====================
  return (
    <div className="game-container" style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none'
    }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          width: '100vw',
          height: '100vh',
          imageRendering: 'pixelated'
        }}
      />
      
      {/* HUD - Only during gameplay */}
      {gameState === 'playing' && (
        <>
          {/* Top HUD Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            boxSizing: 'border-box',
            pointerEvents: 'none'
          }}>
            
            {/* Left: Lives & Avatar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              {/* Player Character Avatar with Emotions */}
              <div style={{
                position: 'relative',
                width: '60px',
                height: '60px'
              }}>
                {/* Avatar Face */}
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: characterColors[characterType],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 15px ${characterColors[characterType]}`,
                  border: '3px solid rgba(255,255,255,0.5)',
                  fontSize: '32px',
                  animation: avatarState === 'hurt' ? 'shake 0.5s' : 'none'
                }}>
                  {avatarState === 'normal' && '😊'}
                  {avatarState === 'happy' && '😄'}
                  {avatarState === 'hurt' && '😵'}
                </div>
                {/* Sparkle effect for happy state */}
                {avatarState === 'happy' && (
                  <div style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    fontSize: '20px',
                    animation: 'pulse 0.5s infinite'
                  }}>
                    ✨
                  </div>
                )}
              </div>
              
              {/* Lives Display */}
              <div style={{
                color: '#fff',
                height: '60px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${characterColors[characterType]}, ${characterColors[characterType]}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '35px',
                border: `3px solid ${characterColors[characterType]}`,
                boxShadow: `0 0 15px ${characterColors[characterType]}88`,
                transition: 'transform 0.2s',
                transform: avatarState === 'hurt' ? 'scale(0.9)' : avatarState === 'happy' ? 'scale(1.1)' : 'scale(1)'
              }}>
                {avatarState === 'hurt' ? '😵' : avatarState === 'happy' ? '😄' : '🚀'}
              </div>
              
              {/* Player Name & Lives */}
              <div style={{ color: '#fff' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  marginBottom: '2px'
                }}>
                  {playerName || 'Player'}
                </div>
                <div style={{
                  fontSize: '16px',
                  color: characterColors[characterType],
                  textShadow: '0 0 10px ' + characterColors[characterType]
                }}>
                  ❤️ x {lives}
                </div>
              </div>
            </div>
            
            {/* Center: Score & Level */}
            <div style={{
              textAlign: 'center',
              color: '#fff'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                textShadow: '0 0 20px ' + characterColors[characterType],
                marginBottom: '2px'
              }}>
                {score.toLocaleString()}
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.8,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}>
                LEVEL {level}
              </div>
            </div>
            
            {/* Right: Boss Timer */}
            <div style={{
              textAlign: 'right',
              color: '#fff'
            }}>
              <div style={{
                fontSize: '14px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                marginBottom: '2px',
                opacity: 0.8
              }}>
                BOSS IN:
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: bossTimer <= 10 ? '#ff4444' : '#44ff44',
                textShadow: `0 0 20px ${bossTimer <= 10 ? '#ff4444' : '#44ff44'}`
              }}>
                {bossTimer}s
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Boss Warning */}
      {bossWarning && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#ff0000',
          fontSize: '24px', // Reduced to 50% (was 48px)
          fontWeight: 'bold',
          textShadow: '0 0 20px #ff0000',
          animation: 'flash 0.5s infinite',
          pointerEvents: 'none'
        }}>
          ⚠️ BOSS INCOMING ⚠️
        </div>
      )}
      
      {/* Loading Screen */}
      {gameState === 'loading' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff'
        }}>
          <h2>Loading Assets...</h2>
          <div style={{
            width: '300px',
            height: '20px',
            background: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            margin: '20px auto'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4488ff, #44ff88)',
              transition: 'width 0.3s'
            }} />
          </div>
          <p>{loadingProgress}%</p>
        </div>
      )}
      
      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '40px',
          borderRadius: '20px',
          border: '2px solid #4488ff',
          boxShadow: '0 0 30px rgba(68, 136, 255, 0.5)'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', textShadow: '0 0 20px #4488ff' }}>
            SPACE SNAKE
          </h1>
          <p style={{ fontSize: '24px', marginBottom: '30px' }}>
            Player: {playerName}
          </p>
          <button
            onClick={startGame}
            style={{
              padding: '15px 40px',
              fontSize: '24px',
              background: 'linear-gradient(135deg, #4488ff, #44ff88)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(68, 136, 255, 0.4)',
              transition: 'transform 0.2s',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            START GAME
          </button>
          <div style={{ marginTop: '30px', fontSize: '16px', opacity: 0.8 }}>
            <p>Arrow Keys / WASD - Move</p>
            <p>Mouse Click / Tap - Shoot</p>
            <p>ESC - Pause</p>
          </div>
        </div>
      )}
      
      {/* Pause Screen */}
      {gameState === 'paused' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          border: '2px solid #ffff44'
        }}>
          <h2 style={{ fontSize: '48px', marginBottom: '30px', textShadow: '0 0 20px #ffff44' }}>
            PAUSED
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={resumeGame}
              style={{
                padding: '15px 40px',
                fontSize: '20px',
                background: 'linear-gradient(135deg, #44ff88, #4488ff)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                userSelect: 'none'
              }}
            >
              RESUME
            </button>
            <button
              onClick={quitGame}
              style={{
                padding: '15px 40px',
                fontSize: '20px',
                background: 'linear-gradient(135deg, #ff4444, #ff44ff)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                userSelect: 'none'
              }}
            >
              QUIT TO MENU
            </button>
          </div>
        </div>
      )}
      
      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          border: '2px solid #ff4444',
          boxShadow: '0 0 30px rgba(255, 68, 68, 0.5)'
        }}>
          <h2 style={{ fontSize: '48px', marginBottom: '20px', textShadow: '0 0 20px #ff4444' }}>
            GAME OVER
          </h2>
          <p style={{ fontSize: '32px', marginBottom: '10px' }}>
            Final Score: {finalScore}
          </p>
          <p style={{ fontSize: '24px', marginBottom: '30px', opacity: 0.8 }}>
            Level Reached: {level}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={startGame}
              style={{
                padding: '15px 40px',
                fontSize: '20px',
                background: 'linear-gradient(135deg, #4488ff, #44ff88)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                userSelect: 'none'
              }}
            >
              PLAY AGAIN
            </button>
            <button
              onClick={quitGame}
              style={{
                padding: '15px 40px',
                fontSize: '20px',
                background: 'linear-gradient(135deg, #ff4444, #ff44ff)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                userSelect: 'none'
              }}
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
      
      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
      </div>
    );
  };

export default SpaceSnakeGameNew;


