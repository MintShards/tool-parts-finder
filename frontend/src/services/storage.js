/**
 * localStorage service for Tool Parts Finder
 *
 * Replaces MongoDB for Phase 1 MVP - stores search history and favorites locally.
 * Data persists in browser but is cleared if user clears cache.
 */

const HISTORY_KEY = 'tool_parts_history';
const FAVORITES_KEY = 'tool_parts_favorites';
const MAX_HISTORY = 50;

export const storage = {
  // ========== Search History ==========

  /**
   * Get search history (last 50 searches)
   * @returns {Array} Array of search history objects
   */
  getHistory() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  },

  /**
   * Add search to history
   * @param {string} query - Raw search query
   * @param {object} parsed - Parsed query (brand, model, part)
   * @param {Array} resultsOpened - List of vendor names opened
   */
  addToHistory(query, parsed, resultsOpened = []) {
    try {
      const history = this.getHistory();

      // Check for duplicate within last minute (avoid spam)
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const isDuplicate = history.some(
        item => item.query === query && item.timestamp > oneMinuteAgo
      );

      if (isDuplicate) {
        // Update timestamp of existing entry instead of duplicating
        const updated = history.map(item =>
          item.query === query && item.timestamp > oneMinuteAgo
            ? { ...item, timestamp: new Date().toISOString() }
            : item
        );
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return;
      }

      // Add new entry at the beginning
      const newEntry = {
        id: Date.now().toString(),
        query,
        parsed: parsed || { brand: null, model: null, part: null, raw_query: query },
        timestamp: new Date().toISOString(),
        results_opened: resultsOpened,
        marked_ordered: null
      };

      history.unshift(newEntry);

      // Keep only last 50 searches
      const trimmed = history.slice(0, MAX_HISTORY);

      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  },

  /**
   * Clear all search history
   */
  clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  },

  /**
   * Mark a search as ordered from specific vendor
   * @param {string} id - History entry ID
   * @param {string} vendor - Vendor name
   */
  markAsOrdered(id, vendor) {
    try {
      const history = this.getHistory();
      const updated = history.map(item =>
        item.id === id
          ? { ...item, marked_ordered: vendor, order_timestamp: new Date().toISOString() }
          : item
      );
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark as ordered:', error);
    }
  },

  // ========== Favorites ==========

  /**
   * Get all favorites sorted by times_ordered (most ordered first)
   * @returns {Array} Array of favorite objects
   */
  getFavorites() {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      const favorites = data ? JSON.parse(data) : [];

      // Sort by times_ordered descending, then by last_ordered descending
      return favorites.sort((a, b) => {
        if (b.times_ordered !== a.times_ordered) {
          return b.times_ordered - a.times_ordered;
        }
        // If times_ordered is equal, sort by last_ordered
        const aDate = a.last_ordered ? new Date(a.last_ordered) : new Date(0);
        const bDate = b.last_ordered ? new Date(b.last_ordered) : new Date(0);
        return bDate - aDate;
      });
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  },

  /**
   * Add a new favorite
   * @param {string} partDescription - User-friendly part name
   * @param {string} searchQuery - Search query to execute
   * @returns {object|null} The created favorite or existing if duplicate
   */
  addFavorite(partDescription, searchQuery) {
    try {
      const favorites = this.getFavorites();

      // Check for duplicate search_query
      const existing = favorites.find(f => f.search_query === searchQuery);
      if (existing) {
        return existing;
      }

      const newFavorite = {
        id: Date.now().toString(),
        part_description: partDescription,
        search_query: searchQuery,
        times_ordered: 0,
        last_ordered: null,
        preferred_vendor: null,
        created_at: new Date().toISOString()
      };

      favorites.push(newFavorite);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

      return newFavorite;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return null;
    }
  },

  /**
   * Delete a favorite
   * @param {string} id - Favorite ID
   */
  deleteFavorite(id) {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(f => f.id !== id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete favorite:', error);
    }
  },

  /**
   * Increment order count for a favorite
   * @param {string} id - Favorite ID
   * @returns {object|null} Updated favorite
   */
  incrementOrderCount(id) {
    try {
      const favorites = this.getFavorites();
      const updated = favorites.map(f =>
        f.id === id
          ? {
              ...f,
              times_ordered: f.times_ordered + 1,
              last_ordered: new Date().toISOString()
            }
          : f
      );

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

      return updated.find(f => f.id === id) || null;
    } catch (error) {
      console.error('Failed to increment order count:', error);
      return null;
    }
  },

  /**
   * Update favorite's preferred vendor
   * @param {string} id - Favorite ID
   * @param {string} vendor - Vendor name
   */
  setPreferredVendor(id, vendor) {
    try {
      const favorites = this.getFavorites();
      const updated = favorites.map(f =>
        f.id === id ? { ...f, preferred_vendor: vendor } : f
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to set preferred vendor:', error);
    }
  },

  // ========== Export/Import ==========

  /**
   * Export favorites to JSON file
   * @returns {string} JSON string of favorites
   */
  exportFavorites() {
    try {
      const favorites = this.getFavorites();
      const exportData = {
        exported_at: new Date().toISOString(),
        version: '1.0',
        favorites
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export favorites:', error);
      return null;
    }
  },

  /**
   * Import favorites from JSON file
   * @param {string} jsonString - JSON string of exported favorites
   * @param {boolean} merge - If true, merge with existing favorites. If false, replace.
   * @returns {boolean} Success status
   */
  importFavorites(jsonString, merge = true) {
    try {
      const importData = JSON.parse(jsonString);

      if (!importData.favorites || !Array.isArray(importData.favorites)) {
        throw new Error('Invalid import format');
      }

      if (merge) {
        const existing = this.getFavorites();
        const existingQueries = new Set(existing.map(f => f.search_query));

        // Only add favorites that don't already exist
        const newFavorites = importData.favorites.filter(
          f => !existingQueries.has(f.search_query)
        );

        const merged = [...existing, ...newFavorites];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
      } else {
        // Replace all favorites
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(importData.favorites));
      }

      return true;
    } catch (error) {
      console.error('Failed to import favorites:', error);
      return false;
    }
  },

  // ========== Utility ==========

  /**
   * Clear all data (history + favorites)
   * USE WITH CAUTION
   */
  clearAll() {
    try {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  },

  /**
   * Get storage usage stats
   * @returns {object} Storage statistics
   */
  getStats() {
    try {
      const history = this.getHistory();
      const favorites = this.getFavorites();

      const historySize = JSON.stringify(history).length;
      const favoritesSize = JSON.stringify(favorites).length;

      return {
        history: {
          count: history.length,
          size_bytes: historySize,
          size_kb: (historySize / 1024).toFixed(2)
        },
        favorites: {
          count: favorites.length,
          size_bytes: favoritesSize,
          size_kb: (favoritesSize / 1024).toFixed(2)
        },
        total: {
          size_bytes: historySize + favoritesSize,
          size_kb: ((historySize + favoritesSize) / 1024).toFixed(2)
        }
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }
};

export default storage;
