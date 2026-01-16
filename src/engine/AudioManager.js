/**
 * AudioManager - Efficient audio system with lazy loading
 * Loads audio files on-demand to prevent initial lag
 */

class AudioManager {
  constructor() {
    this.audioCache = new Map(); // Caches loaded audio
    this.volume = {
      music: 0.3,
      sfx: 0.5,
      master: 0.8
    };
    
    // Current background music
    this.currentMusic = null;
    this.musicVolume = 0.3;
    
    // Audio file mappings
    this.audioFiles = {
      // Background music
      'menu-music': '/assets/audio/menu-background.mp3',
      'bgm-1-10': '/assets/audio/background-sound-1-to-10.mp3',
      'bgm-11-20': '/assets/audio/background-sound-11-to-20.mp3',
      'bgm-21-30': '/assets/audio/background-sound-21-to-30.mp3',
      'bgm-31-all': '/assets/audio/background-sound-31-to-all.mp3',
      
      // Player sounds
      'player-shoot': '/assets/audio/fire.wav',
      'player-explode': '/assets/audio/player-explode.wav',
      'power-up': '/assets/audio/power-ups-gain.wav',
      'power-up-beam': '/assets/audio/power-up-beam.mp3',
      'super-power-up': '/assets/audio/super-power-upda-gained.wav',
      
      // Enemy sounds
      'enemy-destroyed': '/assets/audio/none-shooting-enemy-destroyed.wav',
      'shooting-enemy-destroyed': '/assets/audio/shooting-enemy-destroyed.mp3',
      'enemy-fire': '/assets/audio/shooting-enemy-fire.wav',
      'enemy-hit': '/assets/audio/shooting-enemy-hit.wav',
      'boss-fire': '/assets/audio/boss-fire.wav',
      'boss-explode': '/assets/audio/boss-explode.wav',
      
      // Game events
      'game-over': '/assets/audio/game-over.wav',
      'game-over-notif': '/assets/audio/game-over-notif.wav',
      'new-record': '/assets/audio/new_record.wav',
      'win-fireworks': '/assets/audio/win_fireworks.wav',
      'jackpot': '/assets/audio/jackpot.wav',
      'stage-clear': '/assets/audio/win_fireworks.wav',
      
      // UI sounds
      'ui-click': '/assets/audio/ui_click.wav',
      'pin-hit': '/assets/audio/pin_hit.wav',
      'metal-hit': '/assets/audio/metal-hit.wav',
      'break-bones': '/assets/audio/break-bones.wav'
    };
  }
  
  /**
   * Load an audio file (lazy loading - only loads when needed)
   * @param {string} key - Audio key from audioFiles map
   * @returns {HTMLAudioElement|null}
   */
  loadAudio(key) {
    // Check if already cached
    if (this.audioCache.has(key)) {
      return this.audioCache.get(key);
    }
    
    const audioPath = this.audioFiles[key];
    if (!audioPath) {
      console.warn(`Audio key "${key}" not found in audioFiles map`);
      return null;
    }
    
    try {
      const audio = new Audio(audioPath);
      
      // Set volume based on type
      if (key.includes('bgm') || key.includes('music')) {
        audio.volume = this.volume.music * this.volume.master;
        audio.loop = true;
      } else {
        audio.volume = this.volume.sfx * this.volume.master;
        audio.loop = false;
      }
      
      // Cache the audio
      this.audioCache.set(key, audio);
      
      console.log(`✅ Loaded audio: ${key}`);
      return audio;
    } catch (error) {
      console.error(`❌ Failed to load audio: ${key}`, error);
      return null;
    }
  }
  
  /**
   * Play a sound effect
   * @param {string} key - Audio key
   * @param {boolean} restart - Whether to restart if already playing
   */
  playSFX(key, restart = true) {
    const audio = this.loadAudio(key);
    if (!audio) return;
    
    try {
      if (restart) {
        audio.currentTime = 0;
      }
      audio.play().catch(err => {
        // Ignore autoplay errors (common until user interacts)
        if (err.name !== 'NotAllowedError') {
          console.warn(`Failed to play ${key}:`, err);
        }
      });
    } catch (error) {
      console.error(`Error playing SFX ${key}:`, error);
    }
  }
  
  /**
   * Play background music
   * @param {string} key - Music audio key
   * @param {number} volume - Optional volume override (0-1)
   */
  playMusic(key, volume = null) {
    // Stop current music if playing
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
    
    const audio = this.loadAudio(key);
    if (!audio) return;
    
    if (volume !== null) {
      audio.volume = volume * this.volume.master;
    }
    
    this.currentMusic = audio;
    
    try {
      audio.play().catch(err => {
        if (err.name !== 'NotAllowedError') {
          console.warn(`Failed to play music ${key}:`, err);
        }
      });
    } catch (error) {
      console.error(`Error playing music ${key}:`, error);
    }
  }
  
  /**
   * Stop background music
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
  }
  
  /**
   * Pause background music
   */
  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }
  
  /**
   * Resume background music
   */
  resumeMusic() {
    if (this.currentMusic) {
      this.currentMusic.play().catch(err => {
        console.warn('Failed to resume music:', err);
      });
    }
  }
  
  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setMasterVolume(volume) {
    this.volume.master = Math.max(0, Math.min(1, volume));
    
    // Update all cached audio volumes
    this.audioCache.forEach((audio, key) => {
      if (key.includes('bgm') || key.includes('music')) {
        audio.volume = this.volume.music * this.volume.master;
      } else {
        audio.volume = this.volume.sfx * this.volume.master;
      }
    });
  }
  
  /**
   * Set music volume
   * @param {number} volume - Volume level (0-1)
   */
  setMusicVolume(volume) {
    this.volume.music = Math.max(0, Math.min(1, volume));
    
    // Update music audio
    this.audioCache.forEach((audio, key) => {
      if (key.includes('bgm') || key.includes('music')) {
        audio.volume = this.volume.music * this.volume.master;
      }
    });
  }
  
  /**
   * Set SFX volume
   * @param {number} volume - Volume level (0-1)
   */
  setSFXVolume(volume) {
    this.volume.sfx = Math.max(0, Math.min(1, volume));
    
    // Update SFX audio
    this.audioCache.forEach((audio, key) => {
      if (!key.includes('bgm') && !key.includes('music')) {
        audio.volume = this.volume.sfx * this.volume.master;
      }
    });
  }
  
  /**
   * Get background music for stage
   * @param {number} stage - Current stage number
   * @returns {string} - Music audio key
   */
  getStageMusic(stage) {
    if (stage <= 10) return 'bgm-1-10';
    if (stage <= 20) return 'bgm-11-20';
    if (stage <= 30) return 'bgm-21-30';
    return 'bgm-31-all';
  }
  
  /**
   * Preload specific audio files (optional, for critical sounds)
   * @param {string[]} keys - Array of audio keys to preload
   */
  async preloadAudio(keys) {
    const promises = keys.map(key => {
      return new Promise((resolve) => {
        const audio = this.loadAudio(key);
        if (audio) {
          audio.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio.addEventListener('error', () => resolve(), { once: true });
          // Set timeout in case loading takes too long
          setTimeout(() => resolve(), 5000);
        } else {
          resolve();
        }
      });
    });
    
    await Promise.all(promises);
    console.log('✅ Audio preloading complete');
  }
  
  /**
   * Clear audio cache (free memory)
   */
  clearCache() {
    // Stop current music
    this.stopMusic();
    
    // Clear all cached audio
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    
    this.audioCache.clear();
    console.log('🗑️ Audio cache cleared');
  }
  
  /**
   * Get audio cache stats
   */
  getCacheStats() {
    return {
      totalFiles: Object.keys(this.audioFiles).length,
      loadedFiles: this.audioCache.size,
      cacheSizePercent: Math.round((this.audioCache.size / Object.keys(this.audioFiles).length) * 100)
    };
  }
}

export default AudioManager;
