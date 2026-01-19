# BOSS RANDOM IMAGE & NAME IMPLEMENTATION GUIDE

## Problem
You want:
1. Random boss image selection (50% chance of regular or alternative)
2. 2 names per boss (randomly selected when spawning)

## Current Status
- ✅ Stage 1 Boss already has `names` and `imageKeyBase` properties
- ❌ Stages 2-13 need to be updated
- ❌ Alternative boss images need to be added to asset loader

## Files to Update

### 1. BOSSES Configuration (Stages 2-13)
**File:** `C:\xampp\htdocs\react-project\Galactic Barrage\src\engine\GameEngine.js`
**Location:** Lines 108-400 (approximately)

Update boss stages 2-13 from:
```javascript
STAGE_2: {
  stage: 2,
  name: 'Doom Bringer',
  imageKey: 'boss-2',
  // ... other properties ...
}
```

To:
```javascript
STAGE_2: {
  stage: 2,
  names: ['Doom Bringer', 'Shadow Reaper'], // 2 names
  imageKeyBase: 'boss-2', // Will randomly use boss-2.fw.png or boss-2-alternative.fw.png
  // ... other properties ...
}
```

### Boss Names for All Stages:
```javascript
STAGE_1: ['Mega Destroyer', 'Cyber Tyrant'] ✅ (Already done)
STAGE_2: ['Doom Bringer', 'Shadow Reaper']
STAGE_3: ['Death Star', 'Void Crusher']
STAGE_4: ['Omega Destroyer', 'Chaos Bringer']
STAGE_5: ['Galaxy Devourer', 'Cosmic Annihilator']
STAGE_6: ['Void Annihilator', 'Dimension Shredder']
STAGE_7: ['Cosmic Terror', 'Reality Warper']
STAGE_8: ['Stellar Destroyer', 'Nova Crusher']
STAGE_9: ['Galactic Nightmare', 'Eclipse Destroyer']
STAGE_10: ['Universal Devourer', 'Infinity Eater']
STAGE_11: ['Dimension Shredder', 'Quantum Breaker']
STAGE_12: ['Reality Breaker', 'Time Collapse']
STAGE_13: ['Omega Void Lord', 'Final Judgment']
```

### 2. Asset Loader - Add Alternative Images
**File:** `C:\xampp\htdocs\react-project\Galactic Barrage\src\engine\GameEngine.js`
**Location:** Lines ~1390-1410 (preloadAssets method)

Add these lines to the imageMap:
```javascript
// Bosses - REGULAR
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
'boss-11': '/assets/boss/boss-11.fw.png',
'boss-12': '/assets/boss/boss-12.fw.png',
'boss-13': '/assets/boss/boss-13.fw.png',

// Bosses - ALTERNATIVE
'boss-1-alternative': '/assets/boss/boss-1-alternative.fw.png',
'boss-2-alternative': '/assets/boss/boss-2-alternative.fw.png',
'boss-3-alternative': '/assets/boss/boss-3-alternative.fw.png',
'boss-4-alternative': '/assets/boss/boss-4-alternative.fw.png',
'boss-5-alternative': '/assets/boss/boss-5-alternative.fw.png',
'boss-6-alternative': '/assets/boss/boss-6-alternative.fw.png',
'boss-7-alternative': '/assets/boss/boss-7-alternative.fw.png',
'boss-8-alternative': '/assets/boss/boss-8-alternative.fw.png',
'boss-9-alternative': '/assets/boss/boss-9-alternative.fw.png',
'boss-10-alternative': '/assets/boss/boss-10-alternative.fw.png',
'boss-11-alternative': '/assets/boss/boss-11-alternative.fw.png',
'boss-12-alternative': '/assets/boss/boss-12-alternative.fw.png',
'boss-13-alternative': '/assets/boss/boss-13-alternative.fw.png',
```

### 3. Update spawnBoss Method
**File:** `C:\ampp\htdocs\react-project\al Barrage\src\engine\GameEngine.js`
**Location:** Lines 3642-3692 (spawnBoss method)

Replace the boss object creation from:
```javascript
const boss = {
  // ... properties ...
  name: bossConfig.name,
  image: this.assetLoader.getImage(bossConfig.imageKey)
};
```

To:
```javascript
// ==================== RANDOM BOSS IMAGE & NAME ====================
// 50% chance for alternative image
const useAlternative = Math.random() < 0.5;
const imageKey = useAlternative 
  ? `${bossConfig.imageKeyBase}-alternative` 
  : bossConfig.imageKeyBase;

// Get random name if available (2 names per boss)
const bossName = (bossConfig.names && Array.isArray(bossConfig.names))
  ? bossConfig.names[Math.floor(Math.random() * bossConfig.names.length)]
  : bossConfig.name;

const boss = {
  // ... properties ...
  name: bossName, // RANDOM NAME!
  image: this.assetLoader.getImage(imageKey) // RANDOM IMAGE!
};
```

And update the console log:
```javascript
console.log(`Boss spawned: ${bossName} (Stage ${bossConfig.stage}) - Image: ${imageKey}.fw.png`);
```

## Usage Example

This makes every boss spawn unique with:
- **Random name**: 50% chance of either name
- **Random image**: 50% chance of regular or alternative version
- **13 bosses × 2 names × 2 images = 52 unique combinations!**

## Testing
Start the game and play through stages 1-13. Each time a boss spawns, you should see:
- A random name from the 2 options
- A random image (regular or alternative)
- Boss images like `boss-1.fw.png` or `boss-1-alternative.fw.png`

---

## Example Implementation (Copy this for all stages 2-13)

**Stage 2:**
```javascript
STAGE_2: {
  stage: 2,
  names: ['Doom Bringer', 'Shadow Reaper'],
  imageKeyBase: 'boss-2',
  // ... rest of properties
}
```

**Stage 3:**
```javascript
STAGE_3: {
  stage: 3,
  names: ['Death Star', 'Void Crusher'],
  imageKeyBase: 'boss-3',
  // ... rest of properties
}
```

And so on for STAGE_4 through STAGE_13...
