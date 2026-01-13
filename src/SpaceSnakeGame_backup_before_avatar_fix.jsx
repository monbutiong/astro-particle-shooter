import { useEffect, useRef, useState, useCallback } from 'react';
// Player configuration with colors and character positions
const playerConfigs = {
    red: {
        id: 'red',
        name: 'Red Fury',
        color: '#FF4444',
        glowColor: 'rgba(255, 68, 68, 0.6)',
        emoji: '🔴',
        shipType: 'speed',
        shipImage: '/src/assets/player/red-ship.fw.png',
        avatarImage: '/src/assets/player/red-ready.png',
    },
    blue: {
        id: 'blue',
        name: 'Blue Thunder',
        color: '#4488FF',
        glowColor: 'rgba(68, 136, 255, 0.6)',
        emoji: '🔵',
        shipType: 'balanced',
        shipImage: '/src/assets/player/blue-ship.fw.png',
        avatarImage: '/src/assets/player/blue-ready.png',
    },
    yellow: {
        id: 'yellow',
        name: 'Yellow Flash',
        color: '#FFDD44',
        glowColor: 'rgba(255, 221, 68, 0.6)',
        emoji: '🟡',
        shipType: 'heavy',
        shipImage: '/src/assets/player/yellow-ship.fw.png',
        avatarImage: '/src/assets/player/yellow-ready.png',
    },
    pink: {
        id: 'pink',
        name: 'Pink Lightning',
        color: '#FF44DD',
        glowColor: 'rgba(255, 68, 221, 0.6)',
        emoji: '🩷',
        shipType: 'agile',
        shipImage: '/src/assets/player/pink-ship.fw.png',
        avatarImage: '/src/assets/player/pink-ready.png',
    },
};



// Helper function to lighten a hex color
const lightenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

// Helper function to darken a hex color
const darkenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};


// Sound Manager
const useSoundManager = () => {
  const audioContextRef = useRef(null);
  const soundsRef = useRef({});
  const musicRef = useRef(null);
  const musicVolumeRef = useRef(0.3); // 30% volume for background music
  const sfxVolumeRef = useRef(0.5); // 50% volume for sound effects

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Load sound file
  const loadSound = useCallback((path) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
      audio.addEventListener('error', reject, { once: true });
    });
  }, []);

  // Initialize all sounds
  const initSounds = useCallback(async () => {
    if (Object.keys(soundsRef.current).length > 0) return; // Already loaded

    const soundPaths = {
      // Shooting sounds
      shoot: '/audio/fire.wav',
      shootNormal: '/audio/fire-normal.wav',
      
      // Enemy sounds
      enemyHit: '/audio/enemy-hit.wav',
      enemyDestroy: '/audio/fireworks.wav',
      pinHit: '/audio/pin_hit.wav',
      slotHit: '/audio/slot_hit.wav',
      
      // Boss sounds
      bossDead: '/audio/boss dead.wav',
      
      // Power-up sounds
      powerUp: '/audio/power-ups.wav',
      powerUpSpecial: '/audio/power-ups-1.wav',
      jackpot: '/audio/jackpot.wav',
      
      // Game state sounds
      uiClick: '/audio/ui_click.wav',
      gameOver: '/audio/game_over.wav',
      newRecord: '/audio/new_record.wav',
      winFireworks: '/audio/win_fireworks.wav',
      
      // Background music
      bgmLevel1: '/audio/background-sound-1-to-10.mp3',
      bgmLevel2: '/audio/background-sound-11-to-20.mp3',
      bgmLevel3: '/audio/background-sound-21-to-30.mp3',
      bgmLevel4: '/audio/background-sound-31-to-all.mp3',
    };

    for (const [name, path] of Object.entries(soundPaths)) {
      try {
        const audio = await loadSound(path);
        soundsRef.current[name] = audio;
      } catch (error) {
        console.warn(`Failed to load sound: ${name}`, error);
      }
    }
  }, [loadSound]);

  // Play sound effect
  const playSound = useCallback((soundName, volume = sfxVolumeRef.current) => {
    const sound = soundsRef.current[soundName];
    if (!sound) return;

    const audio = sound.cloneNode();
    audio.volume = volume;
    audio.currentTime = 0;
    
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audio.play().catch(err => console.warn(`Failed to play ${soundName}:`, err));
    }
  }, []);

  // Play background music
  const playMusic = useCallback((level = 1, loop = true) => {
    // Stop current music
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    // Select music based on level
    let musicName = 'bgmLevel1';
    if (level >= 31) musicName = 'bgmLevel4';
    else if (level >= 21) musicName = 'bgmLevel3';
    else if (level >= 11) musicName = 'bgmLevel2';

    const music = soundsRef.current[musicName];
    if (!music) return;

    musicRef.current = music.cloneNode();
    musicRef.current.volume = musicVolumeRef.current;
    musicRef.current.loop = loop;
    musicRef.current.currentTime = 0;

    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      musicRef.current.play().catch(err => console.warn('Failed to play music:', err));
    }
  }, []);

  // Stop music
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  // Set music volume
  const setMusicVolume = useCallback((volume) => {
    musicVolumeRef.current = Math.max(0, Math.min(1, volume));
    if (musicRef.current) {
      musicRef.current.volume = musicVolumeRef.current;
    }
  }, []);

  // Set SFX volume
  const setSFXVolume = useCallback((volume) => {
    sfxVolumeRef.current = Math.max(0, Math.min(1, volume));
  }, []);

  return {
    initAudio,
    initSounds,
    playSound,
    playMusic,
    stopMusic,
    setMusicVolume,
    setSFXVolume,
  };
};

// Helper function to calculate explosion volume based on enemy size
const calculateExplosionVolume = (enemySize, isBoss = false) => {
  if (isBoss) return 0.5; // Boss - loudest
  if (enemySize <= 10) return 0.05; // Small (SWARM) - very quiet
  if (enemySize <= 15) return 0.15; // Normal - quiet
  if (enemySize <= 20) return 0.25; // Medium (GHOST, SHOOTER) - moderate
  if (enemySize <= 25) return 0.35; // Large (TANK) - loud
  return 0.4; // Very large enemies
};

const SpaceSnakeGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({});
  
  const [gameState, setGameState] = useState('loading'); // loading, start, playing, gameover
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('spaceSnakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // Player data state
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showLoginScreen, setShowLoginScreen] = useState(true);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.3);

  
  // Update high score when score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('spaceSnakeHighScore', score.toString());
    }
  }, [score, highScore]);

  // Initialize sound manager
  const soundManager = useSoundManager();
  const musicStartedRef = useRef(false);
  const audioInitializedRef = useRef(false);

  // Load all assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoadingStatus('Initializing audio...');
        setLoadingProgress(10);
        
        // Initialize audio context
        await soundManager.initAudio();
        setLoadingProgress(30);
        
        // Load all sound files
        setLoadingStatus('Loading sound effects...');
        await soundManager.initSounds();
        setLoadingProgress(70);
        
        // Preload background music files
        setLoadingStatus('Loading background music...');
        setLoadingProgress(90);
        
        // Mark audio as initialized
        audioInitializedRef.current = true;
        setLoadingProgress(100);
        
        // Wait a moment to show 100%
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Transition to start screen
        setGameState('start');
      } catch (error) {
        console.error('Error loading assets:', error);
        setLoadingStatus('Error loading assets. Please refresh.');
        // Still allow game to proceed even if audio fails
        setTimeout(() => setGameState('start'), 2000);
      }
    };
    
    if (gameState === 'loading') {
      loadAssets();
    }
  }, [gameState, soundManager]);

  // Load saved player data on mount
  useEffect(() => {
    const savedPlayer = localStorage.getItem('spaceSnakePlayer');
    if (savedPlayer) {
      try {
        const playerData = JSON.parse(savedPlayer);
        setPlayerName(playerData.name);
        setSelectedCharacter(playerData.character);
        setShowLoginScreen(false);
        setShowCharacterSelect(false);
      } catch (error) {
        console.error('Error loading saved player:', error);
      }
    }
  }, []);


    // Start background music when game state changes to playing
  useEffect(() => {
    // Play music when transitioning to playing state (audio already initialized in handleStart)
    if (gameState === 'playing' && audioInitializedRef.current && !musicStartedRef.current) {
      soundManager.playMusic(levelRef.current);
      musicStartedRef.current = true;
    }
    
    // Stop music and reset audio initialized flag only on game over
    if (gameState === 'gameover') {
      musicStartedRef.current = false;
      soundManager.stopMusic();
      audioInitializedRef.current = false;
    }
  }, [gameState, soundManager]);


  // Play new record sound when high score is beaten
  useEffect(() => {
    if (score > 0 && score > highScore && gameState === 'playing') {
      soundManager.playSound('newRecord');
    }
  }, [score, highScore, gameState, soundManager]);

  // Play game over sound when game over state is reached
  useEffect(() => {
    if (gameState === 'gameover') {
      musicStartedRef.current = false;
      soundManager.stopMusic();
      soundManager.playSound('gameOver');
    }
  }, [gameState, soundManager]);

  // Game objects refs
  const playerRef = useRef(null);
  const bossTimerDisplayRef = useRef(60);
  const bossWarningRef = useRef(false);
  const [, forceUpdate] = useState({});
  const levelRef = useRef(1);
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const powerUpsRef = useRef([]);
  const particlesRef = useRef([]);
  const starsRef = useRef([]);

  const enemyBulletsRef = useRef([]);
  const bossRef = useRef(null);
  const bossTimerRef = useRef(0);
  const [bossWarning, setBossWarning] = useState(false);
  const bossDefeatCountRef = useRef({});
  // Touch control refs
  const touchControlRef = useRef({
    active: false,
    touchId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });
  const touchDeltaRef = useRef({ x: 0, y: 0 });


// Power-up types configuration
  const POWER_UP_TYPES = {
    RAPID_FIRE: { 
      name: 'Rapid Fire', 
      color: '#FFD700', 
      icon: '⚡',
      duration: 8000,
      description: 'Faster shooting'
    },
    SHIELD: { 
      name: 'Shield', 
      color: '#00BFFF', 
      icon: '🛡',
      duration: 6000,
      description: 'Temporary invincibility'
    },
    SPREAD_SHOT: { 
      name: 'Spread Shot', 
      color: '#FF69B4', 
      icon: '✦',
      duration: 10000,
      description: 'Triple shot'
    },
    SPEED_BOOST: { 
      name: 'Speed Boost', 
      color: '#00FF7F', 
      icon: '💨',
      duration: 7000,
      description: 'Faster movement'
    },
    BOMB: { 
      name: 'Bomb', 
      color: '#FF4500', 
      icon: '💣',
      duration: 0,
      description: 'Clear screen'
    },
    SUPER: { 
      name: '1 Super', 
      color: '#FF00FF', 
      icon: '⭐',
      duration: 5000,
      description: 'Ultimate power!'
    },
    EXTRA_LIFE: { 
      name: '+1 Life', 
      color: '#FF1493', 
      icon: '❤',
      duration: 0,
      description: 'Extra life'
    }
  };

  // Enemy particle types configuration
  const ENEMY_TYPES = {
    NORMAL: {
      name: 'Normal',
      hp: 1,
      color: '#00BFFF',
      particleCount: 8,
      size: 15,
      speed: 2,
      score: 10,
      dropChance: 0.05,
      dissolveRate: 0.03,
      behavior: 'straight'
    },
    TANK: {
      name: 'Tank',
      hp: 3,
      color: '#FF4500',
      particleCount: 12,
      size: 25,
      speed: 1,
      score: 30,
      dropChance: 0.15,
      dissolveRate: 0.02,
      behavior: 'straight'
    },
    SWARM: {
      name: 'Swarm',
      hp: 1,
      color: '#00FF7F',
      particleCount: 5,
      size: 10,
      speed: 4,
      score: 15,
      dropChance: 0.08,
      dissolveRate: 0.05,
      behavior: 'zigzag'
    },
    GHOST: {
      name: 'Ghost',
      hp: 2,
      color: '#9400D3',
      particleCount: 10,
      size: 20,
      speed: 2.5,
      score: 25,
      dropChance: 0.12,
      dissolveRate: 0.025,
      behavior: 'wave',
      canShoot: false
    },
    SHOOTER: {
      name: 'Shooter',
      hp: 2,
      color: '#FF1493',
      particleCount: 10,
      size: 18,
      speed: 1.5,
      score: 35,
      dropChance: 0.10,
      dissolveRate: 0.025,
      behavior: 'straight',
      canShoot: true,
      fireRate: 2000,
      lastShot: 0
    }
  };


  // Boss stages configuration - static, unchanging design
  const BOSS_STAGES = [
    {
      stage: 1,
      name: 'MEGA COVIDO',
      color: '#FF0000',
      secondaryColor: '#FF4500',
      size: 80,
      hp: 30,
      shape: 'circle',
      attackPattern: 'spiral',
      attackSpeed: 1500,
      bulletColor: '#FF0000',
      description: 'Fires spiraling death from above'
    },
    {
      stage: 2,
      name: 'CYBER WRAITH',
      color: '#0066FF',
      secondaryColor: '#00BFFF',
      size: 90,
      hp: 35,
      shape: 'square',
      attackPattern: 'spread',
      attackSpeed: 1400,
      bulletColor: '#00BFFF',
      description: 'Releases devastating spreads'
    },
    {
      stage: 3,
      name: 'NEON PHANTOM',
      color: '#8B00FF',
      secondaryColor: '#9400D3',
      size: 100,
      hp: 40,
      shape: 'triangle',
      attackPattern: 'homing',
      attackSpeed: 1300,
      bulletColor: '#9400D3',
      description: 'Homing missiles seek their prey'
    },
    {
      stage: 4,
      name: 'SOLAR GUARDIAN',
      color: '#FFD700',
      secondaryColor: '#FFA500',
      size: 85,
      hp: 45,
      shape: 'diamond',
      attackPattern: 'radial',
      attackSpeed: 1200,
      bulletColor: '#FFD700',
      description: '360 degrees of golden destruction'
    },
    {
      stage: 5,
      name: 'TOXIC VIPER',
      color: '#00FF00',
      secondaryColor: '#00FF7F',
      size: 95,
      hp: 50,
      shape: 'hexagon',
      attackPattern: 'wave',
      attackSpeed: 1100,
      bulletColor: '#00FF7F',
      description: 'Wave patterns of toxic energy'
    },
    {
      stage: 6,
      name: 'PLASMA STORM',
      color: '#FF00FF',
      secondaryColor: '#00FFFF',
      size: 110,
      hp: 55,
      shape: 'star',
      attackPattern: 'chaos',
      attackSpeed: 1000,
      bulletColor: '#FF00FF',
      description: 'Unpredictable chaos patterns'
    },
    {
      stage: 7,
      name: 'SHADOW EMPEROR',
      color: '#1a1a1a',
      secondaryColor: '#4a4a4a',
      size: 120,
      hp: 60,
      shape: 'octagon',
      attackPattern: 'laser',
      attackSpeed: 900,
      bulletColor: '#FFFFFF',
      description: 'Devastating laser beams'
    },
    {
      stage: 8,
      name: 'PRISM OVERLORD',
      color: '#FF0000',
      secondaryColor: ['#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
      size: 130,
      hp: 70,
      shape: 'prism',
      attackPattern: 'rainbow',
      attackSpeed: 800,
      bulletColor: 'rainbow',
      description: 'All colors unite in destruction'
    }
  ];

  // Initialize game
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize player
    playerRef.current = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      width: 50,
      height: 60,
      speed: 8,
      hasShield: false,
      rapidFire: false,
      spreadShot: false,
      speedBoost: false,
      superMode: false,
      lastShot: 0,
      fireRate: 200,
      autoFire: true
    };

    // Reset arrays
    bulletsRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    enemyBulletsRef.current = [];
    bossRef.current = null;
    bossTimerRef.current = 0;
    bossTimerDisplayRef.current = 60;
      bossWarningRef.current = false;
      setBossWarning(false);
      forceUpdate({});
      
      // Reset boss defeat counts for new game
      bossDefeatCountRef.current = {};
      
      // Initialize stars background
      starsRef.current = [];
    // Initialize stars background
    starsRef.current = [];
    for (let i = 0; i < 150; i++) {
      starsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random()
      });
    }

    setScore(0);
    setLives(3);
    setLevel(1);
    levelRef.current = 1;
    setActivePowerUps([]);
  }, []);

  // Create enemy particle system
  const createEnemy = (canvasWidth, canvasHeight, currentLevel) => {
    const typeKeys = Object.keys(ENEMY_TYPES);
    const typeKey = typeKeys[Math.floor(Math.random() * typeKeys.length)];
    const type = ENEMY_TYPES[typeKey];
    
    const particles = [];
    const baseX = Math.random() * (canvasWidth - 100) + 50;
    const baseY = -50;
    
    for (let i = 0; i < type.particleCount; i++) {
      const angle = (Math.PI * 2 / type.particleCount) * i + Math.random() * 0.3;
      const radius = type.size * 0.4 + Math.random() * type.size * 0.3;
      particles.push({
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius,
        size: type.size * 0.3 + Math.random() * type.size * 0.2,
        originalSize: type.size * 0.3 + Math.random() * type.size * 0.2
      });
    }
    
    return {
      x: baseX,
      y: baseY,
      type,
      particles,
      hp: type.hp + Math.floor(currentLevel / 3),
      maxHp: type.hp + Math.floor(currentLevel / 3),
      dissolve: 0,
      time: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      lastShot: 0
    };
  };


  // Create boss with specified stage
  const createBoss = (canvasWidth, stageNumber) => {
    const stageIndex = Math.min(stageNumber - 1, BOSS_STAGES.length - 1);
    const stage = BOSS_STAGES[stageIndex];
    const defeatCount = bossDefeatCountRef.current[stageNumber] || 0;
    const isSecondAppearance = defeatCount === 1;
    
    // Create particle system for boss based on shape
    const particles = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const radius = stage.size * 0.5;
      particles.push({
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius,
        size: stage.size * 0.15,
        angle: angle,
        radius: radius
      });
    }
    
    return {
      x: canvasWidth / 2,
      y: -150,
      stage: stage,
      currentStage: stageNumber,
      particles: particles,
      hp: stage.hp,
      maxHp: stage.hp,
      targetY: 80,
      lastShot: 0,
      attackAngle: 0,
      time: 0,
      entering: true,
      phase: 1,
      escaping: false,
      escapeAngle: null,
      isSecondAppearance: isSecondAppearance,
      defeatCount: defeatCount
    };
  };

  // Create dissolving effect
  const createDissolveEffect = (enemy, hitPosition) => {
    enemy.particles.forEach((particle, i) => {
      particlesRef.current.push({
        x: enemy.x + particle.offsetX,
        y: enemy.y + particle.offsetY,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: particle.size,
        color: enemy.type.color,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        isDissolve: true
      });
    });
  };

  // Create explosion particles
  const createExplosion = (x, y, color, count = 20) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        life: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  };

  // Create power-up
  const createPowerUp = (x, y, forceType = null) => {
    const type = forceType || Object.keys(POWER_UP_TYPES)[Math.floor(Math.random() * Object.keys(POWER_UP_TYPES).length)];
    powerUpsRef.current.push({
      x,
      y,
      type,
      ...POWER_UP_TYPES[type],
      size: 25,
      vy: 1.5,
      rotation: 0
    });
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code] = true;
      if (e.key === ' ' && gameState === 'playing') {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Handle touch input for mobile control
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e) => {
      if (gameState !== 'playing') return;
      
      e.preventDefault();
      const touch = e.changedTouches[0];
      
      touchControlRef.current = {
        active: true,
        touchId: touch.identifier,
        targetX: touch.clientX,
        targetY: touch.clientY
      };
      
      // Don't set delta - ship will move toward target position
    };

    const handleTouchMove = (e) => {
      if (!touchControlRef.current.active) return;
      
      e.preventDefault();
      
      // Find the touch that started the control
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchControlRef.current.touchId) {
          touchControlRef.current.targetX = touch.clientX;
          touchControlRef.current.targetY = touch.clientY;
          break;
        }
      }
    };

    const handleTouchEnd = (e) => {
      // Check if our control touch ended
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchControlRef.current.touchId) {
          touchControlRef.current.active = false;
          touchDeltaRef.current = { x: 0, y: 0 };
          break;
        }
      }
    };

    // Add touch event listeners to canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [gameState]);

  // Handle mouse input for desktop testing (simulates touch)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.button !== 0) return; // Only left mouse button
      
      e.preventDefault();
      
      touchControlRef.current = {
        active: true,
        touchId: 'mouse',
        targetX: e.clientX,
        targetY: e.clientY
      };
      
      // Don't set delta - ship will move toward target position
    };

    const handleMouseMove = (e) => {
      if (!touchControlRef.current.active) return;
      if (touchControlRef.current.touchId !== 'mouse') return;
      
      e.preventDefault();
      
      touchControlRef.current.targetX = e.clientX;
      touchControlRef.current.targetY = e.clientY;
    };

    const handleMouseUp = (e) => {
      if (touchControlRef.current.touchId === 'mouse') {
        touchControlRef.current.active = false;
        touchDeltaRef.current = { x: 0, y: 0 };
      }
    };

    // Add mouse event listeners to canvas
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [gameState]);



  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let lastTime = 0;

    const gameLoop = (timestamp) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      update(deltaTime, canvas);
      draw(ctx, canvas);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, level]);

  // Update game state
  const update = (deltaTime, canvas) => {
    const player = playerRef.current;

    // Player movement
    let moveX = 0;
    let moveY = 0;

    if (keysRef.current['arrowleft'] || keysRef.current['a']) {
      moveX = -1;
    }
    if (keysRef.current['arrowright'] || keysRef.current['d']) {
      moveX = 1;
    }
    if (keysRef.current['arrowup'] || keysRef.current['w']) {
      moveY = -1;
    }
    if (keysRef.current['arrowdown'] || keysRef.current['s']) {
      moveY = 1;
    }

    // Touch/Mouse input - make ship follow cursor directly
    if (touchControlRef.current.active && touchControlRef.current.targetX !== undefined) {
      const rect = canvas.getBoundingClientRect();
      
      // Get target position in canvas coordinates
      const targetX = touchControlRef.current.targetX - rect.left;
      const targetY = touchControlRef.current.targetY - rect.top;
      
      // Calculate direction to target
      const dx = targetX - player.x;
      const adjustedTargetY = targetY - 80;
      const dy = adjustedTargetY - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only move if we're not already at the target (with small threshold)
      if (distance > 5) {
        const currentSpeed = player.speedBoost ? player.speed * 1.8 : player.speed;
        
        // Normalize direction and apply speed
        moveX = (dx / distance) * Math.min(1, distance / 10);
        moveY = (dy / distance) * Math.min(1, distance / 10);
        
        // Apply smooth follow movement - increased speed for better responsiveness
        player.x += moveX * currentSpeed * 1.5;
        player.y += moveY * currentSpeed * 1.5;
      }
      
      // Keep player in bounds
      player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
      player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));
    } else {
      // Apply keyboard movement
      // Apply movement with speed boost
      const currentSpeed = player.speedBoost ? player.speed * 1.8 : player.speed;
      player.x += moveX * currentSpeed;
      player.y += moveY * currentSpeed;

      // Keep player in bounds
      player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
      player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));
    }

    // Auto-fire shooting
    const now = Date.now();
    const fireRate = player.superMode ? 50 : (player.rapidFire ? player.fireRate / 2.5 : player.fireRate);
    
    if (player.autoFire || keysRef.current[' ']) {
      if (now - player.lastShot > fireRate) {
        player.lastShot = now;
        
        if (player.superMode) {
          // Super mode:全方位射击
          for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i;
            bulletsRef.current.push({
              x: player.x,
              y: player.y - 30,
              vx: Math.cos(angle) * 12,
              vy: Math.sin(angle) * 12,
              size: 8,
              color: '#FF00FF',
              damage: 5
            });
          }
        } else if (player.spreadShot) {
          soundManager.playSound('shoot');
          bulletsRef.current.push(
            { x: player.x, y: player.y - 30, vx: 0, vy: -10, size: 4, color: '#FFD700', damage: 1 },
            { x: player.x, y: player.y - 30, vx: -2, vy: -9, size: 4, color: '#FFD700', damage: 1 },
            { x: player.x, y: player.y - 30, vx: 2, vy: -9, size: 4, color: '#FFD700', damage: 1 }
          );
        } else {
          soundManager.playSound('shoot');
          bulletsRef.current.push({
            x: player.x,
            y: player.y - 30,
            vx: 0,
            vy: -10,
            size: 5,
            color: '#00FFFF',
            damage: 1
          });
        }
      }
    }

    // Spawn enemies
    if (Math.random() < 0.02 + level * 0.005) {
      if (enemiesRef.current.length < 10 + level * 2) {
        enemiesRef.current.push(createEnemy(canvas.width, canvas.height, level));
      }
    }

    // Update bullets
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      return bullet.y > -20 && bullet.y < canvas.height + 20 && 
             bullet.x > -20 && bullet.x < canvas.width + 20;
    });


    // Boss spawn timer - every 60 seconds
    if (!bossRef.current) {
      bossTimerRef.current += deltaTime;
      
      // Update boss timer display (convert to seconds)
      bossTimerDisplayRef.current = Math.max(0, Math.ceil((60000 - bossTimerRef.current) / 1000));
      
      // Show warning when boss is about to spawn (10 seconds before)
      if (bossTimerDisplayRef.current <= 10 && bossTimerDisplayRef.current > 0) {
        if (!bossWarningRef.current) {
          bossWarningRef.current = true;
          forceUpdate({});
        }
      } else {
        if (bossWarningRef.current) {
          bossWarningRef.current = false;
          forceUpdate({});
        }
      }
      
      if (bossTimerRef.current >= 60000) { // 60 seconds
        bossTimerRef.current = 0;
        setBossWarning(false);
        bossTimerDisplayRef.current = 60;
        bossWarningRef.current = false;
        const bossStage = Math.floor(levelRef.current / 2) + 1;
        bossRef.current = createBoss(canvas.width, bossStage);
        
        // Clear regular enemies when boss spawns
        enemiesRef.current.forEach(enemy => {
          createExplosion(enemy.x, enemy.y, enemy.type.color, 10);
        });
        enemiesRef.current = [];
      }
    }

    // Update enemies
    enemiesRef.current = enemiesRef.current.filter(enemy => {
      enemy.time += deltaTime;
      enemy.wobblePhase += 0.05;

      // Behavior-based movement
      switch (enemy.type.behavior) {
        case 'straight':
          enemy.y += enemy.type.speed;
          break;
        case 'zigzag':
          enemy.y += enemy.type.speed;
          enemy.x += Math.sin(enemy.wobblePhase) * 3;
          break;
        case 'wave':
          enemy.y += enemy.type.speed;
          enemy.x += Math.sin(enemy.time * 0.002) * 2;
          break;
      }

      // Keep in horizontal bounds
      enemy.x = Math.max(enemy.type.size, Math.min(canvas.width - enemy.type.size, enemy.x));

      // Enemy shooting logic
      if (enemy.type.canShoot) {
        const now = Date.now();
        if (now - enemy.lastShot > enemy.type.fireRate) {
          enemy.lastShot = now;
          
          // Calculate angle to player
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const angle = Math.atan2(dy, dx);
          const speed = 5;
          
          enemyBulletsRef.current.push({
            x: enemy.x,
            y: enemy.y + enemy.type.size,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 6,
            color: '#FF1493',
            damage: 1
          });
        }
      }


      // Check if enemy reached bottom
      if (enemy.y > canvas.height + 50) {
        return false;
      }

      // Bullet-enemy collision
      bulletsRef.current.forEach((bullet) => {
        if (bullet.active === false) return;
        
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < enemy.type.size) {
          bullet.active = false;
          soundManager.playSound('enemyHit');
          enemy.hp -= bullet.damage || 1;
          
          // Dissolve effect
          enemy.dissolve += enemy.type.dissolveRate;
          
          // Create small hit particles
          createDissolveEffect(enemy, { x: bullet.x, y: bullet.y });
          createExplosion(bullet.x, bullet.y, '#FFFFFF', 3);

          if (enemy.hp <= 0) {
            createExplosion(enemy.x, enemy.y, enemy.type.color, 30);
            soundManager.playSound('enemyDestroy', calculateExplosionVolume(enemy.type.size));
            setTimeout(() => setScore(prev => prev + enemy.type.score * levelRef.current), 0);
            
            // Drop power-up based on chance
            if (Math.random() < enemy.type.dropChance) {
              // Higher chance for special power-ups from stronger enemies
              let dropType = null;
              if (enemy.type.name === 'Tank' && Math.random() < 0.3) {
                dropType = 'SUPER';
              } else if (enemy.type.name === 'Ghost' && Math.random() < 0.4) {
                dropType = 'EXTRA_LIFE';
              }
              createPowerUp(enemy.x, enemy.y, dropType);
            }
          }
        }
      });

      return enemy.hp > 0;
    });

    // Remove inactive bullets
    bulletsRef.current = bulletsRef.current.filter(b => b.active !== false);

    // Update power-ups
    powerUpsRef.current = powerUpsRef.current.filter(powerUp => {
      powerUp.y += powerUp.vy;
      powerUp.rotation += 0.05;

      // Check player collision
      const dx = player.x - powerUp.x;
      const dy = player.y - powerUp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < player.width / 2 + powerUp.size) {
        applyPowerUp(powerUp.type);
        soundManager.playSound('powerUp');
        createExplosion(powerUp.x, powerUp.y, powerUp.color, 15);
        return false;
      }

      return powerUp.y < canvas.height + 50;
    });


    // Update enemy bullets
    enemyBulletsRef.current = enemyBulletsRef.current.filter(bullet => {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      // Remove if off screen
      if (bullet.x < -20 || bullet.x > canvas.width + 20 || 
          bullet.y < -20 || bullet.y > canvas.height + 20) {
        return false;
      }
      
      // Check collision with player
      if (!player.hasShield && !player.superMode) {
        const dx = player.x - bullet.x;
        const dy = player.y - bullet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < player.width / 2 + bullet.size) {
          createExplosion(player.x, player.y, '#FF0000', 30);
          setTimeout(() => {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              }
              return newLives;
            });
          }, 0);
          player.hasShield = true;
          setTimeout(() => {
            if (playerRef.current) playerRef.current.hasShield = false;
          }, 2000);
          return false;
        }
      }
      
      return true;
    });
    
    // Check player-enemy collision (if no shield)
    if (!player.hasShield && !player.superMode) {
      enemiesRef.current.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < enemy.type.size + player.width / 3) {
          createExplosion(player.x, player.y, '#FF0000', 30);
          setTimeout(() => {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              }
              return newLives;
            });
          }, 0);
          player.hasShield = true;
          setTimeout(() => {
            if (playerRef.current) playerRef.current.hasShield = false;
          }, 2000);
          enemy.hp = 0;
        }
      });
    }

    // Update boss
    if (bossRef.current) {
      const boss = bossRef.current;
      boss.time += deltaTime;
      boss.attackAngle += 0.05;
      
      // Handle escaping behavior
      if (boss.escaping) {
        // Boss flees in straight line toward player's LAST KNOWN POSITION
        if (!boss.escapeAngle) {
          // Calculate escape angle ONCE when escape starts
          const player = playerRef.current;
          const dx = player.x - boss.x;
          const dy = player.y - boss.y;
          boss.escapeAngle = Math.atan2(dy, dx);
        }
        
        const escapeSpeed = 12;
        boss.x += Math.cos(boss.escapeAngle) * escapeSpeed;
        boss.y += Math.sin(boss.escapeAngle) * escapeSpeed;
        
        // Remove boss when off screen
        if (boss.y > canvas.height + 200 || boss.x < -200 || boss.x > canvas.width + 200) {
          const stageKey = boss.currentStage;
          bossDefeatCountRef.current[stageKey] = (bossDefeatCountRef.current[stageKey] || 0) + 1;
          bossRef.current = null;
        }
        return;
      }

      // Enter animation
      if (boss.entering) {
        boss.y += 2;
        if (boss.y >= boss.targetY) {
          boss.y = boss.targetY;
          boss.entering = false;
        }
      } else {
        // Idle floating
        boss.y = boss.targetY + Math.sin(boss.time * 0.002) * 10;
        boss.x = canvas.width / 2 + Math.cos(boss.time * 0.001) * 20;
      }
      
      // Boss attack patterns
      const now = Date.now();
      if (now - boss.lastShot > boss.stage.attackSpeed) {
        boss.lastShot = now;
        
        switch (boss.stage.attackPattern) {
          case 'spiral':
            // Spiral pattern
            for (let i = 0; i < 8; i++) {
              const angle = boss.attackAngle + (Math.PI * 2 / 8) * i;
              enemyBulletsRef.current.push({
                x: boss.x,
                y: boss.y + boss.stage.size * 0.5,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                size: 8,
                color: boss.stage.bulletColor,
                damage: 2
              });
            }
            break;
            
          case 'spread':
            // Spread shot
            for (let i = -3; i <= 3; i++) {
              enemyBulletsRef.current.push({
                x: boss.x,
                y: boss.y + boss.stage.size * 0.5,
                vx: i * 1.5,
                vy: 5,
                size: 7,
                color: boss.stage.bulletColor,
                damage: 1
              });
            }
            break;
            
          case 'homing':
            // Homing missiles
            const dx = player.x - boss.x;
            const dy = player.y - boss.y;
            const angle = Math.atan2(dy, dx);
            for (let i = 0; i < 3; i++) {
              enemyBulletsRef.current.push({
                x: boss.x + (i - 1) * 30,
                y: boss.y + boss.stage.size * 0.5,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 10,
                color: boss.stage.bulletColor,
                damage: 2,
                homing: true
              });
            }
            break;
            
          case 'radial':
            // 360 degree radial burst
            for (let i = 0; i < 16; i++) {
              const angle = (Math.PI * 2 / 16) * i + boss.attackAngle;
              enemyBulletsRef.current.push({
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                size: 6,
                color: boss.stage.bulletColor,
                damage: 1
              });
            }
            break;
            
          case 'wave':
            // Wave pattern
            for (let wave = 0; wave < 3; wave++) {
              setTimeout(() => {
                for (let i = -4; i <= 4; i++) {
                  enemyBulletsRef.current.push({
                    x: boss.x + i * 15,
                    y: boss.y + boss.stage.size * 0.5,
                    vx: Math.sin(boss.attackAngle + i * 0.3) * 3,
                    vy: 4,
                    size: 6,
                    color: boss.stage.bulletColor,
                    damage: 1
                  });
                }
              }, wave * 200);
            }
            break;
            
          case 'chaos':
            // Random chaotic pattern
            for (let i = 0; i < 12; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 3 + Math.random() * 4;
              enemyBulletsRef.current.push({
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 7,
                color: boss.stage.bulletColor,
                damage: 1
              });
            }
            break;
            
          case 'laser':
            // Laser beam (series of fast bullets)
            for (let i = 0; i < 20; i++) {
              enemyBulletsRef.current.push({
                x: boss.x + (Math.random() - 0.5) * 20,
                y: boss.y + boss.stage.size * 0.5,
                vx: (Math.random() - 0.5) * 2,
                vy: 10,
                size: 4,
                color: boss.stage.bulletColor,
                damage: 1
              });
            }
            break;
            
          case 'rainbow':
            // Rainbow pattern - all colors
            const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
            for (let i = 0; i < 14; i++) {
              const angle = (Math.PI * 2 / 14) * i;
              const color = rainbowColors[i % rainbowColors.length];
              enemyBulletsRef.current.push({
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                size: 7,
                color: color,
                damage: 1
              });
            }
            break;
        }
      }
      
      // Check bullet collision with boss
      bulletsRef.current.forEach((bullet) => {
        if (bullet.active === false) return;
        
        const dx = bullet.x - boss.x;
        const dy = bullet.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < boss.stage.size) {
          bullet.active = false;
          boss.hp -= bullet.damage || 1;
          
          createExplosion(bullet.x, bullet.y, '#FFFFFF', 5);
          
          if (boss.hp <= 0) {
            // Boss defeated!
            setTimeout(() => setScore(prev => prev + boss.stage.score * 10), 0);
            
            // Check if this is the 2nd appearance - if so, permanent defeat
            if (boss.defeatCount >= 1) {
              // Permanently defeated
              createExplosion(boss.x, boss.y, boss.stage.color, 100);
              soundManager.playSound('bossDead', calculateExplosionVolume(boss.stage.size, true));
              
              // Drop power-ups
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  createPowerUp(boss.x + (Math.random() - 0.5) * 100, boss.y + (Math.random() - 0.5) * 50, 'SUPER');
                }, i * 300);
              }
              
              // Reset boss timer
              bossTimerRef.current = 0;
              bossTimerDisplayRef.current = 60;
              bossWarningRef.current = false;
              forceUpdate({});
              
              // Clear defeat count for next boss
              delete bossDefeatCountRef.current[boss.currentStage];
              bossRef.current = null;
            } else {
              // First defeat - escape!
              boss.escaping = true;
              boss.hp = 1; // Keep it alive during escape
              createExplosion(boss.x, boss.y, boss.stage.color, 50); // Smaller explosion
            }
          }
        }
      });
    }

    // Update particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= particle.decay;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      if (particle.isDissolve) {
        particle.size *= 0.95;
      }
      
      return particle.life > 0 && particle.size > 0.5;
    });

    // Update stars
    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
      star.brightness += (Math.random() - 0.5) * 0.1;
      star.brightness = Math.max(0.3, Math.min(1, star.brightness));
    });

    // Check level progression
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > levelRef.current) {
      levelRef.current = newLevel;
      soundManager.playMusic(newLevel);
      setTimeout(() => setLevel(newLevel), 0);
      setTimeout(() => forceUpdate({}), 0);
    }
  };
  // Apply power-up effect
  const applyPowerUp = (type) => {
    const player = playerRef.current;
    const config = POWER_UP_TYPES[type];

    switch (type) {
      case 'RAPID_FIRE':
        player.rapidFire = true;
        addPowerUpIndicator(config);
        setTimeout(() => { player.rapidFire = false; }, config.duration);
        break;
      case 'SHIELD':
        player.hasShield = true;
        addPowerUpIndicator(config);
        setTimeout(() => { player.hasShield = false; }, config.duration);
        break;
      case 'SPREAD_SHOT':
        player.spreadShot = true;
        addPowerUpIndicator(config);
        setTimeout(() => { player.spreadShot = false; }, config.duration);
        break;
      case 'SPEED_BOOST':
        player.speedBoost = true;
        addPowerUpIndicator(config);
        setTimeout(() => { player.speedBoost = false; }, config.duration);
        break;
      case 'BOMB':
        enemiesRef.current.forEach(enemy => {
          createExplosion(enemy.x, enemy.y, enemy.type.color, 20);
          setScore(prev => prev + enemy.type.score);
        });
        enemiesRef.current = [];
        break;
      case 'SUPER':
        player.superMode = true;
        addPowerUpIndicator(config);
        setTimeout(() => { player.superMode = false; }, config.duration);
        break;
      case 'EXTRA_LIFE':
        setLives(prev => Math.min(prev + 1, 9));
        break;
    }
  };

  // Add power-up indicator
  const addPowerUpIndicator = (config) => {
    setActivePowerUps(prev => {
      const existing = prev.find(p => p.name === config.name);
      if (existing) {
        return prev.map(p => p.name === config.name ? { ...p, endTime: Date.now() + config.duration } : p);
      }
      return [...prev, { ...config, endTime: Date.now() + config.duration }];
    });

    setTimeout(() => {
      setActivePowerUps(prev => prev.filter(p => p.endTime > Date.now()));
    }, config.duration);
  };

  // Draw game
  const draw = (ctx, canvas) => {
    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    starsRef.current.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.fill();
    });

    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw power-ups
    powerUpsRef.current.forEach(powerUp => {
      ctx.save();
      ctx.translate(powerUp.x, powerUp.y);
      ctx.rotate(powerUp.rotation);

      ctx.shadowBlur = 20;
      ctx.shadowColor = powerUp.color;

      ctx.beginPath();
      ctx.arc(0, 0, powerUp.size, 0, Math.PI * 2);
      ctx.fillStyle = powerUp.color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(0, 0, powerUp.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = powerUp.color;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = '20px TitleFont, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(powerUp.icon, 0, 0);

      ctx.restore();
    });

    // Draw enemies as particle systems
    enemiesRef.current.forEach(enemy => {
      const dissolveFactor = Math.max(0, 1 - enemy.dissolve);
      
      enemy.particles.forEach((particle, i) => {
        const px = enemy.x + particle.offsetX;
        const py = enemy.y + particle.offsetY;
        const size = particle.size * dissolveFactor * (1 - enemy.dissolve * 0.5);
        
        if (size > 0.5) {
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          
          // Gradient for particle
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, size);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.3, enemy.type.color);
          gradient.addColorStop(1, 'rgba(0, 0, 50, 0.3)');
          
          ctx.fillStyle = gradient;
          ctx.globalAlpha = dissolveFactor * 0.8;
          ctx.fill();
          ctx.globalAlpha = 1;
          
          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = enemy.type.color;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // Health bar for multi-HP enemies
      if (enemy.maxHp > 1 && enemy.hp < enemy.maxHp) {
        const barWidth = enemy.type.size * 2;
        const barHeight = 5;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - enemy.type.size - 10;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = enemy.hp / enemy.maxHp;
        ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
      }
    });


    // Draw boss
    if (bossRef.current) {
      const boss = bossRef.current;
      
      ctx.save();
      ctx.translate(boss.x, boss.y);
      
      // Glow effect based on HP
      const glowIntensity = 0.3 + (boss.hp / boss.maxHp) * 0.7;
      ctx.shadowBlur = 40 * glowIntensity;
      ctx.shadowColor = boss.stage.color;
      
      // Enhanced glow for second appearance
      if (boss.isSecondAppearance) {
        // Pulsing aura effect
        const pulsePhase = Date.now() * 0.003;
        const pulseSize = 1 + Math.sin(pulsePhase) * 0.3;
        const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, boss.stage.size * 2 * pulseSize);
        auraGradient.addColorStop(0, boss.stage.color + '40'); // 25% opacity
        auraGradient.addColorStop(0.5, boss.stage.color + '20'); // 12.5% opacity
        auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, boss.stage.size * 2 * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = auraGradient;
        ctx.fill();
        
        // Add second color layer for extra intensity
        const pulsePhase2 = Date.now() * 0.005;
        const pulseSize2 = 1 + Math.sin(pulsePhase2) * 0.2;
        const auraGradient2 = ctx.createRadialGradient(0, 0, 0, 0, 0, boss.stage.size * 1.5 * pulseSize2);
        auraGradient2.addColorStop(0, '#FFFFFF30'); // White glow
        auraGradient2.addColorStop(0.7, boss.stage.secondaryColor + '20');
        auraGradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(0, 0, boss.stage.size * 1.5 * pulseSize2, 0, Math.PI * 2);
        ctx.fillStyle = auraGradient2;
        ctx.fill();
      }
      
      // Draw boss shape based on type
      boss.particles.forEach((particle, i) => {
        const px = particle.offsetX;
        const py = particle.offsetY;
        const pulseSize = 1 + Math.sin(boss.time * 0.005 + i * 0.3) * 0.1;
        const size = particle.size * pulseSize;
        
        // Particle gradient
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.4, boss.stage.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Draw boss core based on shape
      ctx.fillStyle = boss.stage.secondaryColor;
      ctx.globalAlpha = 0.6;
      
      switch (boss.stage.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, boss.stage.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          const sqSize = boss.stage.size * 0.5;
          ctx.fillRect(-sqSize, -sqSize, sqSize * 2, sqSize * 2);
          break;
          
        case 'triangle':
          ctx.beginPath();
          const triSize = boss.stage.size * 0.6;
          ctx.moveTo(0, -triSize);
          ctx.lineTo(-triSize, triSize);
          ctx.lineTo(triSize, triSize);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'diamond':
          ctx.beginPath();
          const diaSize = boss.stage.size * 0.5;
          ctx.moveTo(0, -diaSize * 1.5);
          ctx.lineTo(-diaSize, 0);
          ctx.lineTo(0, diaSize * 1.5);
          ctx.lineTo(diaSize, 0);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'hexagon':
          ctx.beginPath();
          const hexSize = boss.stage.size * 0.5;
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
            const x = Math.cos(angle) * hexSize;
            const y = Math.sin(angle) * hexSize;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'star':
          ctx.beginPath();
          const starOuter = boss.stage.size * 0.6;
          const starInner = boss.stage.size * 0.3;
          for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i - Math.PI / 2;
            const radius = i % 2 === 0 ? starOuter : starInner;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'octagon':
          ctx.beginPath();
          const octSize = boss.stage.size * 0.5;
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i - Math.PI / 2;
            const x = Math.cos(angle) * octSize;
            const y = Math.sin(angle) * octSize;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'prism':
          // Rainbow prism
          const prismColors = boss.stage.secondaryColor;
          if (Array.isArray(prismColors)) {
            prismColors.forEach((color, i) => {
              const angle = (Math.PI * 2 / prismColors.length) * i;
              const size = boss.stage.size * 0.3;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(
                Math.cos(angle) * size * 0.5,
                Math.sin(angle) * size * 0.5,
                size * 0.8,
                0, Math.PI * 2
              );
              ctx.fill();
            });
          }
          break;
      }
      
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      // Boss name and stage
      ctx.font = 'bold 16px TitleFont, Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 10;
      ctx.shadowColor = boss.stage.color;
      ctx.fillText(boss.stage.name, 0, -boss.stage.size - 20);
      ctx.shadowBlur = 0;
      
      // Boss health bar
      const hpBarWidth = 200;
      const hpBarHeight = 12;
      const hpBarX = -hpBarWidth / 2;
      const hpBarY = boss.stage.size + 20;
      
      // Health bar background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
      
      // Health bar fill
      const hpPercent = boss.hp / boss.maxHp;
      const hpGradient = ctx.createLinearGradient(hpBarX, 0, hpBarX + hpBarWidth, 0);
      hpGradient.addColorStop(0, '#FF0000');
      hpGradient.addColorStop(0.5, '#FFFF00');
      hpGradient.addColorStop(1, '#00FF00');
      ctx.fillStyle = hpGradient;
      ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
      
      // Health bar border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
      
      ctx.restore();
    }

    // Draw bullets
    bulletsRef.current.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fillStyle = bullet.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = bullet.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw enemy bullets
    enemyBulletsRef.current.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
      ctx.fillStyle = bullet.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = bullet.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw player
    const player = playerRef.current;
    if (player) {
      ctx.save();
      ctx.translate(player.x, player.y);

      // Super mode aura
      if (player.superMode) {
        const pulseSize = 60 + Math.sin(Date.now() * 0.01) * 10;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Shield effect
      if (player.hasShield) {
        ctx.beginPath();
        ctx.arc(0, 0, player.width * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 191, 255, 0.8)';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00BFFF';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Ship body
      ctx.beginPath();
      ctx.moveTo(0, -player.height / 2);
      ctx.lineTo(-player.width / 2, player.height / 2);
      ctx.lineTo(-player.width / 4, player.height / 3);
      ctx.lineTo(0, player.height / 2);
      ctx.lineTo(player.width / 4, player.height / 3);
      ctx.lineTo(player.width / 2, player.height / 2);
      ctx.closePath();

      const shipGradient = ctx.createLinearGradient(0, -player.height / 2, 0, player.height / 2);
      shipGradient.addColorStop(0, '#00FFFF');
      shipGradient.addColorStop(0.5, '#0080FF');
      shipGradient.addColorStop(1, '#0040AA');
      ctx.fillStyle = shipGradient;
      ctx.fill();

      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Engine glow
      ctx.beginPath();
      ctx.arc(0, player.height / 2, 10, 0, Math.PI * 2);
      const engineGradient = ctx.createRadialGradient(0, player.height / 2, 0, 0, player.height / 2, 10);
      engineGradient.addColorStop(0, '#FF9900');
      engineGradient.addColorStop(0.5, '#FF6600');
      engineGradient.addColorStop(1, 'rgba(255, 102, 0, 0)');
      ctx.fillStyle = engineGradient;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#FF6600';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cockpit
      ctx.beginPath();
      ctx.arc(0, -5, 10, 0, Math.PI * 2);
      const cockpitGradient = ctx.createRadialGradient(0, -5, 0, 0, -5, 10);
      cockpitGradient.addColorStop(0, '#FFFFFF');
      cockpitGradient.addColorStop(1, '#00FFFF');
      ctx.fillStyle = cockpitGradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00FFFF';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
      
      // Draw touch control indicator (invisible circle that becomes visible when touched)
      if (touchControlRef.current.active) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        
        // Draw the touch zone (3x ship size = 150px diameter, 75px radius)
        const touchRadius = player.width * 3 / 2; // 75px
        
        // Outer circle - touch zone boundary
        ctx.beginPath();
        ctx.arc(player.x, player.y, touchRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        
        // Draw direction indicator from center to touch position
        if (touchDeltaRef.current.x !== 0 || touchDeltaRef.current.y !== 0) {
          const indicatorLength = touchRadius * 0.8;
          const angle = Math.atan2(touchDeltaRef.current.y, touchDeltaRef.current.x);
          
          ctx.beginPath();
          ctx.moveTo(player.x, player.y);
          ctx.lineTo(
            player.x + Math.cos(angle) * indicatorLength,
            player.y + Math.sin(angle) * indicatorLength
          );
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.stroke();
          
          // Draw touch point
          ctx.beginPath();
          ctx.arc(
            player.x + Math.cos(angle) * indicatorLength,
            player.y + Math.sin(angle) * indicatorLength,
            8,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = '#00FFFF';
          ctx.fill();
        }
        
        ctx.restore();
      }
    }
  };

  // Start game
  const handleStart = () => {
    // Initialize audio on user interaction (click)
    if (!audioInitializedRef.current) {
      soundManager.initAudio();
      soundManager.initSounds();
      audioInitializedRef.current = true;
    }
    
    // Reset all refs before starting
    bossRef.current = null;
    bossTimerRef.current = 0;
    bossTimerDisplayRef.current = 60;
    bossWarningRef.current = false;
    bossDefeatCountRef.current = {};
    
    initGame();
    soundManager.playSound('uiClick');
    setGameState('playing');
  };

  // Restart game
  const handleRestart = () => {
    // Reset all refs before restarting
    bossRef.current = null;
    bossTimerRef.current = 0;
    bossTimerDisplayRef.current = 60;
    bossWarningRef.current = false;
    bossDefeatCountRef.current = {};
    
    initGame();
    soundManager.playSound('uiClick');
    setGameState('playing');
  };


  // Save player data to localStorage
  const savePlayerData = (name, character) => {
    const playerData = { name, character };
    localStorage.setItem('spaceSnakePlayer', JSON.stringify(playerData));
  };

  // Handle player login
  const handlePlayerLogin = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      setShowLoginScreen(false);
      setShowCharacterSelect(true);
    }
  };

  // Handle character selection
  const handleCharacterSelect = (characterId) => {
    setSelectedCharacter(characterId);
    savePlayerData(playerName, characterId);
    setShowCharacterSelect(false);
  };

  // Render UI
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* HUD */}
      {gameState === 'playing' && (
        <>
          {/* Centered Boss Warning */}
          {bossWarningRef.current && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-xl font-bold text-red-500 animate-pulse title-text" style={{ textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 60px #ff0000' }}>
                  ⚠️ BOSS INCOMING! ⚠️
                </div>
                <div className="text-xl text-yellow-400 font-bold mt-4">
                  Prepare for battle!
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className="text-white space-y-2">
              <div className="text-sm font-bold">Score: <span className="numbers-text">{score}</span></div>
              <div className="text-sm">High Score: <span className="numbers-text">{highScore}</span></div>
              <div className="text-sm">Level: <span className="numbers-text">{level}</span></div>
              <div className="text-sm">Lives: {'❤️'.repeat(lives)}</div>
            </div>

            <div className="text-white text-right">
              {!bossRef.current && (
                <div className="text-sm font-bold">
                  ⏱️ <span className="numbers-text">{bossTimerDisplayRef.current}</span>s
                </div>
              )}
              {bossRef.current && (
                <div className="text-sm text-yellow-400 font-bold title-text">
                  {bossRef.current.stage.name}
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap max-w-md justify-end">
              {activePowerUps.map((powerUp, index) => (
                <div
                  key={index}
                  className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs border border-white/20"
                >
                  <span>{powerUp.icon}</span>
                  <span className="ml-0.5">{powerUp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Login Screen */}
      {showLoginScreen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl max-w-md">
            <h1 className="title-text text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              SPACE SNAKE
            </h1>
            <p className="text-gray-300">Enter your pilot name:</p>
            <div className="space-y-4">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && playerName.trim()) {
                    e.preventDefault();
                    setShowLoginScreen(false);
                    setShowCharacterSelect(true);
                  }
                }}
                placeholder="Pilot Name"
                maxLength={15}
                className="w-full px-4 py-3 bg-slate-800 text-white text-center rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                autoFocus
              />
              <button
                onClick={() => {
                  if (playerName.trim()) {
                    setShowLoginScreen(false);
                    setShowCharacterSelect(true);
                  }
                }}
                className="title-text w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!playerName.trim()}
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Selection Screen */}
      {showCharacterSelect && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="text-center space-y-6 p-8 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl max-w-4xl w-full">
            <h2 className="title-text text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              SELECT YOUR SHIP
            </h2>
            <p className="text-gray-300">Choose your pilot and ship:</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.values(playerConfigs).map((config) => (
                <button
                  key={config.id}
                  onClick={() => handleCharacterSelect(config.id)}
                  className={`group relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedCharacter === config.id
                      ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/50'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                  }`}
                >
                  {/* Ship Image */}
                  <div className="relative w-32 h-32 mx-auto mb-3 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={config.shipImage}
                      alt={`${config.name} Ship`}
                      className="w-full h-full object-contain"
                      style={{ filter: 'drop-shadow(0 0 10px ' + config.glowColor + ')' }}
                    />
                  </div>

                  {/* Player Avatar */}
                  <div className="relative w-12 h-12 mx-auto mb-2 overflow-hidden rounded-lg bg-slate-900 border-2 border-slate-600">
                    <img
                      src="/src/assets/player/ready.png"
                      alt={config.name}
                      className="absolute"
                      style={{
                        width: '256px',
                        height: '256px',
                        left: `${config.avatarPosition.x * -128}px`,
                        top: `${config.avatarPosition.y * -128}px`,
                      }}
                    />
                  </div>

                  {/* Character Info */}
                  <div className="text-center">
                    <div className="text-2xl mb-1">{config.emoji}</div>
                    <h3 className="text-white font-bold text-sm" style={{ color: config.color }}>
                      {config.name}
                    </h3>
                    <p className="text-xs text-gray-400 capitalize">{config.shipType}</p>
                  </div>

                  {/* Selection Indicator */}
                  {selectedCharacter === config.id && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setShowCharacterSelect(false)}
                className="px-6 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-all border border-slate-600"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl max-w-lg">
            <h1 className="title-text text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              SPACE SNAKE
            </h1>
            
            {/* Character Preview */}
            <div className="flex items-center justify-center gap-4 bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-900 border-2 border-slate-600 shadow-lg">
                <img
                  src="/src/assets/player/ready.png"
                  alt={playerConfigs[selectedCharacter]?.name}
                  className="absolute"
                  style={{
                    width: '256px',
                    height: '256px',
                    left: `${(playerConfigs[selectedCharacter]?.avatarPosition.x ?? 0) * -128}px`,
                    top: `${(playerConfigs[selectedCharacter]?.avatarPosition.y ?? 0) * -128}px`,
                  }}
                />
              </div>
              <div className="text-left">
                <p className="text-gray-400 text-xs">PILOT</p>
                <p className="text-white font-bold">{playerName}</p>
                <p className="text-lg font-bold" style={{ color: playerConfigs[selectedCharacter]?.color ?? '#00FFFF' }}>
                  {playerConfigs[selectedCharacter]?.emoji} {playerConfigs[selectedCharacter]?.name ?? 'Select Character'}
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm">
              Destroy particle enemies and collect power-ups!
            </p>
            
            
            {highScore > 0 && (
              <div className="text-xl text-yellow-400 font-bold">🏆 High Score: <span className="numbers-text title-text">{highScore}</span></div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-left bg-slate-800/50 p-4 rounded-lg">
              <div className="text-cyan-400">⚡ Rapid Fire</div>
              <div className="text-gray-400">Faster shooting</div>
              
              <div className="text-blue-400">🛡 Shield</div>
              <div className="text-gray-400">Temporary invincibility</div>
              
              <div className="text-pink-400">✦ Spread Shot</div>
              <div className="text-gray-400">Triple bullets</div>
              
              <div className="text-green-400">💨 Speed Boost</div>
              <div className="text-gray-400">Faster movement</div>
              
              <div className="text-orange-400">💣 Bomb</div>
              <div className="text-gray-400">Clear screen</div>

              <div className="text-purple-400">⭐ 1 Super</div>
              <div className="text-gray-400">360 ultimate attack</div>

              <div className="text-pink-400">❤ +1 Life</div>
              <div className="text-gray-400">Extra life</div>
            </div>

            <div className="text-gray-400 text-sm space-y-1">
              <div>🎮 WASD or Arrow Keys to move</div>
              <div>🖱️ Mouse click & drag to move</div>
              <div>📱 Touch & drag on mobile devices</div>
              <div>🔫 Auto-fires or press SPACE to shoot</div>
              <div className="text-xs mt-2 text-gray-500">
                💡 Tip: Destroy Tanks for Super, Ghosts for Extra Lives!
              </div>
            </div>

            <button
              onClick={handleStart}
              className="title-text px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 shadow-lg"
            >
              START GAME
            </button>
            
              <button
                onClick={() => setShowCharacterSelect(true)}
                className="px-8 py-3 bg-slate-700 text-white text-sm font-bold rounded-lg hover:bg-slate-600 transition-all border border-slate-600"
              >
                🎨 Change Character
              </button>

          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-red-500/30 shadow-2xl">
            <h2 className="title-text text-5xl font-bold text-red-500">GAME OVER</h2>
            <div className="text-xl text-white">Final Score: <span className="numbers-text">{score}</span></div>
            {score >= highScore && score > 0 ? (
              <div className="text-xl text-yellow-400 title-text">🏆 NEW HIGH SCORE! 🏆: <span className="numbers-text">{score}</span></div>
            ) : (
              <div className="text-xl text-gray-400">High Score: <span className="numbers-text">{highScore}</span></div>
            )}
            
            <button
              onClick={handleRestart}
              className="title-text px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-bold rounded-lg hover:from-red-400 hover:to-orange-500 transition-all transform hover:scale-105 shadow-lg"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Playing HUD - Player Details with Avatar */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none">
          <div className="flex justify-between items-start max-w-7xl mx-auto">
            {/* Left: Player Info with Avatar */}
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-3 border border-cyan-500/30 shadow-2xl">
              <div className="flex items-center gap-4">
                {/* Player Avatar */}
                <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800 border-2 border-slate-600 shadow-lg">
                  <img
                    src="/src/assets/player/ready.png"
                    alt={playerConfigs[selectedCharacter]?.name}
                    className="absolute"
                    style={{
                      width: '256px',
                      height: '256px',
                      left: `${(playerConfigs[selectedCharacter]?.avatarPosition.x ?? 0) * -128}px`,
                      top: `${(playerConfigs[selectedCharacter]?.avatarPosition.y ?? 0) * -128}px`,
                    }}
                  />
                </div>
                
                {/* Player Info */}
                <div className="text-left">
                  <p className="text-white font-bold text-lg leading-tight">{playerName}</p>
                  <p className="text-sm font-bold" style={{ color: playerConfigs[selectedCharacter]?.color ?? '#00FFFF' }}>
                    {playerConfigs[selectedCharacter]?.name ?? 'Pilot'}
                  </p>
                </div>

                {/* Character Emoji Badge */}
                <div className="bg-slate-800 rounded-full w-12 h-12 flex items-center justify-center border-2 border-slate-600 shadow-lg">
                  <span className="text-2xl">{playerConfigs[selectedCharacter]?.emoji ?? '🚀'}</span>
                </div>
              </div>
            </div>

            {/* Center: Score & Level */}
            <div className="flex gap-3">
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl px-6 py-3 border border-yellow-500/30 shadow-2xl text-center">
                <p className="text-yellow-400 font-bold text-4xl title-text leading-none">{score}</p>
                <p className="text-gray-400 text-xs mt-1">SCORE</p>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl px-6 py-3 border border-purple-500/30 shadow-2xl text-center">
                <p className="text-purple-400 font-bold text-3xl title-text leading-none">{level}</p>
                <p className="text-gray-400 text-xs mt-1">LEVEL</p>
              </div>
            </div>

            {/* Right: Lives & Power-ups */}
            <div className="flex gap-3">
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-red-500/30 shadow-2xl flex items-center gap-2">
                <span className="text-red-400 text-2xl">❤️</span>
                <span className="text-white font-bold text-2xl">{lives}</span>
              </div>
              {activePowerUps.length > 0 && (
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl px-4 py-3 border border-green-500/30 shadow-2xl flex items-center gap-2">
                  <span className="text-green-400 text-2xl">⚡</span>
                  <span className="text-white font-bold text-xl">{activePowerUps.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Canvas for the game */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

    </div>
  );
};

export default SpaceSnakeGame;




















