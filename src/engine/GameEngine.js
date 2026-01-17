/**
 * Space Snake Game Engine
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎵 AUDIO SYSTEM - SOUND EFFECTS & MUSIC
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * BACKGROUND MUSIC:
 *   ✅ Stages 1-10:  background-sound-1-to-10.mp3
 *   ✅ Stages 11-20: background-sound-11-to-20.mp3
 *   ✅ Stages 21-30: background-sound-21-to-30.mp3
 *   ✅ Stages 31+:    background-sound-31-to-all.mp3
 *   ✅ Menu:          menu-background.mp3
 * 
 * PLAYER SOUNDS:
 *   ✅ Shooting:      soundManager.play('player.fire')
 *   ✅ Death:         soundManager.play('player.explode')
 * 
 * ENEMY SOUNDS:
 *   ✅ Shooting enemy fires:     soundManager.play('enemy.fire')
 *   ✅ Enemy hit (all types):    soundManager.play('enemy.hit')
 *   ✅ Shooting enemy killed:    soundManager.play('enemy.destroy')
 *   ✅ Non-shooting killed:      soundManager.play('enemy.destroyNonShooting')
 *   ✅ Boss fires:               soundManager.play('enemy.bossFire')
 *   ✅ Boss hit:                 soundManager.play('enemy.metalHit')
 *   ✅ Boss destroyed:           soundManager.play('enemy.bossExplode')
 *   ✅ Boss destruction:         soundManager.play('enemy.breakBones')
 * 
 * POWER-UP SOUNDS:
 *   ✅ Power-up appears:         soundManager.play('powerup.spawn')
 *   ✅ Normal power-up:          soundManager.play('powerup.collect')
 *   ✅ SUPER_MODE power-up:      soundManager.play('powerup.superCollect')
 *   ✅ LEVEL_UP power-up:        soundManager.play('powerup.jackpot')
 *   ✅ SCREEN_BOMB:             soundManager.play('enemy.bossExplode')
 *   ✅ EXTRA_LIFE:              soundManager.play('powerup.collect')
 *   ✅ TRIPLE_SHOT:             soundManager.play('powerup.collect')
 *   ✅ DOUBLE_DAMAGE:           soundManager.play('powerup.collect')
 *   ✅ HOMING_MISSILES:         soundManager.play('powerup.collect')
 *   ✅ ORBIT_SHIELD:            soundManager.play('powerup.collect')
 *   ✅ ALLY_SUPPORT:            soundManager.play('powerup.collect')
 *   ✅ INVINCIBILITY:           soundManager.play('powerup.superCollect')
 *   ✅ TIME_FREEZE:             soundManager.play('powerup.collect')
 *   ✅ COIN_100/1000/10000:     soundManager.play('powerup.jackpot')
 * 
 * UI & GAME STATE SOUNDS:
 *   ? Stage notification:       soundManager.play('ui.stageStart')
 *   ? Stage clear:             soundManager.play('ui.winFireworks')
 *   ? Game over music:         soundManager.play('ui.gameOver')
 *   ? Game over music:         soundManager.play('ui.gameOver')
 *   ✅ New high score:          soundManager.play('ui.newRecord')
 *   ✅ Button click:            soundManager.play('ui.click')
 * 
 * SOUND EFFECT LOCATIONS:
 *   Line ~1220:  Player shooting (shoot method)
 *   Line ~1613:  Boss firing pattern 1 (bossAttack method)
 *   Line ~1648:  Boss rapid fire (bossAttack method)
 *   Line ~1681:  Boss spread fire (bossAttack method)
 *   Line ~1730:  Enemy shooting (enemyShoot method)
 *   Line ~1923:  Boss hit (enemyHit method)
 *   Line ~1946:  Boss explosion (enemyHit method)
 *   Line ~1947:  Boss destruction (enemyHit method)
 *   Line ~1950:  Shooting enemy killed (enemyHit method)
 *   Line ~1955:  Non-shooting enemy killed (enemyHit method)
 *   Line ~1958:  Enemy hit but not killed (enemyHit method)
 *   Line ~1905:  Player death (playerHit method)
 *   Line ~2343:  Power-up spawn (spawnPowerUp method)
 *   Line ~2390:  Power-up collected normal (activatePowerUp method)
 *   Line ~2392:  Level up power-up (activatePowerUp method)
 *   Line ~2394:  Super power-up (activatePowerUp method)
 *   Line ~2775:  Stage clear victory (bossDefeated method)
 *   Line ~1059:  Stage notification (updateEntranceAnimation method)
 *   Line ~939:  Background music start (start method)
 * 
 * VOLUME CONTROL:
 *   Music Volume:  30% (0.3) - soundManager.setMusicVolume(0.3)
 *   SFX Volume:    50% (0.5) - soundManager.setSFXVolume(0.5)
 *   Mute/Unmute:             soundManager.toggleMute()
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
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

// ==================== IMPORTS ====================
import SoundManager from './SoundManager.js';
 
// ==================== GAME CONFIGURATION ====================
const GAME_CONFIG = {
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  SPAWN_RATE: 1500,
  BOSS_SPAWN_LEVEL: 5,
  DIFFICULTY_SCALE: 1.1,
  BOSS_SPAWN_TIME: 60000, // Boss spawns after 60 seconds (60000ms)
  BOSS_WARNING_TIME: 6000 // Show warning 6 seconds before boss appears
};

// ==================== BOSS CONFIGURATION ====================
// Edit these values to customize boss fights for each stage
// Bosses appear every 60 seconds during gameplay
const BOSSES = {
  // Stage 1 Boss (60 seconds)
  STAGE_1: {
    stage: 1,
    name: 'Mega Destroyer',
    spawnTime: 60, // seconds before appearing
    size: 130, // Boss size in pixels (larger = bigger)
    speed: 1.0, // Movement speed
    hp: 100, // Health points
    maxHp: 100, // Maximum health
    points: 1000, // Score awarded when defeated
    color: '#ff00ff', // Color for debug/backup rendering
    imageKey: 'boss-1', // Image file: boss-1.png
    
    // Attack Pattern 0: Straight shooting + occasional spread
    attackPatterns: ['straight', 'spread'],
    shootRate: 2000, // Milliseconds between shots (2000 = 2 seconds)
    bulletSpeed: 6,
    bulletDamage: 1,
    
    // Movement: Enters from top, then moves side-to-side
    movementType: 'side-to-side',
    movementSpeed: 1.0,
    targetY: 150, // Y position where boss stops descending
    
    // Special abilities
    hasSpecialAttack: false, // No special attack in stage 1
    specialAttackInterval: 0, // N/A
    
    // Fight description: Boss moves horizontally at the top of the screen,
    // shooting bullets straight down. Player should dodge and shoot up.
    // Defeat within 60 seconds or face next wave of enemies.
  },
  
  // Stage 2 Boss (120 seconds = 2 minutes)
  STAGE_2: {
    stage: 2,
    name: 'Doom Bringer',
    spawnTime: 60, // seconds (resets after each boss defeat)
    size: 140, // Larger than stage 1
    speed: 1.5, // Faster movement
    hp: 150, // More health
    maxHp: 150,
    points: 2500, // More points
    color: '#ff4400',
    imageKey: 'boss-2',
    
    // Attack Pattern 1: Spread shot + aimed shots
    attackPatterns: ['spread', 'aimed'],
    shootRate: 1800, // Faster shooting
    bulletSpeed: 7,
    bulletDamage: 1,
    
    movementType: 'side-to-side',
    movementSpeed: 1.5,
    targetY: 120,
    
    // Special: Occasial burst fire
    hasSpecialAttack: true,
    specialAttackInterval: 8000, // Every 8 seconds
    
    // Fight description: Faster and tougher. Shoots 3-bullet spreads
    // and occasionally aims directly at player. Watch for burst attacks!
  },
  
  // Stage 3 Boss (180 seconds = 3 minutes)
  STAGE_3: {
    stage: 3,
    name: 'Death Star',
    spawnTime: 60,
    size: 150,
    speed: 2.0,
    hp: 200,
    maxHp: 200,
    points: 5000,
    color: '#00ff00',
    imageKey: 'boss-3',
    
    // Attack Pattern 2: Spiral + aimed bursts
    attackPatterns: ['spiral', 'bursts'],
    shootRate: 1500, // Even faster
    bulletSpeed: 8,
    bulletDamage: 2, // More damage
    
    movementType: 'circular', // Circular movement pattern
    movementSpeed: 2.0,
    targetY: 100,
    
    // Special: Spiral bullet hell
    hasSpecialAttack: true,
    specialAttackInterval: 5000,
    
    // Fight description: Moves in circular pattern while shooting
    // spiral bullets. Very dangerous - use cover and power-ups!
  },
  
  // Stage 4 Boss (240 seconds = 4 minutes)
  STAGE_4: {
    stage: 4,
    name: 'Omega Destroyer',
    spawnTime: 60,
    size: 160,
    speed: 2.0,
    hp: 300,
    maxHp: 300,
    points: 10000,
    color: '#ffff00',
    imageKey: 'boss-4',
    
    // All attack patterns combined
    attackPatterns: ['straight', 'spread', 'aimed', 'spiral'],
    shootRate: 1200, // Very fast
    bulletSpeed: 9,
    bulletDamage: 2,
    
    movementType: 'erratic', // Unpredictable movement
    movementSpeed: 2.0,
    targetY: 80,
    
    // Multiple special attacks
    hasSpecialAttack: true,
    specialAttackInterval: 4000,
    
    // Fight description: Extremely dangerous boss with all attack types.
    // Moves erratically. Save your best power-ups for this fight!
  },

  // Stage 5 Boss (300 seconds = 5 minutes)
  STAGE_5: {
    stage: 5,
    name: 'GALAXY DEVOURER',
    spawnTime: 60,
    size: 180, // Massive
    speed: 2.0,
    hp: 500, // Boss with 500 HP
    maxHp: 500,
    points: 50000, // Huge score
    color: '#ff0080',
    imageKey: 'boss-5',
    
    // Ultimate attack patterns
    attackPatterns: ['ultimate'],
    shootRate: 800, // Insanely fast
    bulletSpeed: 10,
    bulletDamage: 3, // High damage
    
    movementType: 'teleport', // Teleports around
    movementSpeed: 2.0,
    targetY: 60,
    
    // Constant special attacks
    hasSpecialAttack: true,
    specialAttackInterval: 2000,
    
    // Fight description: The final boss! Teleports, shoots bullet hells,
    // has massive health. Requires all skill and power-ups to defeat.
    // Good luck, pilot!
  },

  // Stage 6 Boss
  STAGE_6: {
    stage: 6,
    name: 'VOID ANNIHILATOR',
    spawnTime: 60,
    size: 190,
    speed: 2.2,
    hp: 600,
    maxHp: 600,
    points: 75000,
    color: '#8000ff',
    imageKey: 'boss-6',
    attackPatterns: ['ultimate', 'spiral'],
    shootRate: 700,
    bulletSpeed: 11,
    bulletDamage: 3,
    movementType: 'teleport',
    movementSpeed: 2.2,
    targetY: 55,
    hasSpecialAttack: true,
    specialAttackInterval: 1800,
  },

  // Stage 7 Boss
  STAGE_7: {
    stage: 7,
    name: 'COSMIC TERROR',
    spawnTime: 60,
    size: 200,
    speed: 2.4,
    hp: 700,
    maxHp: 700,
    points: 100000,
    color: '#ff0040',
    imageKey: 'boss-7',
    attackPatterns: ['ultimate', 'spiral', 'spread'],
    shootRate: 650,
    bulletSpeed: 11,
    bulletDamage: 4,
    movementType: 'erratic',
    movementSpeed: 2.4,
    targetY: 50,
    hasSpecialAttack: true,
    specialAttackInterval: 1500,
  },

  // Stage 8 Boss
  STAGE_8: {
    stage: 8,
    name: 'STELLAR DESTROYER',
    spawnTime: 60,
    size: 210,
    speed: 2.6,
    hp: 800,
    maxHp: 800,
    points: 150000,
    color: '#40ff00',
    imageKey: 'boss-8',
    attackPatterns: ['ultimate', 'spiral', 'aimed'],
    shootRate: 600,
    bulletSpeed: 12,
    bulletDamage: 4,
    movementType: 'circular',
    movementSpeed: 2.6,
    targetY: 45,
    hasSpecialAttack: true,
    specialAttackInterval: 1200,
  },

  // Stage 9 Boss
  STAGE_9: {
    stage: 9,
    name: 'GALACTIC NIGHTMARE',
    spawnTime: 60,
    size: 220,
    speed: 2.8,
    hp: 900,
    maxHp: 900,
    points: 200000,
    color: '#00ffff',
    imageKey: 'boss-9',
    attackPatterns: ['ultimate', 'spiral', 'spread', 'aimed'],
    shootRate: 550,
    bulletSpeed: 12,
    bulletDamage: 4,
    movementType: 'teleport',
    movementSpeed: 2.8,
    targetY: 40,
    hasSpecialAttack: true,
    specialAttackInterval: 1000,
  },

  // Stage 10 Boss
  STAGE_10: {
    stage: 10,
    name: 'UNIVERSAL DEVOURER',
    spawnTime: 60,
    size: 230,
    speed: 3.0,
    hp: 1000,
    maxHp: 1000,
    points: 250000,
    color: '#ff8000',
    imageKey: 'boss-10',
    attackPatterns: ['ultimate'],
    shootRate: 500,
    bulletSpeed: 13,
    bulletDamage: 5,
    movementType: 'erratic',
    movementSpeed: 3.0,
    targetY: 35,
    hasSpecialAttack: true,
    specialAttackInterval: 800,
  },

  // Stage 11 Boss
  STAGE_11: {
    stage: 11,
    name: 'DIMENSION SHREDDER',
    spawnTime: 60,
    size: 240,
    speed: 3.2,
    hp: 1200,
    maxHp: 1200,
    points: 350000,
    color: '#ff00bf',
    imageKey: 'boss-11',
    attackPatterns: ['ultimate', 'spiral'],
    shootRate: 450,
    bulletSpeed: 13,
    bulletDamage: 5,
    movementType: 'teleport',
    movementSpeed: 3.2,
    targetY: 30,
    hasSpecialAttack: true,
    specialAttackInterval: 600,
  },

  // Stage 12 Boss
  STAGE_12: {
    stage: 12,
    name: 'REALITY BREAKER',
    spawnTime: 60,
    size: 250,
    speed: 3.4,
    hp: 1400,
    maxHp: 1400,
    points: 500000,
    color: '#80ff00',
    imageKey: 'boss-12',
    attackPatterns: ['ultimate', 'spiral', 'spread'],
    shootRate: 400,
    bulletSpeed: 14,
    bulletDamage: 5,
    movementType: 'circular',
    movementSpeed: 3.4,
    targetY: 25,
    hasSpecialAttack: true,
    specialAttackInterval: 500,
  },

  // Stage 13 Boss
  STAGE_13: {
    stage: 13,
    name: 'OMEGA VOID LORD',
    spawnTime: 60,
    size: 260,
    speed: 3.6,
    hp: 1600,
    maxHp: 1600,
    points: 750000,
    color: '#0040ff',
    imageKey: 'boss-13',
    attackPatterns: ['ultimate'],
    shootRate: 350,
    bulletSpeed: 15,
    bulletDamage: 6,
    movementType: 'teleport',
    movementSpeed: 3.6,
    targetY: 20,
    hasSpecialAttack: true,
    specialAttackInterval: 400,
  },
};

// Helper function to get boss config by stage
function getBossConfig(stage) {
  const bossKey = `STAGE_${Math.min(stage, 13)}`; // Cap at stage 13
  return BOSSES[bossKey] || BOSSES.STAGE_1;
}

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
  SHOOTING_6: {
    color: '#FF6B00',
    size: 60,
    speed: 2.5,
    hp: 3,
    points: 280,
    canShoot: true,
    shootRate: 3000,
    imageKey: 'enemy-6'
  },
  SHOOTING_7: {
    color: '#FF6B00',
    size: 60,
    speed: 3.0,
    hp: 3,
    points: 300,
    canShoot: true,
    shootRate: 2800,
    imageKey: 'enemy-7'
  },
  SHOOTING_8: {
    color: '#FF6B00',
    size: 65,
    speed: 3.2,
    hp: 4,
    points: 320,
    canShoot: true,
    shootRate: 2800,
    imageKey: 'enemy-8'
  },
  SHOOTING_9: {
    color: '#FF6B00',
    size: 65,
    speed: 3.5,
    hp: 4,
    points: 350,
    canShoot: true,
    shootRate: 2600,
    imageKey: 'enemy-9'
  },
  SHOOTING_10: {
    color: '#FF6B00',
    size: 70,
    speed: 3.8,
    hp: 5,
    points: 380,
    canShoot: true,
    shootRate: 2600,
    imageKey: 'enemy-10'
  },
  SHOOTING_11: {
    color: '#FF6B00',
    size: 70,
    speed: 4.0,
    hp: 5,
    points: 400,
    canShoot: true,
    shootRate: 2400,
    imageKey: 'enemy-11'
  },
  SHOOTING_12: {
    color: '#FF6B00',
    size: 75,
    speed: 4.2,
    hp: 6,
    points: 450,
    canShoot: true,
    shootRate: 2400,
    imageKey: 'enemy-12'
  },
  SHOOTING_13: {
    color: '#FF6B00',
    size: 75,
    speed: 4.5,
    hp: 6,
    points: 500,
    canShoot: true,
    shootRate: 2200,
    imageKey: 'enemy-13'
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
    hp: 5,
    points: 150,
    canShoot: false
  },
  STEROIDS_3: { // Medium speed
    color: '#44AAFF',
    size: 18,
    speed: 2.0, // Medium
    hp: 3,
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
  },
  STEROIDS_7: { // For stage 7+
    color: '#44AAFF',
    size: 20,
    speed: 2.8,
    hp: 3,
    points: 120,
    canShoot: false,
    imageKey: 'enemy-7'
  },
  STEROIDS_8: { // For stage 8+
    color: '#44AAFF',
    size: 22,
    speed: 3.0,
    hp: 3,
    points: 130,
    canShoot: false,
    imageKey: 'steroids-8'
  },
  STEROIDS_9: { // For stage 9+
    color: '#44AAFF',
    size: 24,
    speed: 3.2,
    hp: 4,
    points: 140,
    canShoot: false,
    imageKey: 'steroids-9'
  },
  STEROIDS_10: { // For stage 10+
    color: '#44AAFF',
    size: 26,
    speed: 3.5,
    hp: 4,
    points: 150,
    canShoot: false,
    imageKey: 'steroids-10'
  },
  STEROIDS_11: { // For stage 11+
    color: '#44AAFF',
    size: 28,
    speed: 3.8,
    hp: 5,
    points: 160,
    canShoot: false,
    imageKey: 'steroids-11'
  },
  STEROIDS_12: { // For stage 12+
    color: '#44AAFF',
    size: 30,
    speed: 4.0,
    hp: 5,
    points: 170,
    canShoot: false,
    imageKey: 'steroids-12'
  },
  STEROIDS_13: { // For stage 13+
    color: '#44AAFF',
    size: 32,
    speed: 4.2,
    hp: 6,
    points: 180,
    canShoot: false,
    imageKey: 'steroids-13'
  },

  // ==================== NEW SPECIAL ENEMY TYPES ====================

  // Dash enemies - move straight toward player
  STEROIDS_DASH_1: {
    color: '#FF4444',
    size: 25,
    speed: 6.0, // Very fast dash
    hp: 2,
    points: 200,
    canShoot: false,
    movementType: 'dash', // Moves straight to player
    guaranteedPowerUp: true, // Always drops power-up
    powerUpTypes: ['LEVEL_UP', 'SUPER_MODE', 'SUPER_MODE_2'],
    maxPerStage: 4, // Limited to 4 per stage
    imageKey: 'steriods-dash-1'
  },
  STEROIDS_DASH_2: {
    color: '#FF4444',
    size: 27,
    speed: 6.5,
    hp: 2,
    points: 220,
    canShoot: false,
    movementType: 'dash',
    guaranteedPowerUp: true,
    powerUpTypes: ['LEVEL_UP', 'SUPER_MODE', 'SUPER_MODE_2'],
    maxPerStage: 4,
    imageKey: 'steriods-dash-2'
  },
  STEROIDS_DASH_3: {
    color: '#FF4444',
    size: 29,
    speed: 7.0,
    hp: 3,
    points: 240,
    canShoot: false,
    movementType: 'dash',
    guaranteedPowerUp: true,
    powerUpTypes: ['LEVEL_UP', 'SUPER_MODE', 'SUPER_MODE_2'],
    maxPerStage: 4,
    imageKey: 'steriods-dash-3'
  },
  STEROIDS_DASH_4: {
    color: '#FF4444',
    size: 31,
    speed: 7.5,
    hp: 3,
    points: 260,
    canShoot: false,
    movementType: 'dash',
    guaranteedPowerUp: true,
    powerUpTypes: ['LEVEL_UP', 'SUPER_MODE', 'SUPER_MODE_2'],
    maxPerStage: 4,
    imageKey: 'steriods-dash-4'
  },
  STEROIDS_DASH_5: {
    color: '#FF4444',
    size: 33,
    speed: 8.0,
    hp: 4,
    points: 280,
    canShoot: false,
    movementType: 'dash',
    guaranteedPowerUp: true,
    powerUpTypes: ['LEVEL_UP', 'SUPER_MODE', 'SUPER_MODE_2'],
    maxPerStage: 4,
    imageKey: 'steriods-dash-5'
  },

  // Explode enemies - dash to middle, blast 3 bullets, exit
  ENEMY_EXPLODE_1: {
    color: '#FF8800',
    size: 55,
    speed: 8.0, // Very fast dash
    hp: 3,
    points: 300,
    canShoot: true,
    shootRate: 100, // Shoots immediately upon reaching middle
    bulletCount: 3, // Fires 3 bullets at once
    movementType: 'dash-exit', // Dash to middle, shoot, then exit
    highPowerUpChance: true, // Higher chance for power-ups
    imageKey: 'enemy-explode-1'
  },
  ENEMY_EXPLODE_2: {
    color: '#FF8800',
    size: 58,
    speed: 8.5,
    hp: 4,
    points: 350,
    canShoot: true,
    shootRate: 100,
    bulletCount: 3,
    movementType: 'dash-exit',
    highPowerUpChance: true,
    imageKey: 'enemy-explode-2'
  },
  ENEMY_EXPLODE_3: {
    color: '#FF8800',
    size: 60,
    speed: 9.0,
    hp: 5,
    points: 400,
    canShoot: true,
    shootRate: 100,
    bulletCount: 3,
    movementType: 'dash-exit',
    highPowerUpChance: true,
    imageKey: 'enemy-explode-3'
  }
};

// ==================== POWER-UP TYPES ====================
const POWERUP_TYPES = {
  TRIPLE_SHOT: {
    name: 'Triple Shot',
    icon: 'fire-3-direction-bullets.png',
    duration: 12000, // 12 seconds
    color: '#FF6600',
    rarity: 'common'
  },
  EXTRA_LIFE: {
    name: 'Extra Life',
    icon: 'additional-life.fw.png',
    duration: 0, // Permanent until hit
    color: '#FF69B4',
    rarity: 'common'
  },
  SCREEN_BOMB: {
    name: 'Screen Bomb',
    icon: 'bomb-all-enemy-in-the-screen.fw.png',
    duration: 0, // Instant effect
    color: '#FF0000',
    rarity: 'very_rare'
  },
  INVINCIBILITY: {
    name: 'Invincibility',
    icon: 'defense-imunity.fw.png',
    duration: 6000, // 6 seconds
    color: '#FFD700',
    rarity: 'rare'
  },
  TIME_FREEZE: {
    name: 'Time Freeze',
    icon: 'freeze-enemy.fw.png',
    duration: 5000, // 5 seconds
    color: '#00BFFF',
    rarity: 'rare'
  },
  DOUBLE_DAMAGE: {
    name: 'Double Damage',
    icon: 'green-fire-double-damage.fw.png',
    duration: 10000, // 10 seconds
    color: '#00FF00',
    rarity: 'uncommon'
  },
  LEVEL_UP: {
    name: 'Level Up',
    icon: 'level-up-spaceship.png',
    duration: 0, // Permanent until hit
    color: '#FF00FF',
    rarity: 'rare' // Increased from 'very_rare' to 'rare' (doubled spawn rate)
  },
  HOMING_MISSILES: {
    name: 'Homing Missiles',
    icon: 'lock-bullets-to-enemy.fw.png',
    duration: 8000, // 8 seconds
    color: '#FF1493',
    rarity: 'uncommon'
  },
  ORBIT_SHIELD: {
    name: 'Orbit Shield',
    icon: '2-balls-circle-on-player.fw.png',
    duration: 12000, // 12 seconds
    color: '#00FFFF',
    rarity: 'rare'
  },
  ALLY_SUPPORT: {
    name: 'Ally Support',
    icon: 'one-of-other-charater-will-appear-to-help.fw.png',
    duration: 12000, // 12 seconds
    color: '#FFE4B5',
    rarity: 'legendary'
  },
  SUPER_MODE: {
    name: 'Super Mode',
    icon: 'super-1.fw.png',
    duration: 7000, // 7 seconds
    color: '#FF4500',
    rarity: 'legendary',
    isLegendary: true
  },
  SUPER_MODE_2: {
    name: 'Super Mode 2',
    icon: 'super-2.fw.png',
    duration: 8000, // 8 seconds
    color: '#FFD700',
    rarity: 'legendary',
    isLegendary: true
  },
  COIN_100: {
    name: 'Coin +100',
    icon: 'coin-1.fw.png',
    duration: 0, // Instant effect
    color: '#FFD700',
    rarity: 'common',
    points: 100
  },
  COIN_1000: {
    name: 'Coin +1000',
    icon: 'coin-2.fw.png',
    duration: 0, // Instant effect
    color: '#FFA500',
    rarity: 'uncommon',
    points: 1000
  },
  COIN_10000: {
    name: 'Coin +10000',
    icon: 'coin-3.fw.png',
    duration: 0, // Instant effect
    color: '#FF4500',
    rarity: 'rare',
    points: 10000
  }
};

// ==================== POWER-UP CLASS ====================
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = POWERUP_TYPES[type];
    this.size = 28; // Increased to 70% of original size (40 * 0.7 = 28)
    this.active = true;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.angle = 0;
  }

  update(dt) {
    // Pulsing animation
    this.pulsePhase += dt * 3;
    this.angle += dt * 2;

    // Slowly fall down
    this.y += 1;

    // Deactivate if off screen
    if (this.y > window.innerHeight + 50) {
      this.active = false;
    }
  }

  render(ctx) {
    if (!this.active) return;

    const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
    const size = this.size * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.config.color;

    // Rotating background
    ctx.rotate(this.angle);
    ctx.fillStyle = this.config.color + '40'; // 25% opacity
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw power-up icon
    const icon = this.game?.assetLoader?.getImage(`powerup-${this.type}`);
    if (icon) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.drawImage(icon, -size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      // Fallback: draw colored circle with letter
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = this.config.color;
      ctx.beginPath();
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${size / 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.config.name[0], 0, 0);
      ctx.restore();
    }
  }
}

// ==================== GAME ENGINE ====================
class GameEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.callbacks = callbacks;
    
    // Character type (blue, red, yellow, pink) - will be set when ship is loaded
    this.characterType = 'blue'; // Default
    
    // Character color mapping
    this.characterColors = {
      blue: '#4488ff',
      red: '#ff4444',
      yellow: '#ffff44',
      pink: '#ff44ff'
    };
    
    // Set canvas to fullscreen (like old version)
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
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
    this.isGameOver = false;
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
      // Active power-ups with expiration times
      activePowerUps: {}, // { TRIPLE_SHOT: expirationTime, ... }
      permanentPowerUps: [], // ['EXTRA_LIFE', 'LEVEL_UP']
      
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
    
    // Orbit shield balls
    this.orbitBalls = [];
    
    // Object pools
    this.bulletPool = new ObjectPool(() => ({
      x: 0, y: 0, vx: 0, vy: 0, active: false, size: 5, color: '#fff', isEnemy: false
    }), 100);
    
    this.particlePool = new ObjectPool(() => ({
      x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 60, 
      color: '#fff', size: 3
    }), 300); // Increased pool to handle more particles safely
    
    // Asset loader
    this.assetLoader = new AssetLoader();
    
    // ==================== SOUND SYSTEM ====================
    this.soundManager = new SoundManager(); // Lazy loading audio system
    
    // ==================== VISIBILITY HANDLING ====================
    // Pause/resume audio when window is hidden/minimized
    this.handleVisibilityChange = () => {
      if (document.hidden) {
        // Window is hidden/minimized - pause all audio
        this.soundManager.pauseAll();
        console.log('🛑 Window hidden - audio paused');
      } else {
        // Window is visible again - resume audio
        if (this.isRunning && !this.isPaused) {
          this.soundManager.resumeAll();
          console.log('▶️ Window visible - audio resumed');
        }
      }
    };
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.bossActive = false;
    
    // Boss timer: boss spawns after 60 seconds
    this.bossTimer = 0;
    this.bossSpawnTime = 0; // Will be set by resetBossTimer()
    this.gameTime = 0;
    this.bossWarningShown = false; // Track if warning was shown
    
    // Enemy spawn volume increase system
    this.spawnVolumeIncrease = 0; // 0% to 100%
    this.lastVolumeIncreaseTime = 0; // Track last increase time
    this.volumeIncreaseInterval = 10000; // 10 seconds in milliseconds
    this.maxVolumeIncrease = 100; // Max 100% increase
    
    // Entrance animation system
    this.isEntranceAnimation = false;
    this.entrancePhase = 'idle'; // idle, ascending, stage_message, complete
    this.entranceTimer = 0;
    this.stageMessage = '';
    this.stageMessageOpacity = 0;
    
    // Stage clear animation system
    this.isStageClearing = false;
    this.stageClearPhase = 'idle'; // message, explode, flyUp, wipe, complete
    this.stageClearTimer = 0;
    this.stageClearProgress = 0;
    this.savedScore = 0;
    this.savedHp = 0;
    
    // Stars for space warp background
    this.stars = [];
    this.initStars();
    
    // Spawn timer
    this.lastSpawn = 0;
    this.spawnTimer = 0;
    this.spawnTimer = 0;
    this.currentLevel = 1;
    this.enemiesSpawned = 0;
    this.enemies = [];
    
    // Power-up system
    this.activePowerUps = []; // Array of PowerUp objects
    
    // CRITICAL: Setup input listeners for keyboard/mouse/touch!
    this.setupInputListeners();
  }
  
  setupInputListeners() {
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
    // Load player ship image based on character AND level
    this.characterType = characterType; // Store character type
    this.player.color = this.characterColors[characterType] || this.characterColors.blue; // Set player color
    const level = this.player.level || 0;
    const shipPaths = {
      blue: [
        '/assets/player/blue-level-0.fw.png',  // Level 0 (basic)
        '/assets/player/blue-level-1.fw.png',  // Level 1 (double shot)
        '/assets/player/blue-level-2.fw.png',  // Level 2 (triple shot)
        '/assets/player/blue-level-3.fw.png'   // Level 3 (quad shot)
      ],
      red: [
        '/assets/player/red-level-0.fw.png',
        '/assets/player/red-level-1.fw.png',
        '/assets/player/red-level-2.fw.png',
        '/assets/player/red-level-3.fw.png'
      ],
      yellow: [
        '/assets/player/yellow-level-0.fw.png',
        '/assets/player/yellow-level-1.fw.png',
        '/assets/player/yellow-level-2.fw.png',
        '/assets/player/yellow-level-3.fw.png'
      ],
      pink: [
        '/assets/player/pink-level-0.fw.png',
        '/assets/player/pink-level-1.fw.png',
        '/assets/player/pink-level-2.fw.png',
        '/assets/player/pink-level-3.fw.png'
      ]
    };
    
    const shipPathArray = shipPaths[characterType] || shipPaths.blue;
    const shipPath = shipPathArray[Math.min(level, 3)]; // Cap at level 3
    
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        this.player.shipImage = img;
        console.log(`Loaded ${characterType} ship level ${level}: ${shipPath}`);
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
      'enemy-1': '/assets/shooting-enemy/enemy-1.fw.png',
      'enemy-2': '/assets/shooting-enemy/enemy-2.fw.png',
      'enemy-3': '/assets/shooting-enemy/enemy-3.fw.png',
      'enemy-4': '/assets/shooting-enemy/enemy-4.fw.png',
      'enemy-5': '/assets/shooting-enemy/enemy-5.fw.png',
      // Non-shooting enemies
      'steroids-1': '/assets/none-shooting-enemy/steriods-1.fw.png',
      'steroids-2': '/assets/none-shooting-enemy/steriods-2.fw.png',
      'steroids-3': '/assets/none-shooting-enemy/steriods-3.fw.png',
      'steroids-4': '/assets/none-shooting-enemy/steriods-4.fw.png',
      'steroids-5': '/assets/none-shooting-enemy/steriods-5.fw.png',
      'steroids-6': '/assets/none-shooting-enemy/steriods-6.fw.png',
      // Bosses
      'boss-1': '/assets/boss/boss-1.fw.png',
      'boss-2': '/assets/boss/boss-2.fw.png',
      'boss-3': '/assets/boss/boss-3.fw.png',
      'boss-4': '/assets/boss/boss-4.fw.png',
      'boss-5': '/assets/boss/boss-5.fw.png',
      'boss-6': '/assets/boss/boss-6.fw.png',
      'boss-7': '/assets/boss/boss-7.fw.png',
      'boss-8': '/assets/boss/boss-8.fw.png',
      'boss-9': '/assets/boss/boss-9.fw.png',
      'boss-10': '/assets/boss/boss-10.fw.png',
      // Power-ups
      'powerup-TRIPLE_SHOT': '/assets/power-ups/fire-3-direction-bullets.png',
      'powerup-EXTRA_LIFE': '/assets/power-ups/additional-life.fw.png',
      'powerup-SCREEN_BOMB': '/assets/power-ups/bomb-all-enemy-in-the-screen.fw.png',
      'powerup-INVINCIBILITY': '/assets/power-ups/defense-imunity.fw.png',
      'powerup-TIME_FREEZE': '/assets/power-ups/freeze-enemy.fw.png',
      'powerup-DOUBLE_DAMAGE': '/assets/power-ups/green-fire-double-damage.fw.png',
      'powerup-LEVEL_UP': '/assets/power-ups/level-up-spaceship.png',
      'powerup-HOMING_MISSILES': '/assets/power-ups/lock-bullets-to-enemy.fw.png',
      'powerup-ORBIT_SHIELD': '/assets/power-ups/2-balls-circle-on-player.fw.png',
      'powerup-ALLY_SUPPORT': '/assets/power-ups/one-of-other-charater-will-appear-to-help.fw.png',
      'powerup-SUPER_MODE': '/assets/power-ups/super-1.fw.png',
      'powerup-SUPER_MODE_2': '/assets/power-ups/super-2.fw.png',
      // Coin power-ups
      'powerup-COIN_100': '/assets/power-ups/coin-1.fw.png',
      'powerup-COIN_1000': '/assets/power-ups/coin-2.fw.png',
      'powerup-COIN_10000': '/assets/power-ups/coin-3.fw.png',
      // Ship upgrades (all 4 colors, 4 levels each)
      // Blue ships
      'ship-blue-0': '/assets/player/blue-level-0.fw.png',
      'ship-blue-1': '/assets/player/blue-level-1.fw.png',
      'ship-blue-2': '/assets/player/blue-level-2.fw.png',
      'ship-blue-3': '/assets/player/blue-level-3.fw.png',
      // Red ships
      'ship-red-0': '/assets/player/red-level-0.fw.png',
      'ship-red-1': '/assets/player/red-level-1.fw.png',
      'ship-red-2': '/assets/player/red-level-2.fw.png',
      'ship-red-3': '/assets/player/red-level-3.fw.png',
      // Yellow ships
      'ship-yellow-0': '/assets/player/yellow-level-0.fw.png',
      'ship-yellow-1': '/assets/player/yellow-level-1.fw.png',
      'ship-yellow-2': '/assets/player/yellow-level-2.fw.png',
      'ship-yellow-3': '/assets/player/yellow-level-3.fw.png',
      // Pink ships
      'ship-pink-0': '/assets/player/pink-level-0.fw.png',
      'ship-pink-1': '/assets/player/pink-level-1.fw.png',
      'ship-pink-2': '/assets/player/pink-level-2.fw.png',
      'ship-pink-3': '/assets/player/pink-level-3.fw.png',
      // Base ships for ally companion
      'ally-ship-blue': '/assets/player/blue-ship.fw.png',
      'ally-ship-red': '/assets/player/red-ship.fw.png',
      'ally-ship-yellow': '/assets/player/yellow-ship.fw.png',
      'ally-ship-pink': '/assets/player/pink-ship.fw.png'
    };
    
    await this.assetLoader.preloadAssets(imageMap);
  }
  
  reset() {
    // Reset game state without starting
    this.player.x = this.canvas.width / 2;
    // Don't set player.y here - entrance animation will handle it
    this.player.score = 0;
    this.player.hp = 3;
    this.player.invincible = 0;
    this.player.level = 0; // Reset level to 0 (basic ship)
    
    // Reset spawn volume increase
    this.spawnVolumeIncrease = 0;
    this.lastVolumeIncreaseTime = 0;
    
    // Reset boss timer using boss configuration
    this.resetBossTimer();
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
    this.isGameOver = false; // CRITICAL: Reset game over flag!
    this.player.isDead = false; // Reset player death state
    
    // Initialize entrance animation AFTER all other setup
    this.startEntranceAnimation();
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    
    // ==================== START BACKGROUND MUSIC ====================
    this.soundManager?.playBackgroundMusic(this.currentLevel);
    
    this.gameLoop(this.lastTime);
    this.callbacks.onGameStart?.();
  }
  
  pause() {
    this.isPaused = true;
    // Pause all audio when game is paused
    this.soundManager?.pauseAll();
    this.callbacks.onGamePause?.();
  }
  
  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    // Resume all audio when game is resumed
    this.soundManager?.resumeAll();
    this.callbacks.onGameResume?.();
  }
  
  stop() {
    this.isRunning = false;
    // Remove visibility change listener to prevent memory leaks
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.callbacks.onGameOver?.(this.player.score);
    // Stop all audio
    this.soundManager?.pauseAll();
    this.soundManager?.stopBackgroundMusic();
  }
  
  // Screen Wipe Animation System
  startWipeAnimation(direction, callback = null) {
    this.isWipeAnimation = true;
    this.wipeDirection = direction;
    this.wipeCallback = callback;
    this.wipeTimer = Date.now();
    this.wipeProgress = 0;
    
    if (direction === 'out') {
      this.wipePhase = 'wipe_out';
      this.wipeProgress = 0;
    } else {
      this.wipePhase = 'wipe_in';
      this.wipeProgress = 1;
    }
    
    console.log(`Screen wipe animation started: ${direction}`);
  }
  
  updateWipeAnimation(dt) {
    if (!this.isWipeAnimation) return;
    
    const now = Date.now();
    const elapsed = now - this.wipeTimer;
    const wipeDuration = 800;
    const holdDuration = 300;
    
    if (this.wipePhase === 'wipe_out') {
      this.wipeProgress = Math.min(elapsed / wipeDuration, 1);
      if (this.wipeProgress >= 1) {
        this.wipePhase = 'hold';
        this.wipeTimer = now;
        this.wipeProgress = 1;
        if (this.wipeCallback) {
          this.wipeCallback();
          this.wipeCallback = null;
        }
      }
    } else if (this.wipePhase === 'hold') {
      if (elapsed >= holdDuration) {
        this.wipePhase = 'wipe_in';
        this.wipeTimer = now;
        this.wipeProgress = 1;
      }
    } else if (this.wipePhase === 'wipe_in') {
      this.wipeProgress = 1 - Math.min(elapsed / wipeDuration, 1);
      if (this.wipeProgress <= 0) {
        this.isWipeAnimation = false;
        this.wipeProgress = 0;
        this.wipePhase = 'idle';
      }
    }
  }
  
  renderWipeOverlay(ctx) {
    if (!this.isWipeAnimation || this.wipeProgress <= 0) return;
    
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${this.wipeProgress})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
  }
  
  // Entrance Animation
  startEntranceAnimation() {
    this.isEntranceAnimation = true;
    this.entrancePhase = 'ascending';
    this.entranceTimer = Date.now();
    
    // Position player off-screen at bottom
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height + 100; // Start below screen
    
    // Disable shooting during entrance
    this.entranceShootingDisabled = true;
    
    console.log('Entrance animation started');
  }
  
  updateEntranceAnimation(dt) {
    if (!this.isEntranceAnimation) return;
    
    const now = Date.now();
    const elapsed = now - this.entranceTimer;
    
    if (this.entrancePhase === 'ascending') {
      // Ascend from bottom to 25% from bottom
      const targetY = this.canvas.height - (this.canvas.height * 0.25);
      const ascentSpeed = 3; // Pixels per ms
      
      if (this.player.y > targetY) {
        this.player.y -= ascentSpeed * (dt / 16);
      } else {
        // Reached target, show stage message
        if (elapsed > 1500) {
          this.entrancePhase = 'stage_message';
          this.entranceTimer = now;
          
          // ==================== STAGE NOTIFICATION SOUND ====================
          // Ensure audio is unlocked before playing
          this.soundManager?.unlockAudio();
          
          this.soundManager?.play('ui.stageStart'); // Stage notification sound
          
          this.stageMessage = `STAGE ${this.currentLevel}`;
          this.stageMessageOpacity = 1;
          console.log(`Stage ${this.currentLevel} message shown`);
        }
      }
    } else if (this.entrancePhase === 'stage_message') {
      // Flash message for 2 seconds
      if (elapsed > 2000) {
        this.entrancePhase = 'complete';
        this.isEntranceAnimation = false;
        this.entranceShootingDisabled = false;
        
        // Keep player at current position (no teleport - already at correct spot)
        console.log('Entrance animation complete, game started');
      } else {
        // Flash effect (pulsing opacity)
        this.stageMessageOpacity = 0.5 + Math.sin(elapsed * 0.01) * 0.5;
      }
    }
  }
  
  // Spawn Volume Increase
  updateSpawnVolumeIncrease() {
    const now = Date.now();
    
    // Only increase during gameplay, not during boss
    if (this.bossActive) return;
    
    // Check if 10 seconds have passed since last increase
    if (now - this.lastVolumeIncreaseTime >= this.volumeIncreaseInterval) {
      // Increase spawn volume
      if (this.spawnVolumeIncrease < this.maxVolumeIncrease) {
        this.spawnVolumeIncrease += 5; // 5% for shooting enemies
        console.log(`Spawn volume increased to ${this.spawnVolumeIncrease}%`);
        this.lastVolumeIncreaseTime = now;
      }
    }
  }
  getSpawnRateMultiplier(enemyType) {
    // Calculate spawn rate multiplier based on volume increase
    // 5% for shooting enemies, 10% for non-shooting enemies
    const baseMultiplier = 1 + (this.spawnVolumeIncrease / 100);
    
    if (enemyType === 'non-shooting') {
      return baseMultiplier * 1.5;
    }
    return baseMultiplier;
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
  
    // Update wipe animation (highest priority - blocks everything)
    if (this.isWipeAnimation) {
      this.updateWipeAnimation(dt);
      return; // Skip all game logic during wipe
    }
  
    // Update stage clear animation (boss defeated sequence)
    if (this.isStageClearing) {
      this.updateStageClear(dt);
      return; // Skip all game logic during stage clear
    }
  
    // Update entrance animation (blocks normal gameplay until complete)
    if (this.isEntranceAnimation) {
      this.updateEntranceAnimation(dt);
      return; // Skip all game logic during entrance
    }
    
    // Update spawn volume increase every 10 seconds
    this.updateSpawnVolumeIncrease();
    
    this.handleInput();
    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.checkBossSpawn();
    this.updateStars(dt);
    this.updateEnemies(dt);
    this.updateParticles(dt);
    this.updatePowerUps(dt);
    this.updateAllySupport(dt);
    this.updateOrbitShield(dt);
    this.checkCollisions();
    this.spawnEnemies(dt);
    this.checkLevelProgress();
  }
  
  handleInput() {
    // Don't handle input if game is over
    if (this.isGameOver) return;
    
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
      const targetY = this.touch.y - 90; // 90px offset (finger below ship)
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
    // Don't shoot if game is over
    if (this.isGameOver) return;
  
    // Don't shoot during wipe or entrance animation
    if (this.isWipeAnimation) return;
    if (this.entranceShootingDisabled) return;
  
    // ==================== PLAYER SHOOTING SOUND ====================
    this.soundManager?.play('player.fire');
  
    // Check for Super 2 power-up - fires in all 360 degrees!
    if (this.hasActivePowerUp('SUPER_MODE_2')) {
      const numBullets = 12; // Fire 12 bullets in a circle
      const speed = 10;
      
      for (let i = 0; i < numBullets; i++) {
        const angle = (Math.PI * 2 / numBullets) * i;
        
        const bullet = this.bulletPool.get();
        bullet.x = this.player.x;
        bullet.y = this.player.y;
        bullet.vx = Math.cos(angle) * speed;
        bullet.vy = Math.sin(angle) * speed;
        bullet.active = true;
        bullet.color = '#FFD700'; // Golden bullets
        bullet.isEnemy = false;
        bullet.size = 10; // Double size (normal is 5)
        bullet.isHoming = false;
        bullet.damage = 1;
        this.bullets.push(bullet);
      }
      return; // Super 2 fires once per shot cycle, don't fire normal bullets
    }
    
    const baseSpeed = -10;
    const bulletColor = this.hasActivePowerUp('DOUBLE_DAMAGE') ? '#00FF00' : this.player.color;
    const isHoming = this.hasActivePowerUp('HOMING_MISSILES');
    
    // Determine bullet count based on player level and TRIPLE_SHOT power-up
    // Level 0: 1 bullet (basic)
    // Level 1: 2 bullets (double straight line)
    // Level 2: 3 bullets (triple straight line)
    // Level 3: 4 bullets (quad straight line)
    // TRIPLE_SHOT power-up adds +1 bullet to base level count
    let bulletCount = this.player.level + 1; // Level 0=1, Level 1=2, Level 2=3, Level 3=4
    
    // TRIPLE_SHOT power-up adds 1 extra bullet
    if (this.hasActivePowerUp('TRIPLE_SHOT')) {
      bulletCount += 1;
    }
    
    for (let i = 0; i < bulletCount; i++) {
      const bullet = this.bulletPool.get();
      
      // Calculate angle for spread (straight line for level upgrades)
      let angle = 0;
      let xOffset = 0;
      let yOffset = 0;
      
      if (this.hasActivePowerUp('TRIPLE_SHOT')) {
        // TRIPLE_SHOT: Use spread pattern with angle
        angle = (i - 1) * 0.3; // -0.3, 0, 0.3 radians (spread pattern)
        bullet.x = this.player.x;
        bullet.y = this.player.y - this.player.height / 2;
      } else {
        // Level-based firing: straight line with horizontal spacing
        // Level 0: 1 bullet (center)
        // Level 1: 2 bullets (left + right)
        // Level 2: 3 bullets (left, center, right)
        // Level 3: 4 bullets (left, center-left, center-right, right)
        const spacing = 12; // Horizontal spacing between bullets in pixels
        
        if (bulletCount === 1) {
          xOffset = 0;
        } else if (bulletCount === 2) {
          xOffset = (i - 0.5) * spacing; // -6, +6
        } else if (bulletCount === 3) {
          xOffset = (i - 1) * spacing; // -12, 0, +12
        } else if (bulletCount >= 4) {
          xOffset = (i - 1.5) * spacing; // -18, -6, +6, +18
        }
        
        bullet.x = this.player.x + xOffset;
        bullet.y = this.player.y - this.player.height / 2;
      }
      
      bullet.vx = Math.sin(angle) * 10;
      bullet.vy = Math.cos(angle) * baseSpeed;
      bullet.active = true;
      bullet.color = bulletColor;
      bullet.isEnemy = false;
      bullet.isHoming = isHoming; // Mark for homing behavior
      bullet.damage = this.hasActivePowerUp('DOUBLE_DAMAGE') ? 2 : 1;
      this.bullets.push(bullet);
    }
  }
  
  updatePlayer(dt) {
    if (this.player.invincible > 0) {
      this.player.invincible -= dt;
    }
    
    // Rocket thrust particle effect
    // Don't create thrust particles if player is dead or game over
    if (this.isRunning && !this.isPaused && !this.player.isDead && !this.isGameOver) {
      // Only create thrust particles while player is alive
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
      
      // Homing missile logic
      if (bullet.isHoming && !bullet.isEnemy) {
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        for (const enemy of this.enemies) {
          const dx = enemy.x - bullet.x;
          const dy = enemy.y - bullet.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = enemy;
          }
        }
        
        if (nearestEnemy && nearestDist < 500) {
          // Steer toward enemy
          const dx = nearestEnemy.x - bullet.x;
          const dy = nearestEnemy.y - bullet.y;
          const targetAngle = Math.atan2(dy, dx);
          const speed = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);
          bullet.vx = Math.cos(targetAngle) * speed;
          bullet.vy = Math.sin(targetAngle) * speed;
        }
      }
      
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
    // Time Freeze is now handled per-enemy below (bosses are immune)
    
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Time Freeze: Skip regular enemy updates if power-up is active (bosses immune)
      if (!enemy.isBoss && this.hasActivePowerUp('TIME_FREEZE')) {
        continue; // This enemy doesn't move or shoot
      }
      
      // Boss special movement
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
          // Dynamic boss movement pattern
          const sideSpeed = 2.7; // Speed for side-to-side movement (reduced by 10%)
          const margin = 100; // Margin from edges
          
          if (enemy.movementPhase === 0) {
            // Side-to-side movement phase
            enemy.x += sideSpeed * enemy.movementDirection;
            
            // Check if reached edge
            if (enemy.x >= this.canvas.width - margin) {
              enemy.movementDirection = -1; // Go left
              enemy.sideMovementCount++;
            } else if (enemy.x <= margin) {
              enemy.movementDirection = 1; // Go right
              enemy.sideMovementCount++;
            }
            
            // After 2 left + 2 right movements (4 total), go to center
            if (enemy.sideMovementCount >= 4) {
              enemy.movementPhase = 1; // Move to center phase
              enemy.sideMovementCount = 0; // Reset for next cycle
            }
          } else if (enemy.movementPhase === 1) {
            // Move to center
            const centerX = this.canvas.width / 2;
            const dx = centerX - enemy.x;
            if (Math.abs(dx) < 5) {
              enemy.x = centerX;
              enemy.movementPhase = 2; // Prepare to dash
            } else {
              enemy.x += Math.sign(dx) * sideSpeed;
            }
          } else if (enemy.movementPhase === 2) {
            // Dash forward toward player
            enemy.isDashing = true;
            enemy.dashSpeed = 12; // Increased from 8 to 12 - FASTER dash!
            enemy.y += enemy.dashSpeed;
            
            // Dash much further - aim to reach player's Y position!
            const playerY = this.player.y;
            const dashTargetY = Math.min(playerY - 100, enemy.targetY + 500); // Go much closer to player
            if (enemy.y >= dashTargetY) {
              enemy.movementPhase = 3; // Return phase
            }
          } else if (enemy.movementPhase === 3) {
            if (enemy.y > enemy.targetY) {
              enemy.y -= enemy.dashSpeed;
            } else {
              enemy.y = enemy.targetY;
              enemy.movementPhase = 0; // Restart cycle
              enemy.isDashing = false;
            }
          }
        }
        
        // Boss damage-based particle effects
        const hpPercent = enemy.hp / enemy.maxHp;
        
        // Smoke effect at 50% HP or below
        if (hpPercent <= 0.5 && hpPercent > 0.25) {
          // Create smoke particles occasionally
          if (Math.random() < 0.1) { // 10% chance per frame - REDUCED from 30% to prevent lag
            this.createSmokeParticle(enemy.x, enemy.y, enemy.size);
          }
        }
        
        // Burning effect at 25% HP or below
        if (hpPercent <= 0.25) {
          // More burn as HP decreases
          const burnIntensity = 1 - (hpPercent / 0.25); // 0 to 1 (more at lower HP)
          const burnChance = 0.05 + (burnIntensity * 0.15); // 5% to 20% chance per frame - REDUCED to prevent lag
          
          if (Math.random() < burnChance) {
            this.createBurningParticle(enemy.x, enemy.y, burnIntensity, enemy.size);
          }
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
      } else if (enemy.isDashEnemy) {
        // Dash enemy: moves straight toward player
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          // Move toward player
          enemy.x += (dx / distance) * enemy.speed;
          enemy.y += (dy / distance) * enemy.speed;
        }
        
        // Gentle wobble
        enemy.x += Math.sin(enemy.time * 0.005 + enemy.wobblePhase) * 0.3;
      } else if (enemy.isExplodeEnemy) {
        // Explode enemy: dash to middle, blast 3 bullets, exit
        if (!enemy.hasReachedMiddle) {
          // Phase 1: Dash to middle of screen
          const targetX = this.canvas.width / 2;
          const targetY = this.canvas.height / 3; // Upper third
          const dx = targetX - enemy.x;
          const dy = targetY - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 10) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
          } else {
            // Reached middle
            enemy.hasReachedMiddle = true;
            enemy.reachedMiddleTime = Date.now();
          }
        } else if (enemy.hasReachedMiddle && !enemy.hasFiredBurst) {
          // Phase 2: Fire 3 bullets immediately upon reaching middle
          for (let i = -1; i <= 1; i++) {
            this.soundManager?.play('enemy.fire');
            
            const bullet = this.bulletPool.get();
            if (bullet) {
              bullet.x = enemy.x;
              bullet.y = enemy.y + enemy.size / 2;
              
              // Calculate angle to player with spread
              const dx = this.player.x - enemy.x;
              const dy = this.player.y - enemy.y;
              const baseAngle = Math.atan2(dy, dx);
              const spreadAngle = baseAngle + (i * 0.3); // Wider spread
              
              const speed = enemy.bulletSpeed || 10; // Faster bullets for explode enemies
              bullet.vx = Math.cos(spreadAngle) * speed;
              bullet.vy = Math.sin(spreadAngle) * speed;
              bullet.isEnemyBullet = true;
              bullet.damage = enemy.bulletDamage || 1;
            }
          }
          enemy.hasFiredBurst = true;
        } else if (enemy.hasFiredBurst) {
          // Phase 3: Quick exit upward
          enemy.y -= enemy.speed * 1.5; // Exit faster than it entered
          enemy.x += Math.sin(enemy.time * 0.01) * 1; // Wider wobble on exit
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
        console.log(`💀 Boss HP reached 0! Removing boss and starting stage clear...`);
        this.bossDefeated();
        this.enemies.splice(i, 1); // Remove boss from enemies array
        i--; // Adjust index after removal
        continue; // Skip rest of loop for this boss
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
        // ==================== BOSS FIRING SOUND ====================
        if (i === -1) this.soundManager?.play('enemy.bossFire'); // Play once per shot
        
        const bullet = this.bulletPool.get();
        if (bullet) {
          bullet.x = boss.x;
          bullet.y = boss.y + boss.size / 2;
          
          // Calculate angle to player with spread
          const dx = this.player.x - boss.x;
          const dy = this.player.y - boss.y;
          const baseAngle = Math.atan2(dy, dx);
          const spreadAngle = baseAngle + (i * 0.2); // Spread by 0.2 radians
          
          const speed = 5.4; // Reduced by 10%
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
          // ==================== BOSS RAPID FIRE SOUND ====================
          this.soundManager?.play('enemy.bossFire'); // Each rapid shot
          
          const bullet = this.bulletPool.get();
          if (bullet) {
            bullet.x = boss.x;
            bullet.y = boss.y + boss.size / 2;
            
            // Aim directly at player
            const dx = this.player.x - boss.x;
            const dy = this.player.y - boss.y;
            const angle = Math.atan2(dy, dx);
            const speed = 7.2; // Reduced by 10%
            
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
      // ==================== BOSS SPREAD FIRE SOUND ====================
      this.soundManager?.play('enemy.bossFire'); // Spread shot
      
      for (let i = 0; i < bulletCount; i++) {
        const bullet = this.bulletPool.get();
        if (bullet) {
          bullet.x = boss.x;
          bullet.y = boss.y + boss.size / 2;
          
          const angle = (Math.PI * 2 / bulletCount) * i;
          const speed = 4.5; // Reduced by 10%
          
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
      
      // ==================== ENEMY SHOOTING SOUND ====================
      this.soundManager?.play('enemy.fire');
      
      enemy.lastShot = now;
    }
  }
  
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      // Safety limit: remove oldest particles if too many
      if (this.particles.length > 250) {
        this.particles.splice(0, 1);
      }
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
    
    // Orbit Shield collision with enemy bullets
    if (this.hasActivePowerUp('ORBIT_SHIELD') && this.orbitBalls.length > 0) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        if (!bullet.isEnemy) continue; // Only enemy bullets
        
        for (const ball of this.orbitBalls) {
          const ballX = this.player.x + Math.cos(ball.angle) * ball.distance;
          const ballY = this.player.y + Math.sin(ball.angle) * ball.distance;
          
          const dx = bullet.x - ballX;
          const dy = bullet.y - ballY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < ball.size + bullet.size) {
            // Destroy bullet
            this.createParticles(bullet.x, bullet.y, '#00FFFF', 10);
            this.bullets.splice(i, 1);
            this.bulletPool.release(bullet);
            break;
          }
        }
      }
    }
    
    // Orbit Shield collision with enemies
    if (this.hasActivePowerUp('ORBIT_SHIELD') && this.orbitBalls.length > 0) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        
        // Skip boss enemies - orbit shield doesn't damage bosses
        if (enemy.isBoss) continue;
        
        for (const ball of this.orbitBalls) {
          const ballX = this.player.x + Math.cos(ball.angle) * ball.distance;
          const ballY = this.player.y + Math.sin(ball.angle) * ball.distance;
          
          const dx = enemy.x - ballX;
          const dy = enemy.y - ballY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < ball.size + enemy.size) {
            // Hit enemy with orbit shield!
            this.enemyHit(enemy, i);
            
            // Create spark effect
            this.createParticles(ballX, ballY, '#00FFFF', 5);
            
            // If enemy destroyed, break to avoid index issues
            if (enemy.hp <= 0) {
              break;
            }
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
    // Check if invincible
    if (this.hasActivePowerUp('INVINCIBILITY')) {
      return; // No damage taken
    }
    
    this.player.hp--;
    
    // Reset player level to 0 when hit!
    if (this.player.level > 0) {
      const oldLevel = this.player.level;
      this.player.level = 0;
      console.log(`Player hit! Level ${oldLevel} → 0`);
      this.loadPlayerShip(this.characterType); // Reload basic ship
    }
    
    this.player.invincible = 2000;
    this.player.invincible = 2000;
    this.createParticles(this.player.x, this.player.y, this.player.color, 20);
    this.callbacks.onPlayerHit?.(this.player.hp);
    
    // ==================== PLAYER HIT SOUND ====================
    this.soundManager?.play('player.hit'); // Player hit sound!
    
    if (this.player.hp <= 0) {
      // EPIC explosion on last life!
      this.createExplosion(this.player.x, this.player.y, this.player.color, 60);
      
      // ==================== PLAYER DEATH SOUND ====================
      this.soundManager?.play('player.explode'); // Player explosion
      this.soundManager?.play('ui.gameOverNotif'); // Game over notification
      
      // 🛑 STOP BACKGROUND MUSIC on game over
      this.soundManager?.stopBackgroundMusic();
      
      // Hide player ship immediately
      this.player.isDead = true;
      
      // Show game over immediately, but keep game running
      this.callbacks.onGameOver?.(this.player.score);
      this.isGameOver = true; // Flag to stop player input but keep rendering
    }
  }
  
  
  enemyHit(enemy, index) {
    // Double Damage power-up
    const damage = this.hasActivePowerUp('DOUBLE_DAMAGE') ? 2 : 1;
    enemy.hp -= damage;
    
    // Boss hit effects - HUGE particles!
    // ==================== BOSS HIT SOUND ====================
    if (enemy.isBoss) {
      this.createBossHitExplosion(enemy.x, enemy.y, enemy.size);
      this.soundManager?.play('enemy.metalHit'); // Metal hit sound for boss
    }
    
    if (enemy.hp <= 0) {
      // Enemy destroyed
      this.player.score += enemy.points;
      
      // Power-up spawn logic
      if (!enemy.isBoss) {
        let shouldSpawnPowerUp = false;
        let powerUpType = null;
        
        if (enemy.isDashEnemy && enemy.guaranteedPowerUp) {
          // Dash enemies ALWAYS drop guaranteed power-ups
          shouldSpawnPowerUp = true;
          // Pick from guaranteed power-up types
          const types = enemy.powerUpTypes || ['LEVEL_UP', 'SUPER_MODE', 'SUPER_MODE_2'];
          powerUpType = types[Math.floor(Math.random() * types.length)];
        } else if (enemy.isExplodeEnemy && enemy.highPowerUpChance) {
          // Explode enemies have higher chance (50%)
          shouldSpawnPowerUp = Math.random() < 0.5;
        } else {
          // Regular enemies: 25% chance
          shouldSpawnPowerUp = Math.random() < 0.25;
        }
        
        if (shouldSpawnPowerUp) {
          if (powerUpType) {
            // Spawn specific power-up type
            const powerUp = new PowerUp(enemy.x, enemy.y, powerUpType);
            powerUp.game = this;
            this.powerUps.push(powerUp);
            this.soundManager?.play('powerup.spawn');
          } else {
            // Spawn random power-up
            this.spawnPowerUp(enemy.x, enemy.y);
          }
        }
      }
      
      // ==================== ENEMY DESTRUCTION SOUNDS ====================
      if (enemy.isBoss) {
        // Boss death: EPIC explosion with debris!
        this.createBossDeathExplosion(enemy.x, enemy.y, enemy.size);
        this.soundManager?.play('enemy.bossExplode'); // Boss explosion
        this.soundManager?.play('enemy.breakBones'); // Boss destruction
        this.bossDefeated(); // Start stage clear sequence!
        this.enemies.splice(index, 1);
        this.callbacks.onScoreUpdate?.(this.player.score);
        return; // Exit early - bossDefeated handles everything
      } else if (enemy.canShoot) {
        // Shooting enemy: explosive fire effect
        this.createFireExplosion(enemy.x, enemy.y, enemy.color);
        this.soundManager?.play('enemy.destroy'); // Shooting enemy destroyed
        this.enemies.splice(index, 1);
        this.callbacks.onScoreUpdate?.(this.player.score);
      } else {
        // Non-shooting enemy: double particle pop effect
        this.createParticles(enemy.x, enemy.y, enemy.color, 20); // Reduced from 40 to prevent lag
        this.soundManager?.play('enemy.destroyNonShooting'); // Non-shooting enemy destroyed
        this.enemies.splice(index, 1);
        this.callbacks.onScoreUpdate?.(this.player.score);
      }
    } else {
      // Enemy hit but not destroyed
      this.soundManager?.play('enemy.hit'); // Enemy hit sound
      if (enemy.canShoot) {
        // Shooting enemy hit: small fire burst
        this.createSmallFireBurst(enemy.x, enemy.y);
      } else {
        // Non-shooting enemy hit: double pop effect
        this.createParticles(enemy.x, enemy.y, enemy.color, 5); // Reduced from 10 to prevent lag
      }
    }
  }
  createSmallFireBurst(x, y) {
    // Small fire burst for shooting enemy hit (not destroyed)
    const fireColors = ['#FF6600', '#FF8C00', '#FFA500', '#FFD700'];
    for (let i = 0; i < 8; i++) {
      const particle = this.particlePool.get();
      particle.x = x;
      particle.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 15;
      particle.maxLife = 15;
      particle.color = fireColors[Math.floor(Math.random() * fireColors.length)];
      particle.size = Math.random() * 3 + 2;
      this.particles.push(particle);
    }
  }
  
  createSmokeParticle(x, y, bossSize = 0) {
    // Smoke particle for damaged boss - spread based on boss size
    const particle = this.particlePool.get();
    // Spread particles around boss based on its size (default 60px for regular enemies)
    const spread = Math.max(60, bossSize * 0.8); // Scale with boss size
    const offsetX = (Math.random() - 0.5) * spread * 2;
    const offsetY = (Math.random() - 0.5) * spread * 2;
    particle.x = x + offsetX;
    particle.y = y + offsetY;
    
    // Smoke rises upward
    particle.vx = (Math.random() - 0.5) * 1; // Slight horizontal drift
    particle.vy = -Math.random() * 2 - 1; // Upward (negative Y)
    
    particle.life = 40 + Math.random() * 20; // 40-60 frames
    particle.maxLife = particle.life;
    
    // Smoke colors: gray to dark gray
    const smokeColors = ['#666666', '#777777', '#888888', '#999999', '#AAAAAA'];
    particle.color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
    particle.size = Math.random() * 10 + 8; // 8-18px - large smoke puffs
    // Scale up smoke for large boss
    if (bossSize > 100) particle.size *= 1.5;
    this.particles.push(particle);
  }
  
  createBurningParticle(x, y, intensity, bossSize = 0) {
    // Burning particle for heavily damaged boss - spread based on boss size
    const particle = this.particlePool.get();
    // Spread particles around boss based on its size
    const baseSpread = Math.max(60, bossSize * 0.7); // Scale with boss size
    const spread = baseSpread + (1 - intensity) * 40; // More spread at higher HP
    const offsetX = (Math.random() - 0.5) * spread;
    const offsetY = (Math.random() - 0.5) * spread;
    particle.x = x + offsetX;
    particle.y = y + offsetY;
    
    // Fire rises and spreads
    particle.vx = (Math.random() - 0.5) * 3; // Horizontal spread
    particle.vy = -Math.random() * 3 - 2; // Upward (negative Y)
    
    // Longer life at higher intensity
    particle.life = 25 + Math.random() * 15 + (intensity * 20); // 25-60 frames
    particle.maxLife = particle.life;
    
    // Fire colors: orange to yellow to white
    const fireColors = ['#FF4500', '#FF6600', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#FFFFFF'];
    // Prefer brighter colors at higher intensity
    const colorIndex = Math.floor(Math.random() * (fireColors.length - intensity * 3));
    particle.color = fireColors[Math.max(0, colorIndex)];
    
    // Larger at higher intensity, scale for boss
    particle.size = Math.random() * 6 + 3 + (intensity * 4); // 3-13px
    if (bossSize > 100) particle.size *= 1.8; // Bigger fire for boss
    this.particles.push(particle);
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
      particle.life = 30 + Math.random() * 20;
      particle.maxLife = particle.life;
      particle.color = color;
      particle.size = Math.random() * 3 + 2;
      this.particles.push(particle);
    }
  }
  
  createExplosion(x, y, color, count) {
    // Create a massive explosion for player death
    const explosionColors = [color, '#FF0000', '#FF4500', '#FF8C00', '#FFD700'];
    for (let i = 0; i < count; i++) {
      const particle = this.particlePool.get();
      particle.x = x;
      particle.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4; // Very fast explosion
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 50 + Math.random() * 30; // Long lasting
      particle.maxLife = particle.life;
      particle.color = explosionColors[Math.floor(Math.random() * explosionColors.length)];
      particle.size = Math.random() * 8 + 4; // Large particles
      this.particles.push(particle);
    }
  }
  
  createBossHitExplosion(x, y, bossSize = 160) {
    // HUGE particle burst when boss is hit - spread based on boss size
    const hitColors = ['#FF00FF', '#FF66FF', '#FFAAFF', '#FFFFFF'];
    
    for (let i = 0; i < 15; i++) {
      const particle = this.particlePool.get();
      // Spawn particles around boss edge for visibility
      const angle = (i / 15) * Math.PI * 2;
      const spawnRadius = bossSize * 0.5; // Half boss size
      particle.x = x + Math.cos(angle) * spawnRadius;
      particle.y = y + Math.sin(angle) * spawnRadius * 0.6; // Flatten Y for boss aspect
      
      const angle2 = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3; // 3-9 speed
      particle.vx = Math.cos(angle2) * speed;
      particle.vy = Math.sin(angle2) * speed;
      particle.life = 20 + Math.random() * 10; // 20-30 frames
      particle.maxLife = particle.life;
      // Fire gradient: red -> orange -> gold -> white
      const fireColors = ['#FF0000', '#FF4500', '#FF6600', '#FF8C00', '#FFD700', '#FFFFFF'];
      particle.color = fireColors[Math.floor(Math.random() * fireColors.length)];
      particle.size = Math.random() * 5 + 3; // 3-8px - larger for visibility
      // Scale up for large boss
      if (bossSize > 100) particle.size *= 2;
      
      this.particles.push(particle);
    }
  }
  
  createBossDeathExplosion(x, y, bossSize = 160) {
    // EPIC final explosion with debris! Spread based on boss size
    const debrisCount = 30; // Reduced from 50 to prevent lag
    
    // Phase 1: Massive fire explosion
    const fireColors = ['#FF0000', '#FF4500', '#FF6600', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#FFFFFF'];
    for (let i = 0; i < 30; i++) {
      const particle = this.particlePool.get();
      particle.x = x + (Math.random() - 0.5) * bossSize * 0.8;
      particle.y = y + (Math.random() - 0.5) * bossSize * 0.6;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4; // Very fast (4-12 speed)
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 40 + Math.random() * 20; // 40-60 frames - long lasting!
      particle.maxLife = particle.life;
      particle.color = fireColors[Math.floor(Math.random() * fireColors.length)];
      particle.size = Math.random() * 8 + 4; // 4-12px - HUGE!
      if (bossSize > 100) particle.size *= 1.2; // Reduced scale
      this.particles.push(particle);
    }
    
    // Phase 2: Debris chunks (larger, slower pieces)
    for (let i = 0; i < debrisCount; i++) {
      const particle = this.particlePool.get();
      const spreadX = (Math.random() - 0.5) * bossSize;
      const spreadY = (Math.random() - 0.5) * bossSize * 0.75;
      particle.x = x + spreadX;
      particle.y = y + spreadY;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2; // Debris flies (2-7 speed)
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 60 + Math.random() * 30; // 60-90 frames - very long lasting!
      particle.maxLife = particle.life;
      // Debris colors: dark pieces
      const debrisColors = ['#333333', '#444444', '#555555', '#666666', '#777777'];
      particle.color = debrisColors[Math.floor(Math.random() * debrisColors.length)];
      particle.size = Math.random() * 15 + 8; // 8-23px - MASSIVE debris chunks!
      if (bossSize > 100) particle.size *= 1.1; // Reduced scale
      this.particles.push(particle);
    }
  }
  createFireExplosion(x, y, baseColor) {
    // Explosive fire effect with multiple colors
    const fireColors = ['#FF4500', '#FF6600', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00'];
    
    for (let i = 0; i < 10; i++) {
      const particle = this.particlePool.get();
      particle.x = x;
      particle.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 30 + Math.random() * 15;
      particle.maxLife = particle.life;
      particle.color = fireColors[Math.floor(Math.random() * fireColors.length)];
      particle.size = Math.random() * 5 + 3;
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
    // Track dash enemies per stage (max 4)
    if (!this.dashEnemiesSpawnedThisStage) {
      this.dashEnemiesSpawnedThisStage = 0;
    }
    // Calculate enemy tier based on current stage (1-13)
    const enemyTier = Math.min(this.currentLevel, 13);
    
    // Small chance to spawn special dash enemies (3% chance, max 4 per stage)
    if (this.dashEnemiesSpawnedThisStage < 4 && Math.random() < 0.03 && enemyTier >= 1) {
      const dashTier = Math.min(enemyTier, 5); // Dash enemies have 5 variants
      const dashTypeKey = `STEROIDS_DASH_${dashTier}`;
      
      if (ENEMY_TYPES[dashTypeKey]) {
        this.spawnDashEnemy(dashTypeKey);
        this.dashEnemiesSpawnedThisStage++;
        return;
      }
    }
    
    // Small chance to spawn explode enemies (2% chance, stages 3+)
    if (Math.random() < 0.02 && enemyTier >= 3) {
      const explodeTier = Math.min(Math.floor((enemyTier - 2) / 3) + 1, 3); // Maps stages to explode 1-3
      const explodeTypeKey = `ENEMY_EXPLODE_${explodeTier}`;
      
      if (ENEMY_TYPES[explodeTypeKey]) {
        this.spawnExplodeEnemy(explodeTypeKey);
        return;
      }
    }
    
    // Weighted spawn: 70% non-shooting (steroids), 30% shooting
    let typeKey;
    
    if (Math.random() < 0.7) {
      // Spawn non-shooting enemy (steroids) - RANDOM variety!
      // Always use the original 6 types for variety in size, HP, speed
      const randomSteroids = ['STEROIDS_1', 'STEROIDS_2', 'STEROIDS_3', 'STEROIDS_4', 'STEROIDS_5', 'STEROIDS_6'];
      typeKey = randomSteroids[Math.floor(Math.random() * randomSteroids.length)];
    } else {
      // Spawn shooting enemy - DEDICATED TO STAGE
      // Stage 1 = SHOOTING_1 (enemy-1), Stage 2 = SHOOTING_2 (enemy-2), etc.
      const shootingType = `SHOOTING_${enemyTier}`;
      
      if (ENEMY_TYPES[shootingType]) {
        typeKey = shootingType;
      } else {
        // Fallback to SHOOTING_1 if tier not available
        typeKey = 'SHOOTING_1';
      }
    }
    const type = ENEMY_TYPES[typeKey];
    
    // Debug logging to verify shooting enemies spawn
    if (type.canShoot) {
      console.log('Spawning shooting enemy:', typeKey);
    }
    
    
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
      lastShot: type.canShoot ? Date.now() - 1000 : null // Fire immediately (set lastShot to 1 second ago)
    };
    
    // Store initial velocity for multi-directional enemies
    if (type.canShoot) {
      enemy.vx = velocityX;
      enemy.vy = velocityY;
      enemy.entryPattern = entryPattern; // Track entry pattern for guaranteed shots
      // 🔥 FIRE IMMEDIATELY upon entering screen
      this.enemyShoot(enemy);
      console.log(`Shooting enemy firing immediately on entry: ${typeKey}`);
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
      // Shooting enemies: DEDICATED TO STAGE (Stage 1 = enemy-1, Stage 2 = enemy-2, etc.)
      const imageNum = enemyTier;
      enemy.image = this.assetLoader.getImage(`enemy-${imageNum}`);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Shooting enemy image not loaded: enemy-${imageNum}`);
      }
    } else if (typeKey.startsWith('STEROIDS') && !typeKey.startsWith('STEROIDS_DASH')) {
      // Non-shooting enemies (steroids): RANDOM variety from original 6 types
      // Extract the number from typeKey (e.g., STEROIDS_3 -> 3)
      const steroidNum = parseInt(typeKey.split('_')[1]);
      enemy.image = this.assetLoader.getImage(`steroids-${steroidNum}`);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Steroid enemy image not loaded: steroids-${steroidNum}`);
      }
    } else if (typeKey.startsWith('STEROIDS_DASH')) {
      // Dash enemies use their own image keys
      const dashNum = parseInt(typeKey.split('_')[2]); // STEROIDS_DASH_3 -> 3
      enemy.image = this.assetLoader.getImage(`steriods-dash-${dashNum}`);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Dash enemy image not loaded: steriods-dash-${dashNum}`);
      }
    } else if (typeKey.startsWith('ENEMY_EXPLODE')) {
      // Explode enemies use their own image keys
      const explodeNum = parseInt(typeKey.split('_')[2]); // ENEMY_EXPLODE_2 -> 2
      enemy.image = this.assetLoader.getImage(`enemy-explode-${explodeNum}`);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Explode enemy image not loaded: enemy-explode-${explodeNum}`);
      }
    }
    
    this.enemies.push(enemy);
  }
  
  spawnDashEnemy(typeKey) {
    const type = ENEMY_TYPES[typeKey];
    const enemyTier = Math.min(this.currentLevel, 13);
    
    // Spawn from random side
    const spawnSide = Math.random() < 0.5 ? 'left' : 'right';
    let spawnX = spawnSide === 'left' ? -50 : this.canvas.width + 50;
    let spawnY = Math.random() * (this.canvas.height / 2); // Top half only
    
    const enemy = {
      x: spawnX,
      y: spawnY,
      type: typeKey,
      isEnemy: true,
      isDashEnemy: true, // Flag for special movement
      ...type,
      time: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      spawnSide: spawnSide
    };
    
    // Scale HP with level
    enemy.hp = type.hp + Math.floor(this.currentLevel / 3);
    enemy.maxHp = enemy.hp;
    
    // Load dash enemy image
    if (type.imageKey) {
      enemy.image = this.assetLoader.getImage(type.imageKey);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Dash enemy image not loaded: ${type.imageKey}`);
      }
    }
    
    this.enemies.push(enemy);
    console.log(`Spawned dash enemy: ${typeKey} from ${spawnSide}`);
  }
  
  spawnExplodeEnemy(typeKey) {
    const type = ENEMY_TYPES[typeKey];
    const enemyTier = Math.min(this.currentLevel, 13);
    
    // Spawn from top
    let spawnX = Math.random() * (this.canvas.width - 100) + 50;
    let spawnY = -50;
    
    const enemy = {
      x: spawnX,
      y: spawnY,
      type: typeKey,
      isEnemy: true,
      isExplodeEnemy: true, // Flag for special behavior
      ...type,
      time: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      hasReachedMiddle: false,
      hasFiredBurst: false,
      isExiting: false
    };
    
    // Scale HP with level
    enemy.hp = type.hp + Math.floor(this.currentLevel / 3);
    enemy.maxHp = enemy.hp;
    
    // Load explode enemy image
    if (type.imageKey) {
      enemy.image = this.assetLoader.getImage(type.imageKey);
      if (!enemy.image || !enemy.image.complete) {
        console.warn(`Explode enemy image not loaded: ${type.imageKey}`);
      }
    }
    
    this.enemies.push(enemy);
    console.log(`Spawned explode enemy: ${typeKey}`);
  }
  
  // ==================== POWER-UP SYSTEM ====================
  
  spawnPowerUp(x, y) {
    // Determine rarity weights
    const rarity = this.getRandomRarity();
    const availableTypes = Object.keys(POWERUP_TYPES).filter(
      type => POWERUP_TYPES[type].rarity === rarity
    );
    
    // Fallback to common if no types available for this rarity
    const typesToPick = availableTypes.length > 0 ? availableTypes :
      Object.keys(POWERUP_TYPES).filter(type => POWERUP_TYPES[type].rarity === 'common');
    
    const randomType = typesToPick[Math.floor(Math.random() * typesToPick.length)];
    
    const powerUp = new PowerUp(x, y, randomType);
    powerUp.game = this;
    this.powerUps.push(powerUp);
    
    // ==================== POWER-UP SPAWN SOUND ====================
    this.soundManager?.play('powerup.spawn'); // Power-up appears
  }
  
  getRandomRarity() {
    const rand = Math.random();
    if (rand < 0.40) return 'common';      // 40%
    if (rand < 0.65) return 'uncommon';    // 25%
    if (rand < 0.85) return 'rare';        // 20%
    if (rand < 0.95) return 'very_rare';   // 10%
    return 'legendary';                    // 5%
  }
  
  updatePowerUps(dt) {
    // Update floating power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(dt);
      
      // Check collision with player
      if (powerUp.active && this.checkPowerUpCollision(powerUp)) {
        this.activatePowerUp(powerUp);
        powerUp.active = false;
        this.powerUps.splice(i, 1);
      } else if (!powerUp.active) {
        this.powerUps.splice(i, 1);
      }
    }
    
    // Update active power-up timers
    this.updateActivePowerUps();
  }
  
  checkPowerUpCollision(powerUp) {
    const dx = powerUp.x - this.player.x;
    const dy = powerUp.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (powerUp.size / 2 + this.player.width / 2);
  }
  
  activatePowerUp(powerUp) {
    const type = powerUp.type;
    const config = POWERUP_TYPES[type];
    
    // Create pickup particles
    this.createParticles(powerUp.x, powerUp.y, config.color, 15);
    
    // ==================== POWER-UP COLLECTION SOUND ====================
    if (type === 'SUPER_MODE') {
      this.soundManager?.play('powerup.superCollect'); // Super power-up
    } else if (type === 'LEVEL_UP') {
      this.soundManager?.play('powerup.jackpot'); // Level up = jackpot
    } else {
      this.soundManager?.play('powerup.collect'); // Normal power-up
    }
    
    // Handle instant effects
    if (type === 'SCREEN_BOMB') {
      this.activateScreenBomb();
      return;
    }
    
    if (type === 'EXTRA_LIFE') {
      this.player.hp = Math.min(this.player.hp + 1, 5);
      this.callbacks.onLivesChange?.(this.player.hp);
      return;
    }
    
    if (type === 'LEVEL_UP') {
      this.activateLevelUp();
      this.callbacks.onPowerUpActivated?.('LEVEL_UP');
      this.callbacks.onAvatarStateChange?.('power-up');
      return;
    }
    
    // Handle COIN power-ups - instant score bonus
    if (type === 'COIN_100' || type === 'COIN_1000' || type === 'COIN_10000') {
      this.player.score += config.points;
      this.callbacks.onScoreUpdate?.(this.player.score);
      this.createParticles(powerUp.x, powerUp.y, config.color, 20);
      console.log(`Collected ${config.name}: +${config.points} points!`);
      return; // Don't activate as timed power-up
    }
    
    // Handle SUPER MODE - activates all power-ups at once!
    if (type === 'SUPER_MODE') {
      const now = Date.now();
      const superDuration = config.duration;
      
      // Activate all timed power-ups
      const powerUpsToActivate = ['TRIPLE_SHOT', 'DOUBLE_DAMAGE', 'HOMING_MISSILES', 
                                    'ORBIT_SHIELD', 'ALLY_SUPPORT', 'INVINCIBILITY', 'TIME_FREEZE'];
      
      for (const puType of powerUpsToActivate) {
        if (!this.player.activePowerUps[puType]) {
          this.player.activePowerUps[puType] = [];
        }
        this.player.activePowerUps[puType].push(now + superDuration);
        console.log(`SUPER MODE: Activated ${POWERUP_TYPES[puType].name}`);
      }
      
      // Epic screen flash for super mode!
      this.callbacks.onPowerUpActivated?.('SUPER_MODE');
      this.callbacks.onAvatarStateChange?.('power-up');
      this.screenFlash = 2.0; // Brighter flash
      return;
    }
    
    // Handle timed power-ups (can stack)
    const now = Date.now();
    if (!this.player.activePowerUps[type]) {
      this.player.activePowerUps[type] = [];
    }
    
    // Add new instance with expiration time
    const expirationTime = now + config.duration;
    this.player.activePowerUps[type].push(expirationTime);
    
    // Notify React of power-up activation for avatar reaction
    this.callbacks.onPowerUpActivated?.(type);
    this.callbacks.onAvatarStateChange?.('power-up');
    
    // Log activation
    console.log(`Activated ${config.name} for ${config.duration}ms`);
  }
  
  activateScreenBomb() {
    // Destroy all enemies on screen (except boss - boss is immune)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.isBoss) continue; // Boss is immune to screen bomb
      this.player.score += enemy.points;
      this.createExplosion(enemy.x, enemy.y, enemy.color, 30);
      this.enemies.splice(i, 1);
    }
    
    // Clear all enemy bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      if (this.bullets[i].isEnemy) {
        this.bullets.splice(i, 1);
      }
    }
    
    this.callbacks.onScoreUpdate?.(this.player.score);
    
    // Epic screen flash
    this.screenFlash = 1.0;
  }
  
  activateLevelUp() {
    if (this.player.level < 3) {
      this.player.level++;
      console.log(`Level Up! Now at level ${this.player.level}`);
      
      // EPIC level-up explosion effect!
      this.createExplosion(this.player.x, this.player.y, this.player.color, 40);
      this.screenFlash = 0.5; // Screen flash effect
      
      // Load upgraded ship image (level-based)
      this.loadPlayerShip(this.characterType);
      
      // Notify React of level up for avatar reaction
      this.callbacks.onLevelUp?.(this.player.level);
      this.callbacks.onPowerUpActivated?.('LEVEL_UP');
      this.callbacks.onAvatarStateChange?.('power-up');
      
      // Log new fire pattern
      const patterns = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];
      console.log(`Fire Pattern: ${patterns[this.player.level]}`);
    } else {
      // Already at max level, give extra points instead
      this.player.score += 5000;
      this.callbacks.onScoreUpdate?.(this.player.score);
    }
  }
  
  updateActivePowerUps() {
    const now = Date.now();
    
    // Check each power-up type
    for (const type in this.player.activePowerUps) {
      const instances = this.player.activePowerUps[type];
      
      // Remove expired instances
      for (let i = instances.length - 1; i >= 0; i--) {
        if (now >= instances[i]) {
          console.log(`Expired: ${POWERUP_TYPES[type].name}`);
          instances.splice(i, 1);
        }
      }
      
      // Clean up empty arrays
      if (instances.length === 0) {
        delete this.player.activePowerUps[type];
      }
    }
  }
  
  hasActivePowerUp(type) {
    return this.player.activePowerUps[type] && 
           this.player.activePowerUps[type].length > 0;
  }
  
  getActivePowerUpsList() {
    return Object.keys(this.player.activePowerUps);
  }
  
  renderPowerUps(ctx) {
    for (const powerUp of this.powerUps) {
      powerUp.render(ctx);
    }
  }
  
  // ==================== ORBIT SHIELD ====================
  
  updateOrbitShield(dt) {
    if (this.hasActivePowerUp('ORBIT_SHIELD')) {
      // Initialize orbit balls if not exists
      if (this.orbitBalls.length === 0) {
        for (let i = 0; i < 2; i++) {
          this.orbitBalls.push({
            angle: (Math.PI * 2 / 2) * i,
            distance: 50,
            size: 15
          });
        }
      }
      
      // Update orbit angles
      for (const ball of this.orbitBalls) {
        ball.angle += dt * 3; // Orbit speed
      }
    } else {
      // Clear orbit balls when power-up expires
      this.orbitBalls = [];
    }
  }
  
  renderOrbitShield(ctx) {
    if (!this.hasActivePowerUp('ORBIT_SHIELD') || this.orbitBalls.length === 0) return;
    
    for (const ball of this.orbitBalls) {
      const x = this.player.x + Math.cos(ball.angle) * ball.distance;
      const y = this.player.y + Math.sin(ball.angle) * ball.distance;
      
      // Draw orbiting ball with glow
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00FFFF';
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(x, y, ball.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // ==================== ALLY SUPPORT ====================
  
  updateAllySupport(dt) {
    if (this.hasActivePowerUp('ALLY_SUPPORT')) {
      if (!this.allyShip) {
        // Create ally ship
        this.allyShip = {
          x: this.player.x - 100,
          y: this.player.y,
          lastShot: 0,
          fireRate: 300
        };
      }
      
      // Ally follows player
      this.allyShip.x += (this.player.x - 100 - this.allyShip.x) * 0.05;
      this.allyShip.y += (this.player.y - this.allyShip.y) * 0.05;
      
      // Ally shoots at enemies
      const now = Date.now();
      if (now - this.allyShip.lastShot > this.allyShip.fireRate) {
        this.allyShip.lastShot = now;
        
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;
        for (const enemy of this.enemies) {
          const dx = enemy.x - this.allyShip.x;
          const dy = enemy.y - this.allyShip.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = enemy;
          }
        }
        
        if (nearestEnemy) {
          // Shoot at enemy
          const dx = nearestEnemy.x - this.allyShip.x;
          const dy = nearestEnemy.y - this.allyShip.y;
          const angle = Math.atan2(dy, dx);
          
          const bullet = this.bulletPool.get();
          bullet.x = this.allyShip.x;
          bullet.y = this.allyShip.y;
          bullet.vx = Math.cos(angle) * 10;
          bullet.vy = Math.sin(angle) * 10;
          bullet.active = true;
          bullet.color = '#FFE4B5';
          bullet.isEnemy = false;
          bullet.damage = 1;
          this.bullets.push(bullet);
        }
      }
    } else {
      this.allyShip = null;
    }
  }
  
  renderAllySupport(ctx) {
    if (!this.hasActivePowerUp('ALLY_SUPPORT') || !this.allyShip) return;
    
    ctx.save();
    ctx.translate(this.allyShip.x, this.allyShip.y);
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFE4B5';
    ctx.fillStyle = '#FFE4B5';
    
    // Draw ally ship (simple triangle for now)
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-10, 10);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
  
  // Helper function to get boss configuration for current level
  getBossConfig() {
    const bossStage = Math.min(this.currentLevel, 5);
    const bossKey = `STAGE_${bossStage}`;
    return BOSSES[bossKey] || BOSSES.STAGE_1;
  }
  
  spawnBoss() {
    this.bossActive = true;
    const bossConfig = this.getBossConfig();
    
    const boss = {
      x: this.canvas.width / 2,
      y: -80,
      type: 'BOSS',
      size: bossConfig.size,
      speed: bossConfig.speed,
      targetY: bossConfig.targetY || 150,
      hp: bossConfig.hp + (this.currentLevel * 5), // Scale HP with level
      maxHp: bossConfig.maxHp + (this.currentLevel * 5),
      points: bossConfig.points,
      color: bossConfig.color,
      time: 0,
      wobblePhase: 0,
      lastShot: 0,
      canShoot: true,
      shootRate: bossConfig.shootRate,
      isBoss: true,
      hasReachedPosition: false,
      movementPhase: 0,
      movementDirection: 1,
      sideMovementCount: 0,
      dashSpeed: bossConfig.movementSpeed || 2.0,
      isDashing: false,
      dashTargetY: 0,
      attackPattern: bossConfig.attackPatterns || ['straight'],
      attackPatternIndex: 0,
      rapidFireTimer: 0,
      bulletSpeed: bossConfig.bulletSpeed || 6,
      bulletDamage: bossConfig.bulletDamage || 1,
      hasSpecialAttack: bossConfig.hasSpecialAttack || false,
      specialAttackInterval: bossConfig.specialAttackInterval || 0,
      lastSpecialAttack: 0,
      movementType: bossConfig.movementType || 'side-to-side',
      name: bossConfig.name,
      stage: bossConfig.stage,
      image: this.assetLoader.getImage(bossConfig.imageKey)
    };
    
    this.enemies.push(boss);
    console.log(`Boss spawned: ${bossConfig.name} (Stage ${bossConfig.stage})`);
    this.callbacks.onBossSpawn?.(bossConfig.stage);
    
    // ==================== BOSS MUSIC START ====================
    // Start boss fight background music (alternates between track 1 & 2 based on stage)
    this.soundManager?.playBossMusic(this.currentLevel);
    console.log(`🎵 Boss fight music started for Stage ${this.currentLevel}`);
  }
  
  // Helper function to get boss configuration for current level
  getBossConfig() {
    const bossStage = Math.min(this.currentLevel, 5);
    const bossKey = `STAGE_${bossStage}`;
    return BOSSES[bossKey] || BOSSES.STAGE_1;
  }
  
  // Reset boss timer based on current boss configuration
  resetBossTimer() {
    const bossConfig = this.getBossConfig();
    this.bossSpawnTime = bossConfig.spawnTime * 1000; // Convert seconds to milliseconds
    this.bossTimer = this.bossSpawnTime;
    this.gameTime = 0;
    this.bossWarningShown = false;
    console.log(`Boss timer reset: ${bossConfig.spawnTime}s (${bossConfig.name})`);
  }
  
  checkLevelProgress() {
    this.enemiesSpawned++;
  }
  
  bossDefeated() {
    this.bossActive = false;
    
    console.log('🎯 BOSS DEFEATED! Starting stage clear sequence...');
    console.log(`Current enemies count: ${this.enemies.length}`);
    
    // Start stage clear sequence immediately
    this.isStageClearing = true;
    this.stageClearPhase = 'message'; // message, explode, flyUp, wipe, complete
    this.stageClearTimer = Date.now();
    this.stageClearProgress = 0;
    
    // Show "STAGE X Clear" message immediately (will be cleared after 2s)
    this.callbacks.onStageCleared?.(this.currentLevel);
    console.log(`✅ Called onStageCleared callback for stage ${this.currentLevel}`);
    
    // ==================== STAGE CLEAR SOUND ====================
    this.soundManager?.play('ui.winFireworks'); // Victory/fireworks sound!
    
    // ==================== BOSS MUSIC STOP ====================
    // Stop boss fight music and resume normal background music
    this.soundManager?.stopBossMusic(this.currentLevel);
    console.log(`🎵 Boss fight music stopped, returning to normal stage music`);
    
    // Explode all remaining enemies instantly
    this.enemies.forEach(enemy => {
      // Create explosion particles for each enemy
      for (let i = 0; i < 15; i++) {
        const particle = this.particlePool.get();
        if (particle) {
          particle.x = enemy.x;
          particle.y = enemy.y;
          particle.vx = (Math.random() - 0.5) * 10;
          particle.vy = (Math.random() - 0.5) * 10;
          particle.life = 60;
          particle.maxLife = 60;
          particle.color = enemy.color || '#ff4444';
          particle.size = Math.random() * 5 + 2;
          this.particles.push(particle);
        }
      }
    });
    
    // Clear all enemies
    this.enemies = [];
    
    // Store player data for next stage (score and lives only)
    this.savedScore = this.player.score;
    this.savedHp = this.player.hp;
    
    console.log(`Stage ${this.currentLevel} cleared - starting clear sequence`);
  }
  
  updateStageClear(dt) {
    if (!this.isStageClearing) return;
    
    if (this.stageClearProgress === 0) {
      console.log(`🎬 updateStageClear called - phase: ${this.stageClearPhase}`);
    }
    
    const now = Date.now();
    const elapsed = now - this.stageClearTimer;
    
    if (this.stageClearPhase === 'message') {
      // Show "STAGE X Clear" for 2 seconds
      if (elapsed >= 2000) {
        this.stageClearPhase = 'flyUp';
        console.log('✅ Phase transition: message → flyUp');
        this.stageClearTimer = now;
        this.stageClearProgress = 0;
      }
    } else if (this.stageClearPhase === 'flyUp') {
      // Spaceship flies up off screen
      this.stageClearProgress = Math.min(elapsed / 1500, 1); // 1.5 seconds
      
      // Move player upward
      this.player.y = (this.canvas.height / 2) - (this.stageClearProgress * (this.canvas.height / 2 + 150));
      
      // Add engine trail particles
      if (Math.random() < 0.3) {
        const particle = this.particlePool.get();
        if (particle) {
          particle.x = this.player.x + (Math.random() - 0.5) * 20;
          particle.y = this.player.y + 30;
          particle.vx = (Math.random() - 0.5) * 2;
          particle.vy = Math.random() * 5 + 2;
          particle.life = 30;
          particle.maxLife = 30;
          particle.color = '#4488ff';
          particle.size = Math.random() * 4 + 2;
          this.particles.push(particle);
        }
      }
      
      if (this.stageClearProgress >= 1) {
        this.stageClearPhase = 'wipe';
        console.log('✅ Phase transition: flyUp → wipe');
        this.stageClearTimer = now;
        this.wipeProgress = 0;
      }
    } else if (this.stageClearPhase === 'wipe') {
      // Black screen covers from bottom to top
      const wipeDuration = 1000; // 1 second
      this.wipeProgress = Math.min(elapsed / wipeDuration, 1);
      
      if (this.wipeProgress >= 1) {
        // Clear everything and prepare next stage
        this.bullets = [];
        this.particles = [];
        this.enemiesSpawned = 0;
        this.currentLevel++;
        this.resetBossTimer();
        this.callbacks.onStageClearComplete?.(); // Clear the message!
        this.callbacks.onLevelUp?.(this.currentLevel);
        
        // Restore player data (score and hp only)
        this.player.score = this.savedScore;
        // Start next stage
        this.isStageClearing = false;
        this.startStageTransition();
      }
    }
  }
  
  renderStageClearOverlay(ctx) {
    if (!this.isStageClearing) return;
    
    if (this.stageClearPhase === 'wipe') {
      // Black screen rising from bottom
      const screenHeight = this.canvas.height;
      const overlayHeight = screenHeight * this.wipeProgress;
      
      ctx.save();
      ctx.fillStyle = '#000';
      ctx.fillRect(0, screenHeight - overlayHeight, this.canvas.width, overlayHeight);
      ctx.restore();
    }
  }
  
  startStageTransition() {
    // Trigger entrance animation for next stage
    this.isEntranceAnimation = true;
    this.entrancePhase = 'ascending';
    this.entranceTimer = Date.now();
    
    // Position player off-screen at bottom
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height + 100; // Start below screen
    
    // Disable shooting during entrance
    this.entranceShootingDisabled = true;
    
    // Reset spawn volume increase for new stage (optional difficulty scaling)
    this.spawnVolumeIncrease = Math.min(this.spawnVolumeIncrease + 10, 100); // Increase by 10%
    this.lastVolumeIncreaseTime = Date.now();
    
    // Reset dash enemy counter for new stage
    this.dashEnemiesSpawnedThisStage = 0;
    
    // 🎵 PLAY STAGE MUSIC ON LEVEL TRANSITION
    // Start background music for the new stage
    this.soundManager?.playBackgroundMusic(this.currentLevel);
    console.log(`🎵 Starting background music for Stage ${this.currentLevel}`);
    console.log(`Stage transition: STAGE ${this.currentLevel}`);
    
    // Notify React component of stage change
    this.callbacks.onStageChange?.(this.currentLevel);
  }
  
  checkBossSpawn() {
    const bossConfig = this.getBossConfig();
    const timeRemaining = Math.ceil(this.bossTimer / 1000);
    
    // Debug logging to track boss timer
    if (this.gameTime > 0 && this.gameTime % 1000 < 20) {
      console.log(`Boss Timer - gameTime: ${this.gameTime}ms, bossTimer: ${this.bossTimer}ms, timeRemaining: ${timeRemaining}s, bossActive: ${this.bossActive}`);
    }
    
    // Update callback every second with countdown
    if (this.bossTimer > 0 && !this.bossActive) {
      this.callbacks.onBossTimerUpdate?.(timeRemaining);
    }
    
    // Boss spawns when timer reaches 0
    if (this.bossTimer <= 0 && !this.bossActive) {
      console.log(`⚠️ BOSS SPAWNING! bossTimer: ${this.bossTimer}, bossActive: ${this.bossActive}, gameTime: ${this.gameTime}`);
      this.spawnBoss();
      // Hide boss warning when boss spawns
      this.callbacks.onBossWarning?.(null); // Clear the warning
      // Reset timer for next level
      this.resetBossTimer();
      this.bossWarningShown = false; // Reset warning flag
      return;
    }
    
    // Show warning only at configured time (6 seconds before boss)
    const warningTime = GAME_CONFIG.BOSS_WARNING_TIME;
    if (this.bossTimer <= warningTime && this.bossTimer > warningTime - 1000 && !this.bossActive && !this.bossWarningShown) {
      // ==================== BOSS WARNING SOUND ====================
      // Stop normal background music when boss warning plays
      this.soundManager?.stopBackgroundMusic();
      this.soundManager?.play('ui.bossWarning'); // Boss incoming warning!
      
      this.bossWarningShown = true;
      this.callbacks.onBossWarning?.({
        time: warningTime / 1000, // 6 seconds
        message: `⚠ ${bossConfig.name} INCOMING! ⚠`,
        bossName: bossConfig.name,
        bossStage: bossConfig.stage,
        isUrgent: true
      });
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
    
    // Draw stage message during entrance animation
    if (this.isEntranceAnimation && this.entrancePhase === 'stage_message') {
      ctx.save();
      ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      
      // Glowing text effect
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#FFD700';
      ctx.fillStyle = `rgba(255, 215, 0, ${this.stageMessageOpacity})`;
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Flash effect
      const flashScale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
      ctx.scale(flashScale, flashScale);
      
      ctx.fillText(this.stageMessage, 0, 0);
      
      // Outer glow ring
      ctx.strokeStyle = `rgba(255, 215, 0, ${this.stageMessageOpacity * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    }
    
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
        
        // Calculate health percentage, clamped to 0-1 to prevent bar overflow
        const healthPercent = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#0f0';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
      }
    });
    
    // Draw power-ups
    this.renderPowerUps(ctx);
    
    // Draw ally support
    this.renderAllySupport(ctx);
    
    // Draw player
    if (!this.player.isDead) {
      // Draw orbit shield behind player
      this.renderOrbitShield(ctx);
      
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        
        // Special effects for power-ups
        const isInvincible = this.hasActivePowerUp('INVINCIBILITY');
        const isSuperMode = this.hasActivePowerUp('SUPER_MODE');
        
        if (isInvincible || isSuperMode) {
          // Invincibility: golden pulsing glow
          const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
          ctx.globalAlpha = pulse;
          ctx.shadowBlur = 40;
          ctx.shadowColor = isSuperMode ? '#FF4500' : '#FFD700'; // Orange for super, gold for invincibility
        } else if (this.player.invincible > 0) {
          // Regular hit invincibility flash
          ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.5;
        }
        
        // Super Mode: Rainbow aura effect
        if (isSuperMode) {
          const time = Date.now() * 0.001;
          const hue = (time * 100) % 360;
          ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 50, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Player glow
        if (!isInvincible && !isSuperMode) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = this.player.color;
        }
        
        // Draw player ship image or fallback to triangle
        if (this.player.shipImage && this.player.shipImage.complete) {
        // Get natural image dimensions to maintain aspect ratio
        const naturalWidth = this.player.shipImage.naturalWidth;
        const naturalHeight = this.player.shipImage.naturalHeight;
        const aspectRatio = naturalWidth / naturalHeight;
        
        // Base size on height to match ready screen (60px tall)
        const shipHeight = 60;
        const shipWidth = shipHeight * aspectRatio;
        
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
  
    // Draw overlays on top of everything
    this.renderStageClearOverlay(ctx);
    this.renderWipeOverlay(ctx);
  }
  
  initStars() {
    // Initialize starfield for space background
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













