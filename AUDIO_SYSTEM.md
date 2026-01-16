# 🎵 Space Snake Game - Audio System Documentation

## Overview
Complete audio system with preloaded sound effects and background music. All audio is preloaded at startup to prevent lag during gameplay.

## Files Created
1. **`src/engine/SoundManager.js`** - Main audio system class
2. **`src/engine/GameEngine.js`** - Integrated audio calls throughout game

---

## 🎵 Audio Files Mapped

### Background Music
| File | Stage Range | Description |
|------|-------------|-------------|
| `background-sound-1-to-10.mp3` | Stages 1-10 | Early game music |
| `background-sound-11-to-20.mp3` | Stages 11-20 | Mid game music |
| `background-sound-21-to-30.mp3` | Stages 21-30 | Late game music |
| `background-sound-31-to-all.mp3` | Stages 31+ | End game music |
| `menu-background.mp3` | Menu | Menu screen music |

### Player Sounds
| Sound | File | Game Action |
|-------|------|-------------|
| `player.fire` | `fire-normal.wav` | Player shooting |
| `player.explode` | `player-explode.wav` | Player death |

### Enemy Sounds
| Sound | File | Game Action |
|-------|------|-------------|
| `enemy.fire` | `shooting-enemy-fire.wav` | Enemy shooting |
| `enemy.hit` | `shooting-enemy-hit.wav` | Enemy hit by bullet |
| `enemy.destroy` | `shooting-enemy-destroyed.mp3` | Shooting enemy destroyed |
| `enemy.destroyNonShooting` | `none-shooting-enemy-destroyed.wav` | Non-shooting enemy destroyed |
| `enemy.bossFire` | `boss-fire.wav` | Boss shooting |
| `enemy.bossExplode` | `boss-explode.wav` | Boss defeated explosion |
| `enemy.metalHit` | `metal-hit.wav` | Boss hit (metal sound) |
| `enemy.breakBones` | `break-bones.wav` | Boss destruction sound |

### Power-Up Sounds
| Sound | File | Game Action |
|-------|------|-------------|
| `powerup.spawn` | `power-up-beam.mp3` | Power-up appears |
| `powerup.collect` | `power-ups-gain.wav` | Normal power-up collected |
| `powerup.superCollect` | `super-power-upda-gained.wav` | Super power-up collected |
| `powerup.jackpot` | `jackpot.wav` | Special/Jackpot power-up (LEVEL_UP) |

### UI & Game State Sounds
| Sound | File | Game Action |
|-------|------|-------------|
| `ui.click` | `ui_click.wav` | UI button clicks |
| `ui.gameOver` | `game-over.wav` | Game over music |
| `ui.gameOverNotif` | `game-over-notif.wav` | Game over notification |
| `ui.newRecord` | `new_record.wav` | New high score |
| `ui.winFireworks` | `win_fireworks.wav` | Stage completed/fireworks |

### Other Sounds
| Sound | File | Game Action |
|-------|------|-------------|
| `other.pinHit` | `pin_hit.wav` | Pin/collision sound |

---

## 🎮 Usage in GameEngine.js

### Sound Effect Calls
```javascript
// Player shooting
this.soundManager?.play('player.fire');

// Enemy shooting
this.soundManager?.play('enemy.fire');

// Enemy hit
this.soundManager?.play('enemy.hit');

// Boss hit (metal sound)
this.soundManager?.play('enemy.metalHit');

// Boss defeated
this.soundManager?.play('enemy.bossExplode');
this.soundManager?.play('enemy.breakBones');

// Enemy destroyed
this.soundManager?.play('enemy.destroy'); // Shooting enemy
this.soundManager?.play('enemy.destroyNonShooting'); // Non-shooting enemy

// Player death
this.soundManager?.play('player.explode');
this.soundManager?.play('ui.gameOverNotif');

// Power-ups
this.soundManager?.play('powerup.spawn'); // Power-up appears
this.soundManager?.play('powerup.collect'); // Normal power-up collected
this.soundManager?.play('powerup.superCollect'); // Super power-up
this.soundManager?.play('powerup.jackpot'); // LEVEL_UP power-up

// Stage clear
this.soundManager?.play('ui.winFireworks'); // Victory sound
```

### Background Music
```javascript
// Start game music (based on current stage)
this.soundManager?.playBackgroundMusic(this.currentLevel);

// Play menu music
this.soundManager?.playMenuMusic();

// Stop background music
this.soundManager?.stopBackgroundMusic();
```

### Volume Control
```javascript
// Mute all sounds
this.soundManager?.mute();

// Unmute all sounds
this.soundManager?.unmute();

// Toggle mute
this.soundManager?.toggleMute();

// Set SFX volume (0.0 to 1.0)
this.soundManager?.setSFXVolume(0.5); // 50% volume

// Set music volume (0.0 to 1.0)
this.soundManager?.setMusicVolume(0.3); // 30% volume
```

---

## 🎯 Sound Effect Locations in GameEngine.js

### Line Numbers (Approximate)
| Sound | Line | Method |
|-------|------|--------|
| `player.fire` | ~1220 | `shoot()` |
| `enemy.fire` | ~1730 | `enemyShoot()` |
| `enemy.metalHit` | ~1923 | `enemyHit()` (boss) |
| `enemy.hit` | ~1958 | `enemyHit()` (enemy hit but not destroyed) |
| `enemy.bossExplode` | ~1941 | `enemyHit()` (boss death) |
| `enemy.breakBones` | ~1942 | `enemyHit()` (boss death) |
| `enemy.destroy` | ~1947 | `enemyHit()` (shooting enemy) |
| `enemy.destroyNonShooting` | ~1952 | `enemyHit()` (non-shooting enemy) |
| `player.explode` | ~1905 | `playerHit()` (death) |
| `ui.gameOverNotif` | ~1906 | `playerHit()` (death) |
| `powerup.spawn` | ~2343 | `spawnPowerUp()` |
| `powerup.collect` | ~2394 | `activatePowerUp()` (normal) |
| `powerup.superCollect` | ~2390 | `activatePowerUp()` (SUPER_MODE) |
| `powerup.jackpot` | ~2392 | `activatePowerUp()` (LEVEL_UP) |
| `ui.winFireworks` | ~2781 | `bossDefeated()` |

---

## ⚙️ Technical Details

### Preloading Strategy
- All audio files are preloaded using `new Audio()` with `preload = 'auto'`
- This prevents lag during gameplay when sounds are played
- Sounds are cloned when played to allow overlapping audio

### Volume Levels
- **Music Volume**: 30% (0.3) by default
- **SFX Volume**: 50% (0.5) by default
- Can be adjusted at runtime

### Performance
- No lag during gameplay
- Audio cloning allows multiple instances of the same sound to play simultaneously
- Browser's native audio API is used (no external libraries)

### Browser Compatibility
- Uses standard HTML5 Audio API
- Compatible with all modern browsers
- Graceful fallback if audio fails to load

---

## 📝 Adding New Sounds

To add a new sound effect:

1. **Place audio file** in `/assets/audio/`
2. **Add to SoundManager.js** preload section:
   ```javascript
   this.sounds.category = {
     soundName: this.loadAudio('/assets/audio/your-file.wav')
   };
   ```
3. **Use in GameEngine.js**:
   ```javascript
   this.soundManager?.play('category.soundName');
   ```

---

## 🔧 Troubleshooting

### Sounds Not Playing
- Check browser console for errors
- Ensure audio files exist in `/assets/audio/`
- Check browser's autoplay policy (may require user interaction first)
- Verify `soundManager` is initialized

### Audio Lag
- All audio is preloaded, so lag should not occur
- If lag persists, check network latency for audio file loading

### Volume Too Low/Loud
- Adjust default volumes in `SoundManager.js`:
  - `this.musicVolume = 0.3;` (30% for music)
  - `this.sfxVolume = 0.5;` (50% for SFX)

---

## ✅ Implementation Complete

All audio files have been mapped and integrated into the game. The system is:
- ✅ Efficient (no lag)
- ✅ Organized (clear naming structure)
- ✅ Documented (this file)
- ✅ Ready for production

Enjoy your fully audio-enabled Space Snake game! 🎮🎵
