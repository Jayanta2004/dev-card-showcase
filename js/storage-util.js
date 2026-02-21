/**
 * Utility class for managing localStorage in Tracker tools.
 * Provides a standardized way to save, load, and clear persistent data.
 */
class TrackerStorage {
    /**
     * Save data to localStorage with error handling for quota limits.
     * @param {string} key - The storage key.
     * @param {any} data - The data to serialize and save.
     * @returns {boolean} - True if successful, false otherwise.
     */
    static save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error(`TrackerStorage.save - Error saving key "${key}":`, error);
            if (error.name === 'QuotaExceededError') {
                alert("Storage quota exceeded. Some tracker data may not be saved.");
            }
            return false;
        }
    }

    /**
     * Load data from localStorage.
     * @param {string} key - The storage key.
     * @param {any} defaultData - Fallback data if the key doesn't exist or parsing fails.
     * @returns {any} - The parsed data or defaultData.
     */
    static load(key, defaultData = null) {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultData;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error(`TrackerStorage.load - Error loading key "${key}":`, error);
            return defaultData;
        }
    }

    /**
     * Remove data from localStorage.
     * @param {string} key - The storage key.
     */
    static clear(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`TrackerStorage.clear - Error removing key "${key}":`, error);
        }
    }
}
