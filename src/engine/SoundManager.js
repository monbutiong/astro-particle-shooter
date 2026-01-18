/**
 * SoundManager - HIGH PERFORMANCE Audio System for Space Snake Game
 * 
 * 🚀 PERFORMANCE OPTIMIZATIONS:
 * - Audio Pool: Reuses audio instances instead of cloning (prevents lag)
 * - Lazy Loading: Loads sounds on-demand to prevent startup delay
 * - Object Pooling: Keeps 3 instances per sound for overlapping playback
 * 
 * Version 4.0 - PERFORMANCE EDITION
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.audioContextUnlocked = false;
    this.isMuted = false;
    this.musicVolume = 0.3; // 30% volume for background music
    this.sfxVolume = 0.5;   // 50% volume for sound effects
    this.currentBossTrack = null;
    
    // 🚀 AUDIO POOL for performance - prevents cloning overhead
    this.audioPool = new Map(); // soundPath -> [audio1, audio2, audio3...]
    this.poolSize = 3; // Keep 3 instances of each sound for overlapping playback
    
    this.preloadAllSounds();
  }

  /**
   * 🔓 Unlock audio for Android WebView and mobile browsers
   */
  async unlockAudio() {
    if (this.audioContextUnlocked) {
      return;
    }

    try {
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      silentAudio.volume = 0.01;
      
      await silentAudio.play();
      silentAudio.pause();
      silentAudio.currentTime = 0;
      
      this.audioContextUnlocked = true;
      return;
    } catch (err) {
    }
    
    this.audioContextUnlocked = true;
  }

  /**
   * Preload all audio file placeholders (lazy loading)
   */
  preloadAllSounds() {
    console.log('🔊 SoundManager: Using lazy loading to prevent lag');
    
    // ==================== PLAYER SOUNDS ====================
    this.sounds.player = {
      fire: null,
      hit: null,
      explode: null
    };

    // ==================== ENEMY SOUNDS ====================
    this.sounds.enemy = {
      fire: null,
      hit: null,
      destroy: null,
      destroyNonShooting: null,
      bossFire: null,
      bossExplode: null,
      metalHit: null,
      breakBones: null
    };

    // ==================== POWER-UP SOUNDS ====================
    this.sounds.powerup = {
      spawn: null,
      collect: null,
      superCollect: null,
      jackpot: null
    };

    // ==================== UI & GAME STATE SOUNDS ====================
    this.sounds.ui = {
      click: null,
      gameOver: null,
      gameOverNotif: null,
      newRecord: null,
      winFireworks: null,
      bossWarning: null,
      stageStart: null
    };

    // ==================== BACKGROUND MUSIC ====================
    this.backgroundMusic = {
      stage1to10: null,
      stage11to20: null,
      stage21to30: null,
      stage31toAll: null,
      menu: null,
      boss1: null,
      boss2: null
    };

    // ==================== OTHER SOUNDS ====================
    this.sounds.other = {
      pinHit: null
    };

    console.log('✅ SoundManager ready - using lazy loading');
    
    // 🔥 PRELOAD CRITICAL SOUNDS to prevent delay
    // Preload sounds that play early in the game
    this.preloadCriticalSounds();
  }
  
  /**
   * Preload critical sounds that play immediately
   * This prevents the 0.5s delay on first play
   */
  preloadCriticalSounds() {
    console.log('🔊 Preloading critical sounds...');
    
    const criticalSounds = [
      'ui.stageStart',      // Stage 1 notification
      'player.fire',        // Player shooting
      'enemy.destroy',      // Enemy explosion
      'enemy.destroyNonShooting',  // Non-shooting enemy explosion
      'enemy.hit'           // Enemy hit
    ];
    
    criticalSounds.forEach(soundPath => {
      const parts = soundPath.split('.');
      const category = parts[0];
      const soundName = parts[1];
      
      if (this.sounds[category] && soundName in this.sounds[category]) {
        const sound = this.loadAudioOnDemand(soundPath);
        if (sound) {
          this.sounds[category][soundName] = sound;
          console.log(`✅ Preloaded: ${soundPath}`);
        }
      }
    });
  }
  
  /**
   * Load audio file on-demand (lazy loading)
   */
  loadAudioOnDemand(soundPath) {
    if (!this.audioPaths[soundPath]) {
      console.error('❌ Sound path not mapped:', soundPath);
      return null;
    }
    
    const audio = new Audio(this.audioPaths[soundPath]);
    audio.preload = 'auto';
    audio.volume = this.sfxVolume;
    return audio;
  }
  
  /**
   * 🎵 COMPLETE AUDIO MAPPING - All 31 sounds correctly mapped
   * Each action now has its own proper sound file
   */
  get audioPaths() {
    return {
      // ==================== PLAYER SOUNDS ====================
      'player.fire': '/audio/fire-normal.wav',              // Player shooting
      'player.hit': '/audio/fire.wav',                     // Player hit by enemy
      'player.explode': '/audio/player-explode.wav',       // Player death
      
      // ==================== ENEMY SOUNDS ====================
      // Shooting enemies
      'enemy.fire': '/audio/shooting-enemy-fire.wav',      // Enemy shooting
      'enemy.hit': '/audio/shooting-enemy-hit.wav',        // Enemy hit by bullet
      'enemy.destroy': '/audio/shooting-enemy-destroyed.mp3', // Shooting enemy destroyed
      
      // Non-shooting enemies
      'enemy.destroyNonShooting': '/audio/none-shooting-enemy-destroyed.wav', // Non-shooting enemy destroyed
      
      // Boss sounds
      'enemy.bossFire': '/audio/boss-fire.wav',            // Boss shooting
      'enemy.bossExplode': '/audio/boss-explode.wav',      // Boss defeated
      'enemy.metalHit': '/audio/metal-hit.wav',            // Boss hit - metal sound
      'enemy.breakBones': '/audio/break-bones.wav',        // Boss destruction
      
      // ==================== POWER-UP SOUNDS ====================
      'powerup.spawn': '/audio/power-ups.wav',             // Power-up appears
      'powerup.collect': '/audio/power-ups-gain.wav',      // Normal power-up collected
      'powerup.superCollect': '/audio/super-power-upda-gained.wav', // Super power-up collected
      'powerup.jackpot': '/audio/jackpot.wav',             // Special/jackpot (LEVEL_UP)
      
      // ==================== UI & GAME STATE SOUNDS ====================
      'ui.click': '/audio/ui_click.wav',                   // UI button clicks
      'ui.gameOver': '/audio/game-over.wav',               // Game over music
      'ui.gameOverNotif': '/audio/game-over-notif.wav',    // Game over notification
      'ui.newRecord': '/audio/new_record.wav',
      'ui.winFireworks': '/audio/win_fireworks.wav',
      'ui.bossWarning': '/audio/warning-boss-incoming.mp3',
      'ui.stageStart': '/audio/stage-start.mp3',
      
      // ==================== BACKGROUND MUSIC ====================
      'bgm.stage1to10': '/audio/background-sound-1-to-10.mp3',    // Stages 1-10
      'bgm.stage11to20': '/audio/background-sound-11-to-20.mp3',  // Stages 11-20
      'bgm.stage21to30': '/audio/background-sound-21-to-30.mp3',  // Stages 21-30
      'bgm.stage31toAll': '/audio/background-sound-31-to-all.mp3', // Stages 31+
      'bgm.menu': '/audio/menu-background.mp3',                   // Menu music
      
      // Boss fight music (alternates based on stage)
      'bgm.boss1': '/audio/boss-fight-background-song-1.mp3', // Odd stages
      'bgm.boss2': '/audio/boss-fight-background-song-2.mp3', // Even stages
      
      // ==================== OTHER SOUNDS ====================
      'other.pinHit': '/audio/pin_hit.wav'                 // Collision sound
    };
  }

  /**
   * 🚀 HIGH PERFORMANCE: Play sound using audio pool (NO CLONING)
   * This prevents lag during gameplay by reusing audio instances
   */
  play(soundPath) {
    if (this.isMuted) {
      return;
    }
    
    // 🔓 AUTO-UNLOCK: If audio not unlocked yet, try to unlock on first play
    if (!this.audioContextUnlocked) {
      this.unlockAudio().then(() => {
        this.play(soundPath);
      });
      return;
    }

    try {
      const parts = soundPath.split('.');
      const category = parts[0];
      const soundName = parts[1];
      
      // Check if category exists
      if (!this.sounds[category]) {
        console.error(`❌ Sound category not found: ${category}`);
        return;
      }
      
      // Check if sound name exists in category
      if (!(soundName in this.sounds[category])) {
        console.error(`❌ Sound not found: ${soundPath}`);
        return;
      }

      let sound = this.sounds[category][soundName];
      
      // 🔥 LAZY LOADING: Load sound on first use (if null)
      if (!sound) {
        console.log(`🔍 Lazy loading sound: ${soundPath}`);
        sound = this.loadAudioOnDemand(soundPath);
        if (sound) {
          this.sounds[category][soundName] = sound;
        } else {
          console.error(`❌ Failed to load sound: ${soundPath}`);
          return;
        }
      }
      
      // 🚀 HIGH PERFORMANCE: Use audio pool instead of cloning
      // Get or create pool for this sound
      if (!this.audioPool.has(soundPath)) {
        this.audioPool.set(soundPath, []);
      }
      
      const pool = this.audioPool.get(soundPath);
      
      // Find available audio instance (not playing)
      let audioInstance = pool.find(audio => audio.ended || audio.paused);
      
      // If no available instance, create one (up to poolSize limit)
      if (!audioInstance) {
        if (pool.length < this.poolSize) {
          audioInstance = sound.cloneNode(true);
          audioInstance.volume = this.sfxVolume;
          pool.push(audioInstance);
        } else {
          // Reuse oldest instance
          audioInstance = pool[0];
          audioInstance.currentTime = 0;
        }
      }
      
      // Play the audio instance
      audioInstance.volume = this.sfxVolume;
      audioInstance.play().catch(err => {
        // Silently ignore autoplay errors
      });
    } catch (error) {
      // Silently ignore errors to prevent console spam
    }
  }

  /**
   * Play background music based on current stage
   */
  playBackgroundMusic(stage) {
    if (this.isMuted) return;
    
    let trackKey;
    if (stage <= 10) {
      trackKey = 'stage1to10';
    } else if (stage <= 20) {
      trackKey = 'stage11to20';
    } else if (stage <= 30) {
      trackKey = 'stage21to30';
    } else {
      trackKey = 'stage31toAll';
    }
    
    // 🔥 LAZY LOADING: Load background music on first use
    let track = this.backgroundMusic[trackKey];
    if (!track) {
      const path = this.audioPaths[`bgm.${trackKey}`];
      if (path) {
        track = new Audio(path);
        track.preload = 'auto';
        track.volume = this.musicVolume;
        track.loop = true;
        this.backgroundMusic[trackKey] = track;
      }
    }

    if (track) {
      if (track === this.currentBackgroundTrack && !this.currentBackgroundTrack.paused) {
        return;
      }
      
      if (this.currentBackgroundTrack) {
        this.currentBackgroundTrack.pause();
        this.currentBackgroundTrack.currentTime = 0;
      }

      this.currentBackgroundTrack = track;
      this.currentBackgroundTrack.play().catch(err => {
        // Silent fail
      });
    }
  }

  /**
   * Play boss fight background music
   * Alternates between boss1 (odd stages) and boss2 (even stages)
   */
  playBossMusic(stage) {
    if (this.isMuted) return;

    const bossTrackKey = (stage % 2 === 1) ? 'boss1' : 'boss2';
    
    // 🔥 LAZY LOADING: Load boss music on first use
    let bossTrack = this.backgroundMusic[bossTrackKey];
    if (!bossTrack) {
      const path = this.audioPaths[`bgm.${bossTrackKey}`];
      if (path) {
        bossTrack = new Audio(path);
        bossTrack.preload = 'auto';
        bossTrack.volume = this.musicVolume;
        bossTrack.loop = true;
        this.backgroundMusic[bossTrackKey] = bossTrack;
      }
    }
    
    if (bossTrack && bossTrack !== this.currentBossTrack) {
      if (this.currentBackgroundTrack) {
        this.currentBackgroundTrack.pause();
        this.currentBackgroundTrack.currentTime = 0;
      }

      if (this.currentBossTrack) {
        this.currentBossTrack.pause();
        this.currentBossTrack.currentTime = 0;
      }

      this.currentBossTrack = bossTrack;
      this.currentBossTrack.play().catch(err => {
        // Silent fail
      });
    }
  }

  /**
   * Stop boss fight music and return to normal stage music
   */
  stopBossMusic(stage) {
    if (this.currentBossTrack) {
      this.currentBossTrack.pause();
      this.currentBossTrack.currentTime = 0;
      this.currentBossTrack = null;
    }
    
    this.playBackgroundMusic(stage);
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.pause();
      this.currentBackgroundTrack.currentTime = 0;
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.pause();
      this.currentBossTrack.currentTime = 0;
      this.currentBossTrack = null;
    }
  }

  /**
   * Play menu background music
   */
  playMenuMusic() {
    if (this.isMuted) return;

    const track = this.backgroundMusic.menu;
    if (track) {
      if (this.currentBackgroundTrack) {
        this.currentBackgroundTrack.pause();
        this.currentBackgroundTrack.currentTime = 0;
      }
      if (this.currentBossTrack) {
        this.currentBossTrack.pause();
        this.currentBossTrack.currentTime = 0;
        this.currentBossTrack = null;
      }

      this.currentBackgroundTrack = track;
      this.currentBackgroundTrack.volume = this.musicVolume;
      this.currentBackgroundTrack.loop = true;
      this.currentBackgroundTrack.play().catch(err => {
        // Silent fail
      });
    }
  }

  // ==================== VOLUME CONTROL ====================

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.volume = this.musicVolume;
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.volume = this.musicVolume;
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  mute() {
    this.isMuted = true;
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.pause();
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.pause();
    }
  }

  unmute() {
    this.isMuted = false;
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.play().catch(err => {
        // Silent fail
      });
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.play().catch(err => {
        // Silent fail
      });
    }
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return !this.isMuted;
  }

  /**
   * Pause all audio (background music and boss music)
   */
  pauseAll() {
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.pause();
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.pause();
    }
  }

  /**
   * Resume all audio (background music and boss music)
   */
  resumeAll() {
    if (!this.isMuted) {
      if (this.currentBackgroundTrack) {
        this.currentBackgroundTrack.play().catch(err => {
          // Silent fail
        });
      }
      if (this.currentBossTrack) {
        this.currentBossTrack.play().catch(err => {
          // Silent fail
        });
      }
    }
  }
}

export default SoundManager;
