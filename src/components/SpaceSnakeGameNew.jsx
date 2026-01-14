/**
 * Space Snake Game - React UI Component
 * Complete Menu with Stats, Profile & Evolution
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import GameEngine from '../engine/GameEngine';

const SpaceSnakeGameNew = ({ playerName, onMenuReturn, characterType = 'blue' }) => {
  // ==================== REFS ====================
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  
  // ==================== STATE ====================
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [finalScore, setFinalScore] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bossWarning, setBossWarning] = useState(false);
  const [bossTimer, setBossTimer] = useState(60);
  const [avatarState, setAvatarState] = useState('normal');
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  // Character colors
  const characterColors = {
    blue: '#4488ff',
    red: '#ff4444',
    pink: '#ff44ff',
    yellow: '#ffff44'
  };
  
  // ==================== GAME CONTROL ====================
  const startGame = useCallback(() => {
    setGameState('loading');
    setLoadingProgress(0);
    setGamesPlayed(prev => prev + 1);
    
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
    onLevelUp: (newLevel) => {
      setLevel(newLevel);
    },
    onGameOver: (finalScoreValue) => {
      setFinalScore(finalScoreValue);
      if (finalScoreValue > highScore) {
        setHighScore(finalScoreValue);
      }
      setGameState('gameover');
    },
    onLivesUpdate: (newLives) => {
      setLives(newLives);
    },
    onBossWarning: (warning) => {
      setBossWarning(warning);
    },
    onBossTimerUpdate: (timer) => {
      setBossTimer(timer);
    }
  };
  
  // ==================== CANVAS SETUP ====================
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current, gameCallbacks);
      gameEngineRef.current.start();
    }
    
    return () => {
      if (gameEngineRef.current && gameState !== 'playing') {
        gameEngineRef.current.stop();
        gameEngineRef.current = null;
      }
    };
  }, [gameState, gameCallbacks]);
  
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
              Score: {score.toLocaleString()}
            </div>
            <div style={{ fontSize: '18px' }}>
              Lives: {'❤️'.repeat(Math.max(0, lives))}
            </div>
            <div style={{ fontSize: '16px', marginTop: '5px' }}>
              Level: {level}
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 10px auto',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '2px solid #4488ff',
              boxShadow: '0 0 15px rgba(68, 136, 255, 0.6)'
            }}>
              <img
                src={`/assets/player/${characterType}-ready.png`}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            {bossWarning && (
              <div style={{
                background: 'rgba(255, 68, 68, 0.9)',
                padding: '10px 20px',
                borderRadius: '10px',
                animation: 'warningPulse 1s ease-in-out infinite'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
                  ⚠️ BOSS INCOMING!
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffcc00' }}>
                  {bossTimer}s
                </div>
              </div>
            )}
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
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '40px',
            maxWidth: '1200px',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            {/* Left: Player Profile & Stats */}
            <div style={{
              minWidth: '280px',
              maxWidth: '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Profile Card - 180px avatar */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '20px',
                padding: '25px 20px',
                border: '2px solid',
                borderImage: `linear-gradient(135deg, ${characterColors[characterType] || '#4488ff'}, ${characterColors[characterType] || '#44ff88'}, #ffcc00) 1`,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                textAlign: 'center'
              }}>
                {/* Character Avatar - 180px */}
                <div style={{
                  width: '180px',
                  height: '180px',
                  margin: '0 auto 15px auto',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  border: '4px solid',
                  borderColor: characterColors[characterType] || '#4488ff',
                  boxShadow: `0 0 30px ${(characterColors[characterType] || '#4488ff')}80, 0 0 60px ${(characterColors[characterType] || '#4488ff')}40`,
                  position: 'relative',
                  background: 'rgba(0, 0, 0, 0.3)'
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
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    animation: 'profileShine 2s ease-in-out infinite'
                  }} />
                </div>
                
                {/* Character Name */}
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: '0 0 5px 0',
                  color: characterColors[characterType] || '#4488ff',
                  textTransform: 'capitalize',
                  textShadow: `0 0 15px ${characterColors[characterType] || '#4488ff'}`
                }}>
                  {characterType}
                </h3>
                
                {/* Badge */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  padding: '6px 15px',
                  background: `linear-gradient(135deg, ${characterColors[characterType] || '#4488ff'}, ${characterColors[characterType] || '#44ff88'})`,
                  borderRadius: '20px',
                  display: 'inline-block',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  boxShadow: `0 5px 15px ${(characterColors[characterType] || '#4488ff')}60`,
                  marginBottom: '15px'
                }}>
                  ⭐ READY FOR ACTION
                </div>
              </div>
              
              {/* Power-Up Card - With Image */}
              <div style={{
                width: '100%',
                background: 'rgba(255, 204, 0, 0.1)',
                borderRadius: '15px',
                padding: '15px',
                border: '2px solid rgba(255, 204, 0, 0.3)',
                boxShadow: '0 5px 15px rgba(255, 204, 0, 0.2)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#ffcc00',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  🚀 POWER-UP SYSTEM
                </div>
                <div style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '10px'
                }}>
                  <img
                    src="/assets/power-ups/level-up-spaceship.png"
                    alt="Power-Up Evolution"
                    style={{
                      width: '200px',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
              
              {/* Player Stats Card - From Screenshot */}
              <div style={{
                width: '100%',
                background: 'rgba(68, 136, 255, 0.15)',
                borderRadius: '15px',
                padding: '15px',
                border: '2px solid rgba(68, 136, 255, 0.4)',
                boxShadow: '0 5px 15px rgba(68, 136, 255, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#4488ff',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textShadow: '0 0 10px rgba(68, 136, 255, 0.6)'
                }}>
                  📊 Your Stats
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Score</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffcc00', textShadow: '0 0 10px rgba(255, 204, 0, 0.6)' }}>
                      {score.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '5px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Best</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#44ff88', textShadow: '0 0 10px rgba(68, 255, 136, 0.6)' }}>
                      {highScore.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Games</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff44ff', textShadow: '0 0 10px rgba(255, 68, 255, 0.6)' }}>
                      {gamesPlayed}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Change Character Button */}
              <button
                onClick={() => onMenuReturn && onMenuReturn()}
                style={{
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #ff44ff, #ff8800)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  boxShadow: '0 5px 15px rgba(255, 68, 255, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = '0 8px 20px rgba(255, 68, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 5px 15px rgba(255, 68, 255, 0.4)';
                }}
              >
                🎨 Change Character
              </button>
            </div>
            
            {/* Right: Ship Evolution Grid */}
            <div style={{
              flex: 1,
              minWidth: '400px',
              maxWidth: '600px'
            }}>
              <div style={{
                fontSize: '22px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#fff',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
                textAlign: 'center'
              }}>
                ⚙️ Ship Evolution
              </div>
              
              {/* 2x2 Evolution Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
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
                    width: '60px',
                    height: '60px',
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
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#aaa',
                      marginBottom: '2px',
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
                    fontSize: '18px',
                    color: '#ffcc00'
                  }}>
                    🔴
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
                    width: '60px',
                    height: '60px',
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
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#44ff88',
                      marginBottom: '2px',
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
                    fontSize: '18px',
                    color: '#ffcc00'
                  }}>
                    🔴🔴
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
                    width: '60px',
                    height: '60px',
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
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#ffcc00',
                      marginBottom: '2px',
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
                    fontSize: '18px',
                    color: '#ffcc00'
                  }}>
                    🔴🔴🔴
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
                    width: '60px',
                    height: '60px',
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
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#ff44ff',
                      marginBottom: '2px',
                      textShadow: '0 0 10px rgba(255, 68, 255, 0.8)'
                    }}>
                      LEVEL 3
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#aaa',
                      fontStyle: 'italic'
                    }}>
                      Ultimate
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#ffcc00',
                    animation: 'pulse 1s ease-in-out infinite'
                  }}>
                    🔴🔴🔴🔴
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Start Button - Bottom */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <button
              onClick={startGame}
              style={{
                padding: '20px 60px',
                fontSize: '28px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4488ff 0%, #44ff88 50%, #ffcc00 100%)',
                border: 'none',
                borderRadius: '18px',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 15px 40px rgba(68, 136, 255, 0.6)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                position: 'relative',
                overflow: 'hidden',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.08)';
                e.target.style.boxShadow = '0 20px 50px rgba(68, 136, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 15px 40px rgba(68, 136, 255, 0.6)';
              }}
            >
              🚀 LAUNCH MISSION
            </button>
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
          <div style={{
            width: '150px',
            height: '150px',
            margin: '0 auto 20px auto',
            borderRadius: '15px',
            overflow: 'hidden',
            border: '4px solid #ff4444',
            boxShadow: '0 0 20px rgba(255, 68, 68, 0.8)',
            background: 'rgba(255, 68, 68, 0.1)'
          }}>
            <img 
              src={`/assets/player/${characterType}-defeated.png`}
              alt="Defeated Player"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                animation: 'defeatedPulse 2s ease-in-out infinite'
              }}
            />
          </div>
          
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
      
      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes level3Pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes level3Glow {
          0%, 100% { box-shadow: 0 0 30px rgba(255, 68, 255, 0.8); }
          50% { box-shadow: 0 0 50px rgba(255, 68, 255, 1), 0 0 80px rgba(255, 68, 255, 0.6); }
        }
        @keyframes profileShine {
          0% { left: -100%; }
          50%, 100% { left: 200%; }
        }
        @keyframes defeatedPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes warningPulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default SpaceSnakeGameNew;
