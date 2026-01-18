/**
 * LocalStorage Utility for Space Snake Game
 * Handles persistent storage for player data
 */

const STORAGE_KEYS = {
  SELECTED_CHARACTER: 'spacesnake_selectedCharacter',
  HIGH_SCORE: 'spacesnake_highScore',
  PLAYER_NAME: 'spacesnake_playerName',
  CREDITS: 'spacesnake_credits',
  LAST_CREDIT_DATE: 'spacesnake_lastCreditDate'
};

export const storage = {
  /**
   * Save selected character type
   */
  saveSelectedCharacter(characterType) {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CHARACTER, characterType);
      console.log('✅ Character saved:', characterType);
    } catch (error) {
      console.error('❌ Failed to save character:', error);
    }
  },

  /**
   * Load selected character type
   */
  loadSelectedCharacter() {
    try {
      const character = localStorage.getItem(STORAGE_KEYS.SELECTED_CHARACTER);
      return character || 'blue'; // Default to blue
    } catch (error) {
      console.error('❌ Failed to load character:', error);
      return 'blue'; // Default fallback
    }
  },

  /**
   * Save player name
   */
  savePlayerName(playerName) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
      console.log('✅ Player name saved:', playerName);
    } catch (error) {
      console.error('❌ Failed to save player name:', error);
    }
  },

  /**
   * Load player name
   */
  loadPlayerName() {
    try {
      const name = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
      return name || 'Player';
    } catch (error) {
      console.error('❌ Failed to load player name:', error);
      return 'Player';
    }
  },

  /**
   * Save high score
   */
  saveHighScore(score) {
    try {
      const currentHighScore = this.loadHighScore();
      if (score > currentHighScore) {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
        console.log('🏆 New high score saved:', score);
        return true; // New high score
      }
      return false; // Not a new high score
    } catch (error) {
      console.error('❌ Failed to save high score:', error);
      return false;
    }
  },

  /**
   * Load high score
   */
  loadHighScore() {
    try {
      const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return score ? parseInt(score, 10) : 0;
    } catch (error) {
      console.error('❌ Failed to load high score:', error);
      return 0;
    }
  },

  /**
   * Get remaining credits for today
   * 3 credits per day, resets at midnight
   */
  getCredits() {
    try {
      const today = new Date().toDateString();
      const lastCreditDate = localStorage.getItem(STORAGE_KEYS.LAST_CREDIT_DATE);
      const savedCredits = localStorage.getItem(STORAGE_KEYS.CREDITS);

      // If it's a new day, reset credits to 3
      if (lastCreditDate !== today) {
        this.resetCredits();
        return 3;
      }

      return savedCredits ? parseInt(savedCredits, 10) : 3;
    } catch (error) {
      console.error('❌ Failed to get credits:', error);
      return 3; // Default to 3 credits
    }
  },

  /**
   * Use a credit (decrement by 1)
   */
  useCredit() {
    try {
      const currentCredits = this.getCredits();
      if (currentCredits > 0) {
        const newCredits = currentCredits - 1;
        localStorage.setItem(STORAGE_KEYS.CREDITS, newCredits.toString());
        console.log('💰 Credit used. Remaining:', newCredits);
        return true; // Credit successfully used
      }
      return false; // No credits available
    } catch (error) {
      console.error('❌ Failed to use credit:', error);
      return false;
    }
  },

  /**
   * Reset credits to 3 (called at midnight or first play of the day)
   */
  resetCredits() {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(STORAGE_KEYS.LAST_CREDIT_DATE, today);
      localStorage.setItem(STORAGE_KEYS.CREDITS, '3');
      console.log('🔄 Credits reset to 3 for', today);
    } catch (error) {
      console.error('❌ Failed to reset credits:', error);
    }
  },

  /**
   * Clear all stored data (for testing/reset)
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🗑️ All storage cleared');
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
    }
  }
};
