/**
 * Space Snake Game - React UI Component
 * Complete Menu with Stats, Profile & Evolution
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import GameEngine from '../engine/GameEngine';
import { storage } from '../utils/storage';

const SpaceSnakeGameNew = ({ playerName, onMenuReturn, characterType = 'blue' }) => {
  // ==================== REFS ====================
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  
  // ==================== STATE ====================
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1); // Ship upgrade level (0-3)
  const [stage, setStage] = useState(1); // Game stage (1-13)
  const [cycle, setCycle] = useState(1); // Game cycle (1st playthrough, 2nd, etc.)
  const [finalScore, setFinalScore] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bossWarning, setBossWarning] = useState(null);
  const [bossTimer, setBossTimer] = useState(60);
  const [avatarState, setAvatarState] = useState('normal');
  const [stageCompleted, setStageCompleted] = useState(null);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [credits, setCredits] = useState(3);
  
  // Character colors
  const characterColors = {
    blue: '#4488ff',
    red: '#ff4444',
    pink: '#ff44ff',
    yellow: '#ffff44'
  };
  
  // Format score with zero-padding (8 digits)
  const formatScore = (scoreValue) => {
    return String(scoreValue).padStart(8, '0');
  };
  
  // Helper functions for avatar states
  const getAvatarImage = (charType, state) => {
    const stateMap = {
      'normal': `${charType}-ready.png`,
      'scared': `${charType}-scared.png`,
      'cry': `${charType}-cry.png`,
      'power-up': `${charType}-power-up.png`,
      'defeated': `${charType}-defeated.png`
    };
    return `/assets/player/${stateMap[state] || stateMap.normal}`;
  };
  
  const getAvatarBorderColor = (state, color) => {
    const colorMap = {
      'normal': color,
      'scared': '#ff4444',
      'cry': '#ff8800',
      'power-up': '#ff00ff',
      'defeated': '#666666'
    };
    return colorMap[state] || color;
  };
  
  const getAvatarShadowColor = (state, color) => {
    const opacityMap = {
      'normal': '0.6',
      'scared': '0.9',
      'cry': '0.7',
      'power-up': '1.0',
      'defeated': '0.3'
    };
    return `${color}${opacityMap[state] || '0.6'}`;
  };
  
  const getAvatarBoxShadow = (state, color) => {
    if (state === 'power-up') {
      return `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}80`;
    } else if (state === 'scared') {
      return `0 0 25px #ff4444, 0 0 50px #ff444480`;
    } else if (state === 'cry') {
      return `0 0 20px #ff8800, 0 0 40px #ff880080`;
    }
    return `0 0 15px ${color}60`;
  };
  
  const getAvatarAnimation = (state) => {
    if (state === 'cry') return 'avatarShake 0.5s ease-in-out infinite';
    if (state === 'scared') return 'avatarShake 0.3s ease-in-out infinite';
    if (state === 'power-up') return 'avatarPulse 0.5s ease-in-out infinite';
    return 'none';
  };
  
  // ==================== LOAD SAVED DATA ====================
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = storage.loadHighScore();
    setHighScore(savedHighScore);
    
    // Load credits from localStorage
    const savedCredits = storage.getCredits();
    setCredits(savedCredits);
    
    console.log('📦 Loaded saved data - High Score:', savedHighScore, 'Credits:', savedCredits);
  }, []);
  
  // ==================== GAME CONTROL ====================
  const startGame = useCallback(() => {
    setGameState('loading');
    setLoadingProgress(0);
    setGamesPlayed(prev => prev + 1);
    
    // Reset lives, score, and level when starting a new game
    setLives(3);
    setScore(0);
    setLevel(1);
    
    const loadInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadInterval);
          setGameState('playing');
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  }, []);
  
  const pauseGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.pause();
      setGameState('paused');
    }
  }, []);
  
  const resumeGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resume();
      setGameState('playing');
    }
  }, []);
  
  const quitGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
      gameEngineRef.current = null;
    }
    setGameState('menu');
    setScore(0);
    setLives(3);
    setStage(1);
    setLevel(1);
    setAvatarState('normal');
  }, []);
  
  // ==================== CALLBACKS ====================
  const gameCallbacks = {
    onScoreUpdate: (newScore) => {
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
    },
    onLevelUp: (newLevel, newCycle) => {
      setLevel(newLevel);
      setCycle(newCycle);
      // Show cycle notification on HUD when starting cycle 2+
      if (newCycle > 1) {
        console.log(`🎮 Cycle ${newCycle} started! Enemies: ${Math.pow(2, newCycle - 1)}x, Boss HP: ${Math.pow(1.3, newCycle - 1).toFixed(1)}x`);
      }
    },
    onStageCleared: (clearedStage) => {
      setStage(clearedStage + 1);
      // Show "STAGE X Clear" message immediately
      setStageCompleted(clearedStage);
    },
    onStageClearComplete: () => {
      // Hide "STAGE X Clear" message after stage clear sequence completes
      setStageCompleted(null);
    },
    onGameOver: (finalScoreValue, finalStage) => {
      setFinalScore(finalScoreValue);
      setStage(finalStage);
      
      // Save high score to localStorage and update state
      storage.saveHighScore(finalScoreValue);
      if (finalScoreValue > highScore) {
        setHighScore(finalScoreValue);
      }
      
      setGameState('gameover');
      setAvatarState('defeated');
    },
    onBossSpawn: (bossStage) => {
      // Hide boss warning when boss spawns
      setBossWarning(null);
    },
    onPlayerHit: (remainingHp) => {
      console.log('Player hit! Remaining HP:', remainingHp);
      setLives(remainingHp);
      // Change to scared/cry state when hit
      if (remainingHp <= 1) {
        setAvatarState('scared');
      } else {
        setAvatarState('cry');
        // Return to normal after 1 second
        setTimeout(() => setAvatarState('normal'), 1000);
      }
    },
    onLivesChange: (newLives) => {
      console.log('Lives changed to:', newLives);
      setLives(newLives);
      // Update avatar based on HP
      if (newLives <= 1) {
        setAvatarState('scared');
      } else if (newLives >= 3) {
        setAvatarState('normal');
      }
    },
    onLivesUpdate: (newLives) => {
      console.log('Lives updated to:', newLives);
      setLives(newLives);
      // Update avatar based on HP
      if (newLives <= 1) {
        setAvatarState('scared');
      } else if (newLives >= 3) {
        setAvatarState('normal');
      }
    },
    onBossWarning: (warning) => {
      setBossWarning(warning);
      // Show scared expression when boss is coming
      if (warning) {
        setAvatarState('scared');
        // Auto-hide warning after 8 seconds (failsafe)
        setTimeout(() => setBossWarning(null), 8000);
      } else {
        // Return to normal when warning is cleared
        if (lives > 1) {
          setAvatarState('normal');
        }
      }
    },
    onStageChange: (newStage) => {
      console.log('Stage changed to:', newStage);
      setLevel(newStage);
    },
    onBossTimerUpdate: (timer) => {
      setBossTimer(timer);
    },
    onAvatarStateChange: (newState) => {
      setAvatarState(newState);
    },
    onPowerUpActivated: (type) => {
      console.log('Power-up activated:', type);
      // Only show power-up expression for individual power-ups, not SUPER_MODE
      // SUPER_MODE activates multiple power-ups at once, which would trigger multiple timeouts
      if (type !== 'SUPER_MODE') {
        setAvatarState('power-up');
        setTimeout(() => {
          // Only return to normal if not in scared state (low HP)
          if (lives > 1) {
            setAvatarState('normal');
          }
        }, 2000);
      }
    }
  };
  
  // Preload assets before starting game
  const preloadAndStart = useCallback(async (canvas, callbacks, charType) => {
    if (!canvas || gameEngineRef.current) return;
    
    console.log('🎮 Creating game engine...');
    const engine = new GameEngine(canvas, callbacks);
    gameEngineRef.current = engine;
    
    // 🔊 INITIALIZE AUDIO SYSTEM AFTER USER INTERACTION
    // Preload all game assets
    await engine.preloadAssets();
    
    // Load player ship image
    await engine.loadPlayerShip(charType);
    
    // Reset game state (includes boss timer initialization)
    engine.reset();
    
    console.log('🚀 Starting game engine...');
    // Start the game
    engine.start();
    console.log('✅ Game started!');
  }, []);
  
  // ==================== CANVAS SETUP ====================
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current && !gameEngineRef.current) {
      preloadAndStart(canvasRef.current, gameCallbacks, characterType);
    }
    
    return () => {
      if (gameEngineRef.current && gameState !== 'playing') {
        gameEngineRef.current.stop();
        gameEngineRef.current = null;
      }
    };
  }, [gameState, gameCallbacks, characterType, preloadAndStart]);
  
  // ==================== KEYBOARD ====================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          pauseGame();
        } else if (gameState === 'paused') {
          resumeGame();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pauseGame, resumeGame]);
  
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#000',
      overflow: 'hidden'
    }}>
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: gameState === 'playing' || gameState === 'paused' ? 'block' : 'none',
          width: '100%',
          height: '100%',
          background: '#000'
        }}
      />
      
      {/* HUD */}
      {gameState === 'playing' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '2px',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}>
              {formatScore(score)}
            </div>
            {/* High Score Display - Gold Font */}
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#FFD700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Orbitron, monospace',
              letterSpacing: '1px',
              marginTop: '0px',
              marginBottom: '8px'
            }}>
              {cycle > 1 && (
                <span style={{
                  fontSize: '12px',
                  color: '#ff6600',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(255, 102, 0, 0.8)'
                }}>
                  🔥 CYCLE {cycle}
                </span>
              )}
            </div>
            <div style={{ 
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              alignItems: 'flex-start'
            }}>
              {/* Row 1: Hearts 1-4 */}
              <div>
                {Array.from({ length: 4 }, (_, i) => (
                  <span 
                    key={i} 
                    style={{ 
                      opacity: i < lives ? 1 : 0.5,
                      display: 'inline-block',
                      margin: '0 1px'
                    }}
                  >
                    ❤️
                  </span>
                ))}
              </div>
              {/* Row 2: Hearts 5-8 */}
              <div>
                {Array.from({ length: 4 }, (_, i) => (
                  <span 
                    key={i + 4} 
                    style={{ 
                      opacity: i + 4 < lives ? 1 : 0.5,
                      display: 'inline-block',
                      margin: '0 1px'
                    }}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              width: '50px',
              height: '60px',
              margin: '0 auto 10px auto',
              borderRadius: '10px',
              overflow: 'hidden',
              border: `2px solid ${getAvatarBorderColor(avatarState, characterColors[characterType])}`,
              boxShadow: getAvatarBoxShadow(avatarState, characterColors[characterType]),
              transition: 'all 0.3s ease',
              animation: getAvatarAnimation(avatarState)
            }}>
              <img
                src={getAvatarImage(characterType, avatarState)}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'all 0.3s ease',
                  filter: avatarState === 'scared' ? 'brightness(0.8) hue-rotate(-20deg)' : 
                         avatarState === 'power-up' ? 'brightness(1.3) saturate(1.5)' : 'none',
                  transform: avatarState === 'cry' ? 'translateX(0)' : 'none'
                }}
                className={avatarState === 'cry' ? 'avatar-shake' : ''}
              />
            </div>
            
            {/* Boss warning removed from HUD - only showing in center */}
          </div>
        </div>
      )}
      
      {/* Boss Warning Overlay - Centered on screen - 30% of original size */}
      {gameState === 'playing' && bossWarning && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          textAlign: 'center',
          animation: 'bossWarningPulse 0.5s ease-in-out infinite'
        }}>
          {/* Warning Icon - 30% of original (80px * 0.3 = 24px) */}
          <div style={{
            fontSize: '24px',
            marginBottom: '6px',
            textShadow: '0 0 15px rgba(255, 68, 68, 0.6), 0 0 30px rgba(255, 68, 68, 0.4)',
            animation: 'warningIconShake 0.3s ease-in-out infinite'
          }}>
            ⚠
          </div>
          
          {/* Boss Name - 30% of original (48px * 0.3 = 14.4px) */}
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#ff4444',
            textShadow: '0 0 10px rgba(255, 68, 68, 0.6), 0 0 20px rgba(255, 68, 68, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.8)',
            marginBottom: '3px',
            letterSpacing: '1px'
          }}>
            {bossWarning.bossName}
          </div>
          
          {/* INCOMING Text - 30% of original (64px * 0.3 = 19.2px) */}
          <div style={{
            fontSize: '19px',
            fontWeight: 'bold',
            color: '#ffcc00',
            textShadow: '0 0 15px rgba(255, 204, 0, 0.6), 0 0 30px rgba(255, 204, 0, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.8)',
            letterSpacing: '4px',
            animation: 'textFlash 0.5s ease-in-out infinite alternate'
          }}>
            INCOMING!
          </div>
        </div>
      )}
      
      {/* Stage Completed Message */}
      {stageCompleted !== null && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          textAlign: 'center',
          animation: 'stageCompletePulse 1s ease-in-out infinite'
        }}>
          {/* Trophy Icon */}
          <div style={{
            fontSize: '48px',
            marginBottom: '10px',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)',
            animation: 'trophyGlow 1s ease-in-out infinite alternate'
          }}>
            🏆
          </div>
          
          {/* Stage Clear Text */}
          <div key={`stage-clear-${stageCompleted}`} style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5), 3px 3px 6px rgba(0, 0, 0, 0.8)',
            marginBottom: '8px',
            letterSpacing: '2px'
          }}>
            STAGE {stageCompleted} CLEAR!
          </div>
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
      
      {/* Menu Screen - Updated with Stats & Power-Up Image */}
      {gameState === 'menu' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85)), url(/assets/images/ready-background.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '15px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            gap: '20px',
            maxWidth: '1200px',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingBottom: '80px'
          }}>
            {/* Left: Player Profile & Stats */}
            <div style={{
              minWidth: '280px',
              maxWidth: '500px',
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Profile Card - Enlarged to match evolution cards */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '20px',
                padding: '25px 20px',
                border: '3px solid',
                borderColor: characterColors[characterType] || '#4488ff',
                boxShadow: `0 0 50px ${(characterColors[characterType] || '#4488ff')}60, 0 20px 50px rgba(0, 0, 0, 0.8)`,
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
              }}>
                {/* Animated background glow */}
                <div style={{
                  position: 'absolute',
                  top: -50,
                  left: -50,
                  right: -50,
                  bottom: -50,
                  background: `radial-gradient(circle at center, ${(characterColors[characterType] || '#4488ff')}40, transparent 70%)`,
                  animation: 'profileShine 3s ease-in-out infinite',
                  pointerEvents: 'none'
                }} />
                
                {/* Character Avatar - Enlarged to 220px */}
                <div style={{
                  width: '180px', height: '180px', margin: '0 auto 15px auto',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'rgba(0, 0, 0, 0.4)',
                  boxShadow: `0 0 40px ${(characterColors[characterType] || '#4488ff')}80, inset 0 0 30px rgba(0, 0, 0, 0.5)`
                }}>
                  <img
                    src={`/assets/player/${characterType}-ready.png`}
                    alt={`${characterType} Pilot`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                  }}
                />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: -100,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    animation: 'profileShine 2s ease-in-out infinite'
                  }}></div>
                </div>
                
            </div>
            
              
            {/* Right: Ship Evolution Grid */}
            <div style={{
              minWidth: '280px',
              maxWidth: '500px',
              flex: '1'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#fff',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
                textAlign: 'center'
              }}>
                Ship Evolution
              </div>
                
                {/* Evolution Grid - Vertical Stack (1 per row) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {/* Evolution Stage 0 - Basic */}
                  <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                                    background: 'rgba(136, 136, 136, 0.15)',
                    borderRadius: '12px',
                                      border: '2px solid rgba(136, 136, 136, 0.3)',
                    animation: 'float 3s ease-in-out infinite'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      background: 'rgba(136, 136, 136, 0.15)',
                      border: '2px solid #888',
                    boxShadow: '0 0 15px rgba(136, 136, 136, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={`/assets/player/${characterType}-ship.fw.png`}
                      alt="Basic Ship"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#aaa',
                      marginBottom: '1px',
                      textShadow: '0 0 8px rgba(136, 136, 136, 0.6)'
                    }}>
                      LEVEL 0
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      fontStyle: 'italic'
                    }}>
                      Basic Fighter
                    </div>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#ffcc00',
                    background: 'transparent',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ffffff 30%, rgba(255, 255, 255, 0.6) 60%, transparent 70%)',
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }} />
                    1 Bullet
                  </div>
                </div>
                
                {/* Evolution Stage 1 - Enhanced */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                                    background: 'rgba(68, 255, 136, 0.1)',
                    borderRadius: '12px',
                                      border: '2px solid rgba(68, 255, 136, 0.3)',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '0.5s'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      background: 'rgba(68, 255, 136, 0.15)',
                      border: '2px solid #44ff88',
                    boxShadow: '0 0 15px rgba(68, 255, 136, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={`/assets/player/${characterType}-level-1.fw.png`}
                      alt="Enhanced Ship"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#44ff88',
                      marginBottom: '1px',
                      textShadow: '0 0 8px rgba(68, 255, 136, 0.6)'
                    }}>
                      LEVEL 1
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      fontStyle: 'italic'
                    }}>
                      Enhanced
                    </div>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#ffcc00',
                    background: 'transparent',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ffffff 30%, rgba(255, 255, 255, 0.6) 60%, transparent 70%)',
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }} />
                    2 Bullets
                  </div>
                </div>
                
                {/* Evolution Stage 2 - Advanced */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                                    background: 'rgba(255, 204, 0, 0.1)',
                    borderRadius: '12px',
                                      border: '2px solid rgba(255, 204, 0, 0.3)',
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: '1s'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      background: 'rgba(255, 204, 0, 0.15)',
                      border: '2px solid #ffcc00',
                    boxShadow: '0 0 15px rgba(255, 204, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={`/assets/player/${characterType}-level-2.fw.png`}
                      alt="Advanced Ship"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#ffcc00',
                      marginBottom: '1px',
                      textShadow: '0 0 8px rgba(255, 204, 0, 0.6)'
                    }}>
                      LEVEL 2
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      fontStyle: 'italic'
                    }}>
                      Advanced
                    </div>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#ffcc00',
                    background: 'transparent',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ffffff 30%, rgba(255, 255, 255, 0.6) 60%, transparent 70%)',
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }} />
                    3 Bullets
                  </div>
                </div>
                

                {/* Evolution Stage 3 - Ultimate */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'rgba(255, 68, 255, 0.15)',
                  borderRadius: '12px',
                  border: '3px solid rgba(255, 68, 255, 0.5)',
                  animation: 'float 3s ease-in-out infinite',
                  animationDelay: '1.5s',
                  boxShadow: '0 0 25px rgba(255, 68, 255, 0.6)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 68, 255, 0.2), transparent)',
                    animation: 'level3Glow 2s ease-in-out infinite',
                    pointerEvents: 'none'
                  }} />
                  
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px',
                    background: 'rgba(255, 68, 255, 0.2)',
                    border: '3px solid #ff44ff',
                    boxShadow: '0 0 25px rgba(255, 68, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                    animation: 'level3Pulse 1.5s ease-in-out infinite'
                  }}>
                    <img
                      src={`/assets/player/${characterType}-level-3.fw.png`}
                      alt="Ultimate Ship"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', position: 'relative' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#ff44ff',
                      marginBottom: '1px',
                      textShadow: '0 0 10px rgba(255, 68, 255, 0.8)'
                    }}>
                      LEVEL 3
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#aaa',
                      fontStyle: 'italic',
                      display: window.innerWidth < 480 ? 'none' : 'block'
                    }}>
                      Ultimate
                    </div>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#ff4444',
                    background: 'transparent',
                    padding: '4px 8px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    border: '2px solid rgba(255, 68, 68, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ff4444 30%, rgba(255, 68, 68, 0.6) 60%, transparent 70%)',
                      boxShadow: '0 0 10px rgba(255, 68, 68, 0.8), 0 0 20px rgba(255, 68, 68, 0.4)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }} />
                    MAX LEVEL
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          
          {/* Launch Button - Relocated to Right Side */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '50%',
            transform: 'translateX(50%)',
            zIndex: 10,
            display: 'flex',
            gap: '15px'
          }}>
            {/* Change Character Button */}
            <button
              onClick={onMenuReturn}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ff44ff 0%, #ff44ff 50%, #cc00cc 100%)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255, 68, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                position: 'relative',
                overflow: 'hidden',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)'
                e.target.style.boxShadow = '0 8px 25px rgba(255, 68, 255, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
                e.target.style.background = 'linear-gradient(135deg, #ff66ff 0%, #ff66ff 50%, #dd00dd 100%)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 6px 20px rgba(255, 68, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)'
                e.target.style.background = 'linear-gradient(135deg, #ff44ff 0%, #ff44ff 50%, #cc00cc 100%)'
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(-1px) scale(1.02)'
                e.target.style.boxShadow = '0 4px 15px rgba(255, 68, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2)'
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)'
                e.target.style.boxShadow = '0 8px 25px rgba(255, 68, 255, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>👤</span>
                <span>Change</span>
              </span>
            </button>

            {/* Launch Button */}
            <button
              onClick={startGame}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #0066cc 100%)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0, 153, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                position: 'relative',
                overflow: 'hidden',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 153, 255, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
                e.target.style.background = 'linear-gradient(135deg, #33ddff 0%, #22aaff 50%, #0077ee 100%)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 6px 20px rgba(0, 153, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2)'
                e.target.style.background = 'linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #0066cc 100%)'
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(-1px) scale(1.02)'
                e.target.style.boxShadow = '0 4px 15px rgba(0, 153, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.2)'
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 153, 255, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>🚀</span>
                <span>Launch</span>
              </span>
            </button>
          </div>
        </div>
        )}
      
      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div style={{
            textAlign: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.2), rgba(255, 68, 255, 0.2))',
            padding: '30px 40px',
            borderRadius: '25px',
            border: '3px solid rgba(255, 68, 68, 0.6)',
            boxShadow: '0 0 50px rgba(255, 68, 68, 0.6), 0 0 100px rgba(255, 68, 68, 0.3)',
            animation: 'gameoverPulse 2s ease-in-out infinite'
          }}>
            {/* Defeated Avatar */}
            <div style={{
              width: '140px',
              height: '140px',
              margin: '0 auto 20px auto',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '5px solid #ff4444',
              boxShadow: '0 0 30px rgba(255, 68, 68, 0.8)',
              background: 'rgba(255, 68, 68, 0.1)'
            }}>
              <img 
                src={`/assets/player/${characterType}-defeated.png`}
                alt="Defeated"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            <h1 style={{
              fontSize: '42px',
              fontWeight: 'bold',
              marginBottom: '15px',
              textShadow: '0 0 20px #ff4444, 0 0 40px #ff4444',
              animation: 'gameoverText 1s ease-in-out infinite alternate'
            }}>
              GAME OVER
            </h1>
            
            <div style={{
              fontSize: '24px',
              marginBottom: '12px',
              color: '#ffcc00',
              textShadow: '0 0 15px rgba(255, 204, 0, 0.8)'
            }}>
              Final Score: {finalScore.toLocaleString()}
            </div>
            
            <div style={{
              fontSize: '16px',
              marginBottom: '25px',
              color: '#aaa',
              fontStyle: 'italic'
            }}>
              Level Reached: {stage}
            </div>
            
            {/* Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center',
              width: '100%',
              maxWidth: '450px',
              margin: '0 auto'
            }}>
              <button
                onClick={startGame}
                style={{
                  width: '100%',
                  minWidth: '300px',
                  padding: '14px 35px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #4488ff, #44ff88)',
                  border: 'none',
                  borderRadius: '15px',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(68, 136, 255, 0.5)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.05)'
                  e.target.style.boxShadow = '0 12px 35px rgba(68, 136, 255, 0.7)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)'
                  e.target.style.boxShadow = '0 8px 25px rgba(68, 136, 255, 0.5)'
                }}
              >
                🔄 Play Again
              </button>
              
              {/* Restart Stage Button - Uses Credits */}
              <button
                onClick={() => {
                  if (credits > 0) {
                    storage.useCredit();
                    setCredits(credits - 1);
                    setScore(0);  // Reset score to fix the bug
                    setLives(3);   // Reset lives
                    setLevel(1);   // Reset level
                    setGameState('playing');
                    setAvatarState('normal');
                  }
                }}
                disabled={credits <= 0}
                style={{
                  width: '100%',
                  minWidth: '300px',
                  padding: '14px 35px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: credits > 0 
                    ? 'linear-gradient(135deg, #00d4ff, #0099ff)' 
                    : 'linear-gradient(135deg, #666, #444)',
                  border: 'none',
                  borderRadius: '15px',
                  color: '#fff',
                  cursor: credits > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: credits > 0 
                    ? '0 8px 25px rgba(0, 153, 255, 0.5)' 
                    : 'none',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  opacity: credits > 0 ? 1 : 0.5,
                  whiteSpace: 'nowrap'
                }}
              >
                {credits > 0 ? `🔄 Restart Stage (${credits} 💰)` : '❌ No Credits Left'}
              </button>
              
              <button
                onClick={quitGame}
                style={{
                  width: '100%',
                  minWidth: '300px',
                  padding: '14px 35px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #ff4444, #ff44ff)',
                  border: 'none',
                  borderRadius: '15px',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(255, 68, 68, 0.5)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.05)'
                  e.target.style.boxShadow = '0 12px 35px rgba(255, 68, 68, 0.7)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)'
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 68, 68, 0.5)'
                }}
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
          
          {/* Game Over Animations */}
          <style>{`
            @keyframes gameoverPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
            @keyframes gameoverText {
              0% { opacity: 1; }
              100% { opacity: 0.8; textShadow: 0 0 30px #ff4444, 0 0 60px #ff4444; }
            }
            @keyframes avatarPulse {
              0%, 100% { transform: scale(1); filter: brightness(1); }
              50% { transform: scale(1.15); filter: brightness(1.4); }
            }
            @keyframes avatarShake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
              20%, 40%, 60%, 80% { transform: translateX(3px); }
            @keyframes avatarGlow {
              0%, 100% { box-shadow: 0 0 15px currentColor; }
              50% { box-shadow: 0 0 30px currentColor, 0 0 45px currentColor; }
            }
            @keyframes bossWarningPulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.05); }
            }
            @keyframes warningIconShake {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-10deg); }
              75% { transform: rotate(10deg); }
            }
            @keyframes textFlash {
              0% { opacity: 1; }
              100% { opacity: 0.7; text-shadow: 0 0 40px rgba(255, 204, 0, 1), 0 0 80px rgba(255, 204, 0, 0.8); }
            }
            @keyframes stageCompletePulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.05); }
            }
            @keyframes trophyGlow {
              0% { filter: brightness(1) drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)); }
              100% { filter: brightness(1.3) drop-shadow(0 0 30px rgba(255, 215, 0, 1)); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default SpaceSnakeGameNew;


