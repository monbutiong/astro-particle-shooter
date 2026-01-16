/**
 * SoundManager - Efficient Audio System for Space Snake Game
 * Preloads all audio and provides organized sound playback methods
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isMuted = false;
    this.musicVolume = 0.3; // 30% volume for background music
    this.sfxVolume = 0.5;   // 50% volume for sound effects
    
    this.preloadAllSounds();
  }

  /**
   * Preload all audio files to prevent lag during gameplay
   * Audio is loaded but not played until needed
   */
  preloadAllSounds() {
    // ==================== BACKGROUND MUSIC ====================
    this.backgroundMusic = {
      stage1to10: this.loadAudio('/src/assets/audio/background-sound-1-to-10.mp3'),
      stage11to20: this.loadAudio('/src/assets/audio/background-sound-11-to-20.mp3'),
      stage21to30: this.loadAudio('/src/assets/audio/background-sound-21-to-30.mp3'),
      stage31toAll: this.loadAudio('/src/assets/audio/background-sound-31-to-all.mp3'),
      menu: this.loadAudio('/src/assets/audio/menu-background.mp3')
    };

    // ==================== PLAYER SOUNDS ====================
    this.sounds.player = {
      fire: this.loadAudio('/src/assets/audio/fire-normal.wav'),          // Player shooting
      explode: this.loadAudio('/src/assets/audio/player-explode.wav')     // Player death
    };

    // ==================== ENEMY SOUNDS ====================
    this.sounds.enemy = {
      // Shooting enemies
      fire: this.loadAudio('/src/assets/audio/shooting-enemy-fire.wav'),  // Enemy shooting
      hit: this.loadAudio('/src/assets/audio/shooting-enemy-hit.wav'),    // Enemy hit by bullet
      destroy: this.loadAudio('/src/assets/audio/shooting-enemy-destroyed.mp3'), // Shooting enemy destroyed
      
      // Non-shooting enemies
      destroyNonShooting: this.loadAudio('/src/assets/audio/none-shooting-enemy-destroyed.wav'), // Non-shooting enemy destroyed
      
      // Boss enemies
      bossFire: this.loadAudio('/src/assets/audio/boss-fire.wav'),        // Boss shooting
      bossExplode: this.loadAudio('/src/assets/audio/boss-explode.wav'),  // Boss defeated
      metalHit: this.loadAudio('/src/assets/audio/metal-hit.wav'),        // Boss hit (metal sound)
      breakBones: this.loadAudio('/src/assets/audio/break-bones.wav')     // Boss destruction
    };

    // ==================== POWER-UP SOUNDS ====================
    this.sounds.powerup = {
      spawn: this.loadAudio('/src/assets/audio/power-up-beam.mp3'),       // Power-up appears
      collect: this.loadAudio('/src/assets/audio/power-ups-gain.wav'),    // Normal power-up collected
      superCollect: this.loadAudio('/src/assets/audio/super-power-upda-gained.wav'), // Super power-up collected
      jackpot: this.loadAudio('/src/assets/audio/jackpot.wav')            // Special/jackpot power-up
    };

    // ==================== UI & GAME STATE SOUNDS ====================
    this.sounds.ui = {
      click: this.loadAudio('/src/assets/audio/ui_click.wav'),            // UI button clicks
      gameOver: this.loadAudio('/src/assets/audio/game-over.wav'),        // Game over
      gameOverNotif: this.loadAudio('/src/assets/audio/game-over-notif.wav'), // Game over notification
      newRecord: this.loadAudio('/src/assets/audio/new_record.wav'),      // New high score
      winFireworks: this.loadAudio('/src/assets/audio/win_fireworks.wav') // Stage completed/fireworks
    };

    // ==================== OTHER SOUNDS ====================
    this.sounds.other = {
      pinHit: this.loadAudio('/src/assets/audio/pin_hit.wav')            // Pin/collision sound
    };

    console.log('✅ All audio files preloaded successfully');
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
    if (this.isMuted) return;

    try {
      const parts = soundPath.split('.');
      const category = parts[0];
      const soundName = parts[1];
      
      if (!this.sounds[category] || !this.sounds[category][soundName]) {
        console.warn(`Sound not found: ${soundPath}`);
        return;
      }

      const sound = this.sounds[category][soundName];
      
      // Clone audio for overlapping sounds
      const clonedSound = sound.cloneNode(true);
      clonedSound.volume = this.sfxVolume;
      clonedSound.play().catch(err => {
        console.warn(`Failed to play ${soundPath}:`, err);
      });
    } catch (error) {
      console.error(`Error playing sound ${soundPath}:`, error);
    }
  }

  /**
   * Play background music based on current stage
   * @param {number} stage - Current game stage
   */
  playBackgroundMusic(stage) {
    if (this.isMuted) return;

    let track;
    if (stage <= 10) {
      track = this.backgroundMusic.stage1to10;
    } else if (stage <= 20) {
      track = this.backgroundMusic.stage11to20;
    } else if (stage <= 30) {
      track = this.backgroundMusic.stage21to30;
    } else {
      track = this.backgroundMusic.stage31toAll;
    }

    if (track && track !== this.currentBackgroundTrack) {
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
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.currentBackgroundTrack) {
      this.currentBackgroundTrack.pause();
      this.currentBackgroundTrack.currentTime = 0;
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
