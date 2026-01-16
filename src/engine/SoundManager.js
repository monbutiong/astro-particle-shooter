/**
 * SoundManager - Efficient Audio System for Space Snake Game
 * Preloads all audio and provides organized sound playback methods
 * 
 * Version 2.0 - Added boss fight music and player hit sounds
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.audioContextUnlocked = false; // Track if audio is unlocked for Android
    this.isMuted = false;
    this.musicVolume = 0.3; // 30% volume for background music
    this.sfxVolume = 0.5;   // 50% volume for sound effects
    this.currentBossTrack = null; // Track currently playing boss music
    
    this.preloadAllSounds();
  }

  /**
   * 🔓 Unlock audio for Android WebView and mobile browsers
   * MUST be called after user interaction (click/tap)
   * Call this IMMEDIATELY after game engine creation
   */
  async unlockAudio() {
    if (this.audioContextUnlocked) {
      console.log('✅ Audio already unlocked');
      return;
    }
    console.log('🔓 Unlocking audio for Android/mobile...');

    try {
      // Method 1: Play and pause a silent sound (most reliable)
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      silentAudio.volume = 0.01; // Very low but not zero
      
      await silentAudio.play();
      silentAudio.pause();
      silentAudio.currentTime = 0;
      console.log('✅ Audio unlocked via silent audio method');
      
      this.audioContextUnlocked = true;
      return;
    } catch (err) {
      console.warn('⚠️ Silent audio method failed:', err);
    }
    
    // Method 2: Try playing an actual sound at very low volume
    try {
      const testSound = this.sounds.player?.fire;
      if (testSound) {
        const originalVolume = testSound.volume;
        testSound.volume = 0.01; // Very low volume
        testSound.currentTime = 0;
        
        await testSound.play();
        // Immediately pause and reset
        setTimeout(() => {
          testSound.pause();
          testSound.currentTime = 0;
          testSound.volume = originalVolume;
        }, 50);
        
        console.log('✅ Audio unlocked via test sound method');
        this.audioContextUnlocked = true;
        return;
      }
    } catch (err) {
      console.warn('⚠️ Test sound method failed:', err);
    }
    
    // Method 3: Try playing background music briefly
    try {
      const testMusic = this.backgroundMusic?.stage1to10;
      if (testSound) {
        const originalVolume = testSound.volume;
        testMusic.volume = 0.01;
        try {
          await testMusic.play();
          testMusic.pause();
          testMusic.volume = originalVolume;
          console.log('✅ Audio unlocked via background music method');
          this.audioContextUnlocked = true;
          return;
        } catch (e) {
          console.warn('⚠️ Background music method failed:', e);
        }
      }
    } catch (err) {
      console.error('❌ All audio unlock methods failed:', err);
    }
    
    // Mark as unlocked anyway (some browsers don't need explicit unlock)
    this.audioContextUnlocked = true;
    console.log('⚠️ Audio unlock attempted, proceeding anyway...');
  }

  /**
   * Preload all audio files to prevent lag during gameplay
   * OPTIMIZED: Only load sounds when needed (lazy loading)
   */
  preloadAllSounds() {
    // ❌ REMOVED: Don't preload all sounds - causes lag!
    // ✅ NEW: Only create placeholders, load on-demand
    console.log('🔊 SoundManager: Using lazy loading to prevent lag');
    
    // ==================== PLAYER SOUNDS ====================
    this.sounds.player = {
      fire: null,   // Will load on first use
      hit: null,    // Will load on first use
      explode: null // Will load on first use
    };

    // ==================== ENEMY SOUNDS ====================
    this.sounds.enemy = {
      // Shooting enemies
      fire: null,    // Will load on first use
      hit: null,     // Will load on first use  
      destroy: null, // Will load on first use
      
      // Non-shooting enemies
      destroyNonShooting: null, // Will load on first use
      
      // Boss enemies
      bossFire: null,        // Boss shooting
      bossExplode: null,     // Boss defeated
      metalHit: null,        // Boss hit metal sound
      breakBones: null       // Boss destruction
    };

    // ==================== POWER-UP SOUNDS ====================
    this.sounds.powerup = {
      spawn: null,       // Power-up appears
      collect: null,     // Normal power-up collected
      superCollect: null, // Super power-up collected
      jackpot: null      // Special/jackpot power-up
    };

    // ==================== UI & GAME STATE SOUNDS ====================
    this.sounds.ui = {
      click: null,            // UI button clicks
      gameOver: null,         // Game over
      gameOverNotif: null,    // Game over notification
      newRecord: null,        // New high score
      winFireworks: null,     // Stage completed/fireworks
      bossWarning: null       // Boss incoming warning
    };

    // ==================== BACKGROUND MUSIC ====================
    this.backgroundMusic = {
      // Normal stage music
      stage1to10: null,
      stage11to20: null,
      stage21to30: null,
      stage31toAll: null,
      menu: null,
      
      // Boss fight music (alternates based on stage)
      boss1: null,  // Odd stages
      boss2: null   // Even stages
    };

    // ==================== OTHER SOUNDS ====================
    this.sounds.other = {
      pinHit: null
    };

    console.log('✅ SoundManager ready - using lazy loading to prevent lag');
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
   * Sound path mappings
   */
  get audioPaths() {
    return {
      // Player sounds
      'player.fire': '/assets/audio/fire-normal.wav',
      'player.hit': '/assets/audio/fire.wav',
      'player.explode': '/assets/audio/boss dead.wav',
      
      // Enemy sounds
      'enemy.fire': '/assets/audio/fire-normal.wav',
      'enemy.hit': '/assets/audio/enemy-hit.wav',
      'enemy.destroy': '/assets/audio/boss dead.wav',
      'enemy.destroyNonShooting': '/assets/audio/fire.wav',
      
      // Boss sounds
      'enemy.bossFire': '/assets/audio/fire.wav',
      'enemy.bossExplode': '/assets/audio/boss dead.wav',
      'enemy.metalHit': '/assets/audio/enemy-hit.wav',
      'enemy.breakBones': '/assets/audio/fireworks.wav',
      
      // Power-up sounds
      'powerup.spawn': '/assets/audio/fire-normal.wav',
      'powerup.collect': '/assets/audio/enemy-hit.wav',
      'powerup.superCollect': '/assets/audio/fireworks.wav',
      'powerup.jackpot': '/assets/audio/fireworks.wav',
      
      // UI sounds
      'ui.click': '/assets/audio/enemy-hit.wav',
      'ui.gameOver': '/assets/audio/game-over.wav',
      'ui.gameOverNotif': '/assets/audio/fireworks.wav',
      'ui.newRecord': '/assets/audio/game-over.wav',
      'ui.winFireworks': '/assets/audio/fireworks.wav',
      'ui.bossWarning': '/assets/audio/warning-boss-incoming.mp3',
      
      // Background music
      'bgm.stage1to10': '/assets/audio/background-sound-1-to-10.mp3',
      'bgm.stage11to20': '/assets/audio/background-sound-11-to-20.mp3',
      'bgm.stage21to30': '/assets/audio/background-sound-21-to-30.mp3',
      'bgm.stage31toAll': '/assets/audio/background-sound-31-to-all.mp3',
      'bgm.menu': '/assets/audio/menu-background.mp3',
      'bgm.boss1': '/assets/audio/background-sound-1-to-10.mp3',
      'bgm.boss2': '/assets/audio/background-sound-11-to-20.mp3',
      
      // Other
      'other.pinHit': '/assets/audio/enemy-hit.wav'
    };
 }

  /**
   * Load an audio file and return the Audio object
   * @param {string} path - Path to audio file
   * @returns {HTMLAudioElement} - Audio element
   */
  loadAudio(path) {
    const audio = new Audio(path);
    audio.preload = 'auto'; // Preload for instant playback
    audio.volume = this.sfxVolume;
    return audio;
  }

  // ==================== PLAYBACK METHODS ====================

  /**
   * Play a sound by name (e.g., 'player.fire', 'enemy.bossExplode')
   * @param {string} soundPath - Dot notation path to sound (e.g., 'player.fire')
   */
  play(soundPath) {
    if (this.isMuted) {
      console.warn('🔇 Audio is muted, not playing:', soundPath);
      return;
    }
    
    console.log('🔊 Attempting to play sound:', soundPath);
    
    // 🔓 AUTO-UNLOCK: If audio not unlocked yet, try to unlock on first play
    if (!this.audioContextUnlocked) {
      console.warn('⚠️ Audio not unlocked yet, attempting auto-unlock...');
      this.unlockAudio().then(() => {
        console.log('✅ Audio auto-unlocked, retrying sound:', soundPath);
        this.play(soundPath); // Retry after unlock
      });
      return;
    }

    try {
      const parts = soundPath.split('.');
      const category = parts[0];
      const soundName = parts[1];
      
      if (!this.sounds[category] || !this.sounds[category][soundName]) {
        console.error(`❌ Sound not found: ${soundPath}`);
        console.error('Available categories:', Object.keys(this.sounds));
        if (this.sounds[category]) {
          console.error('Available sounds in this category:', Object.keys(this.sounds[category]));
        }
        return;
      }

      let sound = this.sounds[category][soundName];
      
      // 🔥 LAZY LOADING: Load sound on first use
      if (!sound) {
        console.log(`📥 Lazy loading sound: ${soundPath}`);
        sound = this.loadAudioOnDemand(soundPath);
        this.sounds[category][soundName] = sound; // Cache for next time
      }
      
      console.log(`🔊 Playing sound: ${soundPath} (volume: ${sound.volume})`);
      
      // Clone audio for overlapping sounds
      const clonedSound = sound.cloneNode(true);
      clonedSound.volume = this.sfxVolume;
      clonedSound.play().catch(err => {
        console.error(`❌ FAILED to play ${soundPath}:`, err);
        console.error('Error details:', err.message);
        console.error('Sound object:', sound);
      });
    } catch (error) {
      console.error(`❌ ERROR playing sound ${soundPath}:`, error);
      console.error('Error stack:', error.stack);
    }
  }

  /**
   * Play background music based on current stage
   * @param {number} stage - Current game stage
   */
  playBackgroundMusic(stage) {
    if (this.isMuted) return;
    
    // Determine which track to play
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
      console.log(`📥 Lazy loading background music: ${trackKey}`);
      const path = this.audioPaths[`bgm.${trackKey}`];
      if (path) {
        track = new Audio(path);
        track.preload = 'auto';
        this.backgroundMusic[trackKey] = track;
      }
    }

    if (track) {
      // Always play if track exists (remove the check to allow replay after boss music)
      // Only skip if this exact track is already playing
      if (track === this.currentBackgroundTrack && !this.currentBackgroundTrack.paused) {
        return; // Already playing this track
      }
      
      // Stop current music
      if (this.currentBackgroundTrack) {
        this.currentBackgroundTrack.pause();
        this.currentBackgroundTrack.currentTime = 0;
      }

      // Play new track
      this.currentBackgroundTrack = track;
      this.currentBackgroundTrack.volume = this.musicVolume;
      this.currentBackgroundTrack.loop = true;
      this.currentBackgroundTrack.play().catch(err => {
        console.warn('Failed to play background music:', err);
      });
    }
  }

  /**
   * Play boss fight background music
   * Alternates between boss1 (odd stages) and boss2 (even stages)
   * @param {number} stage - Current game stage
   */
  playBossMusic(stage) {
    if (this.isMuted) return;

    // Choose boss track based on stage (odd = boss1, even = boss2)
    const bossTrackKey = (stage % 2 === 1) ? 'boss1' : 'boss2';
    
    // 🔥 LAZY LOADING: Load boss music on first use
    let bossTrack = this.backgroundMusic[bossTrackKey];
    if (!bossTrack) {
      console.log(`📥 Lazy loading boss music: ${bossTrackKey}`);
      const path = this.audioPaths[`bgm.${bossTrackKey}`];
      if (path) {
        bossTrack = new Audio(path);
        bossTrack.preload = 'auto';
        this.backgroundMusic[bossTrackKey] = bossTrack;
      }
    }
    
    if (bossTrack && bossTrack !== this.currentBossTrack) {
      // Stop normal background music
      if (this.currentBackgroundTrack) {
        this.currentBackgroundTrack.pause();
        this.currentBackgroundTrack.currentTime = 0;
      }

      // Stop previous boss music
      if (this.currentBossTrack) {
        this.currentBossTrack.pause();
        this.currentBossTrack.currentTime = 0;
      }

      // Play boss music
      this.currentBossTrack = bossTrack;
      this.currentBossTrack.volume = this.musicVolume;
      this.currentBossTrack.loop = true;
      this.currentBossTrack.play().catch(err => {
        console.warn('Failed to play boss music:', err);
      });

      console.log(`🎵 Playing Boss Music Track ${stage % 2 === 1 ? '1' : '2'} (Stage ${stage})`);
    }
  }

  /**
   * Stop boss fight music and return to normal stage music
   * @param {number} stage - Current game stage
   */
  stopBossMusic(stage) {
    if (this.currentBossTrack) {
      this.currentBossTrack.pause();
      this.currentBossTrack.currentTime = 0;
      this.currentBossTrack = null;
    }
    
    // Resume normal background music
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
      // Stop current music
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
        console.warn('Failed to play menu music:', err);
      });
    }
  }

  // ==================== VOLUME CONTROL ====================

  /**
   * Set music volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.volume = this.musicVolume;
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.volume = this.musicVolume;
    }
  }

  /**
   * Set sound effects volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute all audio
   */
  mute() {
    this.isMuted = true;
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.pause();
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.pause();
    }
  }

  /**
   * Unmute all audio
   */
  unmute() {
    this.isMuted = false;
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.play().catch(err => {
        console.warn('Failed to resume music:', err);
      });
    }
    if (this.currentBossTrack) {
      this.currentBossTrack.play().catch(err => {
        console.warn('Failed to resume boss music:', err);
      });
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return !this.isMuted;
  }
}

export default SoundManager;
