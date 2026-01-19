// ==================== BOSS CONFIGURATION WITH RANDOM IMAGES & 2 NAMES ====================
// This file updates the BOSSES object in GameEngine.js to support:
// 1. Random boss image selection (boss-1.fw.png or boss-1-alternative.fw.png)
// 2. 2 names per boss (randomly selected when boss spawns)
// 3. Works for all 13 bosses

const BOSS_UPDATES = {
  // Stage 1 Boss
  STAGE_1: {
    names: ['Mega Destroyer', 'Cyber Tyrant'],
    imageKeyBase: 'boss-1'
  },
  
  // Stage 2 Boss
  STAGE_2: {
    names: ['Doom Bringer', 'Shadow Reaper'],
    imageKeyBase: 'boss-2'
  },
  
  // Stage 3 Boss
  STAGE_3: {
    names: ['Death Star', 'Void Crusher'],
    imageKeyBase: 'boss-3'
  },
  
  // Stage 4 Boss
  STAGE_4: {
    names: ['Omega Destroyer', 'Chaos Bringer'],
    imageKeyBase: ' boss-4'
  },
  
  // Stage 5 Boss
  STAGE_5: {
    names: ['Galaxy Devourer', 'Cosmic Annihilator'],
    imageKeyBase: 'boss-5'
  },
  
  // Stage 6 Boss
  STAGE_6: {
    names: ['Void Annihilator', 'Dimension Shredder'],
    imageKeyBase: 'boss-6'
  },
  
  // Stage 7 Boss
  STAGE_7: {
    names: ['Cosmic Terror', 'Reality Warper'],
    imageKeyBase: 'boss-7'
  },
  
  // Stage 8 Boss
  STAGE_8: {
    names: ['Stellar Destroyer', 'Nova Crusher'],
    imageKeyBase: 'boss-8'
  },
  
  // Stage 9 Boss
  STAGE_9: {
    names: ['Galactic Nightmare', 'Eclipse Destroyer'],
    imageKeyBase: 'boss-9'
  },
  
  // Stage 10 Boss
  STAGE_10: {
    names: ['Universal Devourer', 'Infinity Eater'],
    imageKeyBase: 'boss-10'
  },
  
  // Stage 11 Boss
  STAGE_11: {
    names: ['Dimension Shredder', 'Quantum Breaker'],
    imageKeyBase: 'boss-11'
  },
  
  // Stage 12 Boss
  STAGE_12: {
    names: ['Reality Breaker', 'Time Collapse'],
    imageKeyBase: 'boss-12'
  },
  
  // Stage 13 Boss
  STAGE_13: {
    names: ['Omega Void Lord', 'Final Judgment'],
    imageKeyBase: 'boss-13'
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a random name from the boss's name array
 * @param {string} bossKey - The boss key (e.g., 'STAGE_1')
 * @returns {string} Randomly selected boss name
 */
function getRandomBossName(bossKey) {
  const boss = BOSS_UPDATES[bossKey];
  if (!boss || !boss.names) {
    return 'Unknown Boss';
  }
  
  const names = boss.names;
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

/**
 * Get a random boss image key (regular or alternative)
 * @param {string} bossKey - The boss key (e.g., 'STAGE_1')
 * @returns {string} Image key to use for loading the boss image
 */
function getRandomBossImage(bossKey) {
  const boss = BOSS_UPDATES[bossKey];
  if (!boss || !boss.imageKeyBase) {
    return 'boss-1'; // Default fallback
  }
  
  // 50% chance for regular, 50% chance for alternative
  const useAlternative = Math.random() < 0.5;
  
  if (useAlternative) {
    return `${boss.imageKeyBase}-alternative`;
  } else {
    return boss.imageKeyBase;
  }
}

// ==================== INTEGRATION IN GAME ENGINE ====================

// Add these methods to the GameEngine class:

/**
 * Spawn a boss with random name and image variant
 */
spawnBoss_WithRandomAttributes() {
  this.bossActive = true;
  const bossConfig = this.getBossConfig();
  
  // Get random name and image key
  const randomName = getRandomBossName(`STAGE_${bossConfig.stage}`);
  const randomImageKey = getRandomBossImage(`STAGE_${bossConfig.stage}`);
  
  const boss = {
    x: this.canvas.width / 2,
    y: -80,
    type: 'BOSS',
    size: bossConfig.size,
    speed: bossConfig.speed,
    targetY: bossConfig.targetY || 150,
    hp: bossConfig.hp + (this.currentLevel * 5),
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
    name: randomName, // RANDOM NAME!
    stage: bossConfig.stage,
    image: this.assetLoader.getImage(randomImageKey) // RANDOM IMAGE!
  };
  
  this.enemies.push(boss);
  console.log(`Boss spawned: ${randomName} (Stage ${bossConfig.stage}) - Image: ${randomImageKey}.fw.png`);
  this.callbacks.onBossSpawn?.(bossConfig.stage);
  
  // Boss music
  this.soundManager?.playBossMusic(this.currentLevel);
  console.log(`🎵 Boss fight music started for Stage ${this.currentLevel}`);
}

// ==================== USAGE IN GAME ENGINE ====================
/*
 
Replace the existing spawnBoss() method with this version:

spawnBoss() {
  this.bossActive = true;
  const bossConfig = this.getBossConfig();
  
  // Get random name and image key
  const randomName = getRandomBossName(`STAGE_${bossConfig.stage}`);
  const randomImageKey = getRandomBossImage(`STAGE_${bossConfig.stage}`);
  
  const boss = {
    // ... other properties ...
    name: randomName,  // RANDOM NAME!
    image: this.assetLoader.getImage(randomImageKey) // RANDOM IMAGE!
  };
  
  this.enemies.push(boss);
  console.log(`Boss spawned: ${randomName} (Stage ${bossConfig.stage}) - Image: ${randomImageKey}.fw.png`);
  
  // ... rest of method ...
}

*/

// Export for use in GameEngine.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BOSS_UPDATES,
    getRandomBossName,
    getRandomBossImage
  };
}
