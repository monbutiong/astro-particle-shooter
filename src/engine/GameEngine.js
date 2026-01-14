/**
 * Space Snake Game Engine
 * 
 * Pure JavaScript game engine separated from React.
 * Follows "THE RIGHT Techniques for Games in React"
 * 
 * Architecture:
 * - NO React state updates in game loop
 * - All game state in plain JavaScript objects
 * - Canvas rendering only
 * - Object pooling for performance
 * - requestAnimationFrame for smooth 60 FPS
 */

// ==================== GAME CONFIGURATION ====================
const GAME_CONFIG = {
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  SPAWN_RATE: 1500,
  BOSS_SPAWN_LEVEL: 5,
  DIFFICULTY_SCALE: 1.1
};

// ==================== OBJECT POOLS ====================
class ObjectPool {
  constructor(createFn, initialSize = 20) {
    this.createFn = createFn;
    this.pool = [];
    this.active = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }
  
  get() {
    const obj = this.pool.pop() || this.createFn();
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(obj);
    }
  }
  
  releaseAll() {
    while (this.active.length > 0) {
      this.pool.push(this.active.pop());
    }
  }
  
  forEach(fn) {
    this.active.forEach(fn);
  }
}

// ==================== ASSET LOADER ====================
class AssetLoader {
  constructor() {
    this.images = new Map();
    this.sounds = new Map();
    this.loadedCount = 0;
    this.totalCount = 0;
    this.onProgress = null;
  }
  
  loadImage(key, src) {
    this.totalCount++;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loadedCount++;
        this.onProgress?.(this.loadedCount, this.totalCount);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
  
  getImage(key) {
    return this.images.get(key);
  }
  
  async preloadAssets(imageMap) {
    const promises = Object.entries(imageMap).map(([key, src]) => 
      this.loadImage(key, src)
    );
    await Promise.all(promises);
  }
}

// ==================== ENEMY TYPES ====================

const ENEMY_TYPES = {
  // Shooting enemies - bright dark orange color
    SHOOTING_1: {
      color: '#FF6B00', // Bright dark orange
      size: 60, // Width in pixels (maintains aspect ratio like player)
      speed: 3.0, // Increased from 1.5 to 3.0
      hp: 1,
      points: 100,
      canShoot: true,
    shootRate: 3000, // 3 seconds base
    imageKey: 'enemy-1'
  },
    SHOOTING_2: {
      color: '#FF6B00', // Bright dark orange
      size: 60, // Width in pixels (maintains aspect ratio like player)
      speed: 2.5, // Increased from 1.2 to 2.5
      hp: 3,
      points: 200,
      canShoot: true,
    shootRate: 3000, // 3 seconds base
    imageKey: 'enemy-2'
  },
    SHOOTING_3: {
      color: '#FF6B00', // Bright dark orange
      size: 60, // Width in pixels (maintains aspect ratio like player)
      speed: 3.5, // Increased from 1.8 to 3.5
      hp: 2,
      points: 150,
      canShoot: true,
    shootRate: 3000, // 3 seconds base
    imageKey: 'enemy-3'
  },
    SHOOTING_4: {
      color: '#FF6B00', // Bright dark orange
      size: 60, // Width in pixels (maintains aspect ratio like player)
      speed: 4.0, // Increased from 2.0 to 4.0
      hp: 2,
      points: 180,
      canShoot: true,
    shootRate: 3000, // 3 seconds base
    imageKey: 'enemy-4'
  },
    SHOOTING_5: {
      color: '#FF6B00', // Bright dark orange
      size: 60, // Width in pixels (maintains aspect ratio like player)
      speed: 2.0, // Increased from 1.0 to 2.0
      hp: 4,
      points: 250,
      canShoot: true,
    shootRate: 3000, // 3 seconds base
    imageKey: 'enemy-5'
  },
  // Non-shooting enemies (steroids) - different speeds for variety
  STEROIDS_1: { // Fast and small
    color: '#44AAFF',
    size: 10,
    speed: 3.5, // Very fast
    hp: 1,
    points: 50,
    canShoot: false
  },
  STEROIDS_2: { // Slow and big
    color: '#44AAFF',
    size: 30,
    speed: 0.8, // Slow
    hp: 4,
    points: 150,
    canShoot: false
  },
  STEROIDS_3: { // Medium speed
    color: '#44AAFF',
    size: 18,
    speed: 2.0, // Medium
    hp: 2,
    points: 80,
    canShoot: false
  },
  STEROIDS_4: { // Very fast
    color: '#44AAFF',
    size: 12,
    speed: 4.0, // Super fast
    hp: 1,
    points: 60,
    canShoot: false
  },
  STEROIDS_5: { // Slow but tanky
    color: '#44AAFF',
    size: 35,
    speed: 0.6, // Very slow
    hp: 5,
    points: 200,
    canShoot: false
  },
  STEROIDS_6: { // Medium-fast
    color: '#44AAFF',
    size: 18,
    speed: 2.5, // Fast
    hp: 2,
    points: 100,
    canShoot: false
  }
};

// ==================== GAME ENGINE ====================
class GameEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.callbacks = callbacks;
    
    // Set canvas to fullscreen (like old version)
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
    
    // Game state (NO React state here!)
    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.accumulator = 0;
    
    // Input state
    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };
    this.touch = { active: false, x: 0, y: 0 };
    
    // Player state
    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 100,
      width: 50,
      height: 60,
      speed: 8,
      color: '#4488ff',
      hp: 3,
      maxHp: 3,
      level: 0,
      score: 0,
      invincible: 0,
      autoFire: true,
      lastShot: 0,
      fireRate: 200,
      shipImage: null
    };
    
    // Game objects
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerUps = [];
    
    // Object pools
    this.bulletPool = new ObjectPool(() => ({
      x: 0, y: 0, vx: 0, vy: 0, active: false, size: 5, color: '#fff', isEnemy: false
    }), 100);
    
    this.particlePool = new ObjectPool(() => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 60, 
      color: '#fff', size: 3
    }), 200);
    
    // Asset loader
    this.assetLoader = new AssetLoader();
    
    // Boss timer: boss spawns after 60 seconds
    this.bossTimer = 0;
    this.bossSpawnTime = 60000; // 60 seconds in milliseconds
    this.gameTime = 0;
    
    // Stars for space warp background
    this.stars = [];
    this.initStars();
    
    // Spawn timer
    this.lastSpawn = 0;
    this.currentLevel = 1;
    this.enemiesSpawned = 0;
    this.bossActive = false;
    
    // Bind input handlers
    this.setupInputHandlers();
  }
  
  setupInputHandlers() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.touch.active && this.touch.touchId === 'mouse') {
        const rect = this.canvas.getBoundingClientRect();
        this.touch.x = e.clientX - rect.left;
        this.touch.y = e.clientY - rect.top;
      }
    });
    
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Only left mouse button
        const rect = this.canvas.getBoundingClientRect();
        this.touch.active = true;
        this.touch.touchId = 'mouse';
        this.touch.x = e.clientX - rect.left;
        this.touch.y = e.clientY - rect.top;
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      if (this.touch.touchId === 'mouse') {
        this.touch.active = false;
      }
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      if (this.touch.touchId === 'mouse') {
        this.touch.active = false;
      }
    });
    
    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
      this.touch.touchId = e.touches[0].identifier;
      this.touch.active = true;
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', () => {
      this.touch.active = false;
    });
  }
  
  loadPlayerShip(characterType) {
    // Load player ship image based on character
    const shipPaths = {
      blue: '/src/assets/player/blue-ship.fw.png',
      red: '/src/assets/player/red-ship.fw.png',
      yellow: '/src/assets/player/yellow-ship.fw.png',
      pink: '/src/assets/player/pink-ship.fw.png'
    };
    
    const shipPath = shipPaths[characterType] || shipPaths.blue;
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        this.player.shipImage = img;
        resolve(img);
      };
      img.onerror = () => {
        console.error('Failed to load ship image:', shipPath);
        this.player.shipImage = null;
        resolve(null);
      };
      img.src = shipPath;
    });
  }
  
  async preloadAssets() {
    const imageMap = {
      // Shooting enemies
      'enemy-1': '/src/assets/shooting-enemy/enemy-1.fw.png',
      'enemy-2': '/src/assets/shooting-enemy/enemy-2.fw.png',
      'enemy-3': '/src/assets/shooting-enemy/enemy-3.fw.png',
      'enemy-4': '/src/assets/shooting-enemy/enemy-4.fw.png',
      'enemy-5': '/src/assets/shooting-enemy/enemy-5.fw.png',
      // Non-shooting enemies
      'steroids-1': '/src/assets/none-shooting-enemy/steriods-1.fw.png',
      'steroids-2': '/src/assets/none-shooting-enemy/steriods-2.fw.png',
      'steroids-3': '/src/assets/none-shooting-enemy/steriods-3.fw.png',
      'steroids-4': '/src/assets/none-shooting-enemy/steriods-4.fw.png',
      'steroids-5': '/src/assets/none-shooting-enemy/steriods-5.fw.png',
      'steroids-6': '/src/assets/none-shooting-enemy/steriods-6.fw.png',
      // Bosses
      'boss-1': '/src/assets/boss/boss-1.fw.png',
      'boss-2': '/src/assets/boss/boss-2.fw.png',
      'boss-3': '/src/assets/boss/boss-3.fw.png',
      'boss-4': '/src/assets/boss/boss-4.fw.png',
      'boss-5': '/src/assets/boss/boss-5.fw.png',
      'boss-6': '/src/assets/boss/boss-6.fw.png',
      'boss-7': '/src/assets/boss/boss-7.fw.png',
      'boss-8': '/src/assets/boss/boss-8.fw.png',
      'boss-9': '/src/assets/boss/boss-9.fw.png',
      'boss-10': '/src/assets/boss/boss-10.fw.png'
    };
    
    await this.assetLoader.preloadAssets(imageMap);
  }
  
  reset() {
    // Reset game state without starting
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 100;
    this.player.score = 0;
    this.player.hp = 3;
    this.player.invincible = 0;
    this.bossTimer = this.bossSpawnTime;
    this.gameTime = 0;
    this.bossActive = false;
    this.currentLevel = 1;
    this.enemiesSpawned = 0;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.initStars();
    this.isRunning = false;
    this.isPaused = false;
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
    this.callbacks.onGameStart?.();
  }
  
  pause() {
    this.isPaused = true;
    this.callbacks.onGamePause?.();
  }
  
  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.callbacks.onGameResume?.();
  }
  
  stop() {
    this.isRunning = false;
    this.callbacks.onGameOver?.(this.player.score);
  }
  
  gameLoop(currentTime) {
    if (!this.isRunning) return;
    
    requestAnimationFrame((time) => this.gameLoop(time));
    
    if (this.isPaused) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.accumulator += deltaTime;
    
    // Fixed time step update
    while (this.accumulator >= GAME_CONFIG.FRAME_TIME) {
      this.update(GAME_CONFIG.FRAME_TIME);
      this.accumulator -= GAME_CONFIG.FRAME_TIME;
    }
    
    // Render every frame
    this.render();
  }
  
  update(dt) {
    // Track game time for boss spawning
    if (!this.bossActive) {
      this.gameTime += dt;
      this.bossTimer = Math.max(0, this.bossSpawnTime - this.gameTime);
    }
    
    this.handleInput();
    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateStars();
    this.updateEnemies(dt);
    this.updateParticles(dt);
    this.checkCollisions();
    this.spawnEnemies(dt);
    this.checkLevelProgress();
    this.checkBossSpawn();
  }
  
  handleInput() {
    // Keyboard movement
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.player.x -= this.player.speed;
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      this.player.x += this.player.speed;
    }
    if (this.keys['arrowup'] || this.keys['w']) {
      this.player.y -= this.player.speed;
    }
    if (this.keys['arrowdown'] || this.keys['s']) {
      this.player.y += this.player.speed;
    }
    
    // Touch/mouse follow
    if (this.touch.active) {
      // Offset: finger should be at the bottom of the ship
      // This prevents finger from covering the ship on mobile
      const targetY = this.touch.y - 50; // 50px offset (finger below ship)
      const targetX = this.touch.x;
      
      const dx = targetX - this.player.x;
      const dy = targetY - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        this.player.x += (dx / dist) * this.player.speed;
        this.player.y += (dy / dist) * this.player.speed;
      }
    }
    
    // Clamp to screen
    this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
    this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y));
  }
  
  shoot() {
    const bullet = this.bulletPool.get();
    bullet.x = this.player.x;
    bullet.y = this.player.y - this.player.height / 2;
    bullet.vx = 0;
    bullet.vy = -10;
    bullet.active = true;
    bullet.color = this.player.color;
    bullet.isEnemy = false; // Explicitly mark as player bullet
    this.bullets.push(bullet);
  }
  
  updatePlayer(dt) {
    if (this.player.invincible > 0) {
      this.player.invincible -= dt;
    }
    
    // Rocket thrust particle effect
    if (this.isRunning && !this.isPaused) {
      const thrustParticle = this.particlePool.get();
      thrustParticle.x = this.player.x + (Math.random() - 0.5) * 10; // Slight spread
      thrustParticle.y = this.player.y + this.player.height / 2 + 5; // Back of ship
      
      // Flame colors: orange to yellow to white
      const flameColors = ['#FF4500', '#FF6600', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00'];
      thrustParticle.color = flameColors[Math.floor(Math.random() * flameColors.length)];
      
      thrustParticle.size = Math.random() * 4 + 2; // 2-6px
      
      // Downward velocity (thrust)
      thrustParticle.vx = (Math.random() - 0.5) * 1; // Slight horizontal spread
      thrustParticle.vy = Math.random() * 2 + 2; // 2-4 downward speed
      
      thrustParticle.life = 15; // Short life for thrust
      thrustParticle.maxLife = 15;
      
      this.particles.push(thrustParticle);
    }
    
    // Auto-fire shooting (like old version)
    const now = Date.now();
    const fireRate = this.player.fireRate;
    
    if (this.player.autoFire) {
      if (now - this.player.lastShot > fireRate) {
        this.player.lastShot = now;
        this.shoot();
      }
    }
  }
  
  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      // Remove off-screen bullets
      if (bullet.y < -10 || bullet.y > this.canvas.height + 10 ||
          bullet.x < -10 || bullet.x > GAME_CONFIG.CANVAS_WIDTH + 10) {
        this.bullets.splice(i, 1);
        this.bulletPool.release(bullet);
      }
    }
  }
  
  updateEnemies(dt) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      // enemy.y += enemy.speed; // Moved into if/else below for boss special handling
      
      // Boss special movement
      if (enemy.isBoss) {
        // Move down until reaching target position
        if (!enemy.hasReachedPosition) {
          enemy.y += enemy.speed;
          if (enemy.y >= enemy.targetY) {
            enemy.hasReachedPosition = true;
            enemy.y = enemy.targetY;
          }
        } else {
          // Boss reached position - wobble side to side
          enemy.x += Math.sin(enemy.time * 0.002) * 2;
        }
        
        // Boss attack patterns
        if (enemy.canShoot) {
          this.bossAttack(enemy);
        }
      } else if (enemy.isDynamic) {
        // Dynamic enemy: fast -> sudden stop -> slow/sideways exit
        if (!enemy.hasReachedTarget) {
          // Phase 1: Fast descent to target Y
          // Guaranteed shot on horizontal entry
          if (enemy.needsImmediateShot) {
            this.enemyShoot(enemy);
            enemy.needsImmediateShot = false;
          }
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;
          enemy.x += Math.sin(enemy.time * 0.005 + enemy.wobblePhase) * 0.5;
          if (enemy.y >= enemy.targetY) {
            enemy.hasReachedTarget = true;
            enemy.isStopped = true;
            enemy.stopTimer = Date.now() + 2000 + Math.random() * 3000; // Stop for 2-5 seconds
            // Guaranteed shot when stopping
            if (enemy.canShoot) {
              this.enemyShoot(enemy);
              enemy.lastShot = Date.now(); // Reset timer
            }
            // Stop horizontal movement
            enemy.vx = 0;
          }
        } else if (enemy.isStopped) {
          // Phase 2: Sudden stop (hover in place)
          enemy.x += Math.sin(enemy.time * 0.005 + enemy.wobblePhase) * 0.3; // Gentle wobble
          if (Date.now() > enemy.stopTimer) {
            enemy.isStopped = false;
            // Randomly decide: continue slow (60%) or exit sideways (40%)
            if (Math.random() < 0.4) {
              // Exit sideways instead of toward player
              enemy.speed = 2 + Math.random() * 2; // Maintain speed for exit
            } else {
              // Continue slowly toward player
              enemy.speed = 0.5 + Math.random() * 0.5; // Very slow
            }
          }
        } else {
          // Phase 3: Either slow descent or sideways exit
          if (enemy.speed > 1.5) {
            // Exiting sideways
            enemy.x += enemy.exitDirection === 'left' ? -enemy.speed : enemy.speed;
            enemy.y += enemy.speed * 0.3; // Slight downward drift
            enemy.x += Math.sin(enemy.time * 0.005 + enemy.wobblePhase) * 0.5;
          } else {
            // Continue slowly toward player
            enemy.y += enemy.speed;
            enemy.x += Math.sin(enemy.time * 0.005 + enemy.wobblePhase) * 0.5;
          }
        }
        
        // Enemy shooting
        if (enemy.canShoot && enemy.lastShot !== null) {
          this.enemyShoot(enemy);
        }
      } else {
        // Regular enemy movement
        if (enemy.vx !== undefined && enemy.vy !== undefined) {
          // Multi-directional movement
          // Guaranteed shot on horizontal entry
          if (enemy.needsImmediateShot) {
            this.enemyShoot(enemy);
            enemy.needsImmediateShot = false;
          }
          enemy.x += enemy.vx;
          enemy.y += enemy.vy;
        } else {
          // Vertical only
          enemy.y += enemy.speed;
        }
        
        // Wobble effect
        enemy.x += Math.sin(enemy.time * 0.005 + enemy.wobblePhase) * 0.5;
        
        // Enemy shooting - only if canShoot is true
        if (enemy.canShoot && enemy.lastShot !== null) {
          this.enemyShoot(enemy);
        }
      }
      
      // Boss defeated check
      if (enemy.isBoss && enemy.hp <= 0) {
        this.bossDefeated();
      }
      
      // Remove off-screen enemies (but not boss) - check all boundaries
      if (!enemy.isBoss && (
        enemy.y > this.canvas.height + 50 ||
        enemy.y < -100 ||
        enemy.x < -100 ||
        enemy.x > this.canvas.width + 100
      )) {
        this.enemies.splice(i, 1);
      }
      
    }
  }
  
  bossAttack(boss) {
    if (boss.isDead) return;
    const now = Date.now();
    const shootInterval = boss.shootRate;
    if (boss.lastShot && now - boss.lastShot < shootInterval) return;
    
    // Three unique attack patterns based on boss stage
    const pattern = boss.attackPattern;
    
    if (pattern === 0) {
      // Pattern 0: Triple shot toward player (spread pattern)
      for (let i = -1; i <= 1; i++) {
        const bullet = this.bulletPool.get();
        if (bullet) {
          bullet.x = boss.x;
          bullet.y = boss.y + boss.size / 2;
          
          // Calculate angle to player with spread
          const dx = this.player.x - boss.x;
          const dy = this.player.y - boss.y;
          const baseAngle = Math.atan2(dy, dx);
          const spreadAngle = baseAngle + (i * 0.2); // Spread by 0.2 radians
          
          const speed = 6;
          bullet.vx = Math.cos(spreadAngle) * speed;
          bullet.vy = Math.sin(spreadAngle) * speed;
          bullet.active = true;
          bullet.color = '#FF00FF'; // Magenta boss bullets
          bullet.isEnemy = true;
          this.bullets.push(bullet);
        }
      }
    } else if (pattern === 1) {
      // Pattern 1: Rapid fire for 1 second
      if (!boss.rapidFireTimer) {
        boss.rapidFireTimer = now;
      }
      
      const rapidFireDuration = 1000; // 1 second
      const rapidFireInterval = 100; // Shot every 100ms
      
      if (now - boss.rapidFireTimer < rapidFireDuration) {
        // Still in rapid fire mode
        if (!boss.lastRapidShot || now - boss.lastRapidShot >= rapidFireInterval) {
          const bullet = this.bulletPool.get();
          if (bullet) {
            bullet.x = boss.x;
            bullet.y = boss.y + boss.size / 2;
            
            // Aim directly at player
            const dx = this.player.x - boss.x;
            const dy = this.player.y - boss.y;
            const angle = Math.atan2(dy, dx);
            const speed = 8;
            
            bullet.vx = Math.cos(angle) * speed;
            bullet.vy = Math.sin(angle) * speed;
            bullet.active = true;
            bullet.color = '#FF00FF';
            bullet.isEnemy = true;
            this.bullets.push(bullet);
            boss.lastRapidShot = now;
          }
        }
        // Don't update lastShot during rapid fire
        return;
      } else {
        // Rapid fire over, reset timer
        boss.rapidFireTimer = 0;
        boss.lastShot = now;
      }
    } else {
      // Pattern 2: Multiplying bullets (spread in all directions)
      const bulletCount = 8;
      for (let i = 0; i < bulletCount; i++) {
        const bullet = this.bulletPool.get();
        if (bullet) {
          bullet.x = boss.x;
          bullet.y = boss.y + boss.size / 2;
          
          const angle = (Math.PI * 2 / bulletCount) * i;
          const speed = 5;
          
          bullet.vx = Math.cos(angle) * speed;
          bullet.vy = Math.sin(angle) * speed;
          bullet.active = true;
          bullet.color = '#FF00FF';
          bullet.isEnemy = true;
          this.bullets.push(bullet);
        }
      }
    }
    
    boss.lastShot = now;
  }
  
  enemyShoot(enemy) {
    if (enemy.isDead || !enemy.canShoot) return;
    const now = Date.now();
    // Fire rate: 3 seconds (3000ms) minus 0.3 seconds (300ms) per level
    // Level 1: 3000ms (3 seconds), Level 2: 2700ms, Level 3: 2400ms, etc.
    const shootInterval = enemy.shootRate - (300 * (this.currentLevel - 1));
    const finalShootInterval = Math.max(800, shootInterval); // Minimum 0.8 seconds
    if (enemy.lastShot && now - enemy.lastShot < finalShootInterval) return;
    
    const bullet = this.bulletPool.get();
    if (bullet) {
      // 70% chance to aim at player, 30% shoot straight
      const shouldAim = Math.random() < 0.7;
      let vx = 0;
      let vy = 5;
      if (shouldAim && this.player && !this.player.isDead) {
        // Aim at player with some randomness for difficulty
        const accuracy = 0.85; // 85% accuracy
        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x) + (Math.random() - 0.5) * (1 - accuracy);
        const speed = 5;
        
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      }
      
      bullet.x = enemy.x;
      bullet.y = enemy.y + enemy.size;
      bullet.vx = vx;
      bullet.vy = vy;
      bullet.active = true;
      bullet.color = '#FF8C00'; // Orange for enemy bullets
      bullet.isEnemy = true;
      this.bullets.push(bullet);
      enemy.lastShot = now;
    }
  }
  
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.life -= 1;
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        this.particlePool.release(particle);
      }
    }
  }
  
  checkCollisions() {
    // Bullet-enemy collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (bullet.isEnemy) {
        // Enemy bullet hits player
        if (this.checkCollision(bullet, this.player)) {
          if (this.player.invincible <= 0) {
            this.playerHit();
          }
          this.bullets.splice(i, 1);
          this.bulletPool.release(bullet);
        }
      } else {
        // Player bullet hits enemy
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const enemy = this.enemies[j];
          if (this.checkCollision(bullet, enemy)) {
            this.enemyHit(enemy, j);
            this.bullets.splice(i, 1);
            this.bulletPool.release(bullet);
            break;
          }
        }
      }
    }
    
    // Player-enemy collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (this.checkCollision(this.player, enemy)) {
        if (this.player.invincible <= 0) {
          this.playerHit();
        }
      }
    }
  }
  
  checkCollision(a, b) {
    // For enemies, use hit areas that match visual sizes properly
    let aSize = a.size || a.width || 10;
    let bSize = b.size || b.width || 10;
    
    // If it's an enemy, use appropriate hit box based on type
    if (a.isEnemy && !a.width) {
      if (a.isBoss) {
        aSize = a.size * 1.0; // Boss: Full size hit area (160px)
      } else if (a.canShoot) {
        aSize = a.size * 0.8; // Shooting enemies: 48px hit area (60 * 0.8)
      } else {
        aSize = a.size * 2.5; // Non-shooting enemies
      }
    }
    if (b.isEnemy && !b.width) {
      if (b.isBoss) {
        bSize = b.size * 1.0; // Boss: Full size hit area (160px)
      } else if (b.canShoot) {
        bSize = b.size * 0.8; // Shooting enemies: 48px hit area
      } else {
        bSize = b.size * 2.5; // Non-shooting enemies
      }
    }
    
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (aSize + bSize) / 2;
  }
  
  playerHit() {
    this.player.hp--;
    this.player.invincible = 2000;
    this.createExplosion(this.player.x, this.player.y, this.player.color);
    this.callbacks.onPlayerHit?.(this.player.hp);
    
    if (this.player.hp <= 0) {
      this.stop();
    }
  }
  
  enemyHit(enemy, index) {
    enemy.hp--;
    
    if (enemy.hp <= 0) {
      // Enemy destroyed
      this.player.score += enemy.points;
      this.createExplosion(enemy.x, enemy.y, enemy.color);
      this.enemies.splice(index, 1);
      this.callbacks.onScoreChange?.(this.player.score);
    } else {
      // Enemy hit but not destroyed
      this.createParticles(enemy.x, enemy.y, enemy.color, 5);
    }
  }
  
  createExplosion(x, y, color) {
    this.createParticles(x, y, color, 20);
  }
  
  createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const particle = this.particlePool.get();
      particle.x = x;
      particle.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = particle.maxLife;
      particle.color = color;
      this.particles.push(particle);
    }
  }
  
  spawnEnemies(dt) {
    this.lastSpawn += dt;
    
    // During boss fight: double spawn rate (half the time)
    // Normal time: regular spawn rate
    const spawnRate = this.bossActive ? GAME_CONFIG.SPAWN_RATE / 2 : GAME_CONFIG.SPAWN_RATE;
    
    if (this.lastSpawn >= spawnRate) {
      this.lastSpawn = 0;
      this.spawnEnemy();
    }
  }
  
  spawnEnemy() {
    // Weighted spawn: 70% non-shooting (steroids), 30% shooting
    let typeKey;
    
    if (Math.random() < 0.7) {
      // Spawn non-shooting enemy (steroids)
      const steroidsTypes = ['STEROIDS_1', 'STEROIDS_2', 'STEROIDS_3', 'STEROIDS_4', 'STEROIDS_5', 'STEROIDS_6'];
      typeKey = steroidsTypes[Math.floor(Math.random() * steroidsTypes.length)];
    } else {
      // Spawn shooting enemy
      const shootingTypes = ['SHOOTING_1', 'SHOOTING_2', 'SHOOTING_3', 'SHOOTING_4', 'SHOOTING_5'];
      typeKey = shootingTypes[Math.floor(Math.random() * shootingTypes.length)];
    }
    
    const type = ENEMY_TYPES[typeKey];
    
    // Debug logging to verify shooting enemies spawn
    if (type.canShoot) {
      console.log('Spawning shooting enemy:', typeKey);
    }
    
    // Calculate boss stage to determine enemy image tier
    const bossStage = Math.floor(this.currentLevel / 2) + 1;
    
    // Multi-directional entry for shooting enemies (top half of screen)
    let spawnX = Math.random() * (this.canvas.width - 100) + 50;
    let spawnY = -50;
    let velocityX = 0;
    let velocityY = type.speed;
    let entryPattern = 0; // Default to straight down
    
    if (type.canShoot) {
      entryPattern = Math.floor(Math.random() * 5); // 5 patterns
      
      switch(entryPattern) {
        case 0: // Straight down (default)
          spawnX = Math.random() * (this.canvas.width - 100) + 50;
          spawnY = -50;
          velocityX = 0;
          velocityY = type.speed;
          break;
        case 1: // From top-left diagonal
          spawnX = -50;
          spawnY = -50 + Math.random() * 100;
          velocityX = type.speed * 0.5;
          velocityY = type.speed * 0.8;
          break;
        case 2: // From top-right diagonal
          spawnX = this.canvas.width + 50;
          spawnY = -50 + Math.random() * 100;
          velocityX = -type.speed * 0.5;
          velocityY = type.speed * 0.8;
          break;
        case 3: // Horizontal from left
          spawnX = -50;
          spawnY = 50 + Math.random() * 150; // Top half
          velocityX = type.speed;
          velocityY = type.speed * 0.3;
          break;
        case 4: // Horizontal from right
          spawnX = this.canvas.width + 50;
          spawnY = 50 + Math.random() * 150; // Top half
          velocityX = -type.speed;
          velocityY = type.speed * 0.3;
          break;
      }
    }
    
    const enemy = {
      x: spawnX,
      y: spawnY,
      type: typeKey,
      isEnemy: true,
      ...type,
      time: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      lastShot: type.canShoot ? Date.now() + (200 + Math.random() * 1000) : null // 0.2-1.2s initial fire delay
    };
    
    // Store initial velocity for multi-directional enemies
    if (type.canShoot) {
      enemy.vx = velocityX;
      enemy.vy = velocityY;
      enemy.entryPattern = entryPattern; // Track entry pattern for guaranteed shots
    }
    
    // Scale HP with level
    enemy.hp = type.hp + Math.floor(this.currentLevel / 3);
    enemy.maxHp = enemy.hp;
    
    // Dynamic enemy properties (30% chance for shooting enemies)
    if (type.canShoot && Math.random() < 0.3) {
      enemy.isDynamic = true;
      enemy.originalSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      // Apply speed multiplier to velocity
      const speedMultiplier = 1.5 + Math.random(); // 1.5-2.5x faster
      enemy.vx = velocityX * speedMultiplier;
      enemy.vy = velocityY * speedMultiplier;
      enemy.speed = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy);
      enemy.stopTimer = 0;
      enemy.isStopped = false;
      enemy.exitDirection = Math.random() < 0.5 ? 'left' : 'right';
      enemy.hasReachedTarget = false;
      enemy.targetY = 100 + Math.random() * 200; // Adjusted for multi-directional
    }
    
    // Guaranteed shot on horizontal entry (patterns 3 & 4)
    if (type.canShoot && (entryPattern === 3 || entryPattern === 4)) {
      enemy.needsImmediateShot = true;
      console.log(`Horizontal entry shooting enemy: ${typeKey}, pattern ${entryPattern}`);
    }
    
    console.log(`Spawning enemy: ${typeKey}, canShoot: ${type.canShoot}, at (${spawnX.toFixed(0)}, ${spawnY.toFixed(0)})`);
    
    // Load enemy image based on type prefix
    if (typeKey.startsWith('SHOOTING')) {
      // Shooting enemies: map to enemy-1 through enemy-5
      const imageNum = Math.min(Math.ceil((bossStage) / 2), 5);
      enemy.image = this.assetLoader.getImage(`enemy-${imageNum}`);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Shooting enemy image not loaded: enemy-${imageNum}`);
      }
    } else if (typeKey.startsWith('STEROIDS')) {
      // Non-shooting enemies: map to steroids-1 through steroids-6
      const imageNum = Math.min(Math.ceil((bossStage) / 2), 6);
      enemy.image = this.assetLoader.getImage(`steroids-${imageNum}`);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Steroid enemy image not loaded: steroids-${imageNum}`);
      }
    }
    
    this.enemies.push(enemy);
  }
  
  spawnBoss() {
    this.bossActive = true;
    const bossStage = Math.min(Math.floor(this.currentLevel / 2) + 1, 10);
    
    const boss = {
      x: this.canvas.width / 2,
      y: -80,
      type: 'BOSS',
      size: 160, // 200% larger (was 80, now 160)
      speed: 2.0, // Faster initial movement
      targetY: 150, // Stop at this Y position
      hp: (20 + this.currentLevel * 5) * 4, // x4 health for harder fight
      maxHp: (20 + this.currentLevel * 5) * 4, // x4 health for harder fight
      points: 1000 * bossStage,
      color: '#ff00ff',
      time: 0,
      wobblePhase: 0,
      lastShot: 0,
      canShoot: true,
      shootRate: 2000, // Slower base fire rate for boss
      isBoss: true,
      hasReachedPosition: false,
      attackPattern: bossStage % 3, // 3 unique patterns per boss stage
      rapidFireTimer: 0,
      image: this.assetLoader.getImage(`boss-${bossStage}`)
    };
    
    this.enemies.push(boss);
    this.callbacks.onBossSpawn?.(bossStage);
  }
  
  checkLevelProgress() {
    this.enemiesSpawned++;
  }
  
  bossDefeated() {
    this.bossActive = false;
    this.currentLevel++;
    this.enemiesSpawned = 0;
    // Reset boss timer for next level
    this.bossTimer = this.bossSpawnTime;
    this.gameTime = 0;
    this.callbacks.onLevelUp?.(this.currentLevel);
  }
  
  checkBossSpawn() {
    // Boss spawns after 60 seconds of gameplay
    if (this.bossTimer <= 0 && !this.bossActive) {
      this.spawnBoss();
      // Reset timer for next level
      this.bossTimer = this.bossSpawnTime;
      this.gameTime = 0;
    }
  }
  
  getBossTimer() {
    return Math.max(0, Math.ceil(this.bossTimer / 1000)); // Return in seconds
  }
  
  render() {
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw stars background
    this.drawStars();
    
    // Draw particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Draw bullets
    this.bullets.forEach(bullet => {
      if (bullet.isEnemy) {
        // Enemy bullets: orange with white center (radial gradient)
        const gradient = ctx.createRadialGradient(
          bullet.x, bullet.y, 0,
          bullet.x, bullet.y, bullet.size
        );
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, '#FFE5B4');
        gradient.addColorStop(1, '#FF8C00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Player bullets: blue with gradient
        ctx.fillStyle = bullet.color || '#fff';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = bullet.color || '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw enemies
    this.enemies.forEach(enemy => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      
      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = enemy.color;
      
      if (enemy.image && enemy.image.complete) {
        // Draw image with proper aspect ratio
        let width, height;
        if (enemy.isBoss) {
          width = enemy.size; // 160
          height = enemy.size; // Square for boss
        } else if (enemy.canShoot) {
          // Shooting enemies: width = 60, height = 45 (3:4 aspect ratio - taller than wide)
          width = enemy.size; // 60px width
          height = enemy.size * 0.75; // 45px height (3:4 ratio)
        } else {
          // Non-shooting enemies: larger
          width = enemy.size * 2.5;
          height = enemy.size * 2.5;
        }
        const floatOffset = Math.sin(enemy.time * 0.003) * 3;
        
        ctx.globalAlpha = 0.9;
        ctx.translate(0, floatOffset);
        
        // Draw with proper width and height (maintains aspect ratio)
        ctx.drawImage(enemy.image, -width / 2, -height / 2, width, height);
      } else {
        // Fallback: draw shape
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
      
      // Health bar
      if (enemy.hp < enemy.maxHp) {
        const barWidth = enemy.isBoss ? 100 : 40; // Shorter bar for regular enemies
        const barHeight = 4;
        const barX = enemy.x - barWidth / 2;
        const barY = enemy.y - (enemy.isBoss ? 100 : 50) - 10; // Adjusted for larger enemies
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#0f0';
        ctx.fillRect(barX, barY, barWidth * (enemy.hp / enemy.maxHp), barHeight);
      }
    });
    
    // Draw player
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    
    // Invincibility flash
    if (this.player.invincible > 0) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.5;
    }
    
    // Player glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.player.color;
    
    // Draw player ship image or fallback to triangle
    if (this.player.shipImage && this.player.shipImage.complete) {
      // Maintain aspect ratio: width based on player.width, height is taller (not fat!)
      const shipWidth = this.player.width * 1.5; // ~75px wide
      const shipHeight = this.player.height * 1.5; // ~90px tall (taller than wide)
      ctx.drawImage(
        this.player.shipImage,
        -shipWidth / 2,
        -shipHeight / 2,
        shipWidth,
        shipHeight
      );
    } else {
      // Fallback: draw triangle ship
      ctx.fillStyle = this.player.color;
      ctx.beginPath();
      ctx.moveTo(0, -this.player.height / 2);
      ctx.lineTo(-this.player.width / 2, this.player.height / 2);
      ctx.lineTo(0, this.player.height / 3);
      ctx.lineTo(this.player.width / 2, this.player.height / 2);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  initStars() {
    this.stars = [];
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        brightness: Math.random()
      });
    }
  }
  
  updateStars() {
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    });
  }
  
  drawStars() {
    const ctx = this.ctx;
    this.stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.fill();
    });
  }
  
  // Public API for React to query state
  getPlayerState() {
    return {
      score: this.player.score,
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      level: this.player.level,
      invincible: this.player.invincible
    };
  }
}

export default GameEngine;
export { GAME_CONFIG, ENEMY_TYPES };














