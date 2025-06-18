class LocalStorageController {
  /**
   * Set an item in localStorage with type safety
   * @param key The key to set
   * @param value The value to store (will be stringified)
   */
  public set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }

  /**
   * Get an item from localStorage with type safety
   * @param key The key to get
   * @param defaultValue Optional default value if the key doesn't exist
   * @returns The parsed value or null if not found
   */
  public get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) return defaultValue;
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove an item from localStorage
   * @param key The key to remove
   */
  public remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all items from localStorage
   */
  public clear(): void {
    localStorage.clear();
  }

  /**
   * Check if a key exists in localStorage
   * @param key The key to check
   * @returns True if the key exists
   */
  public has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   * @returns An array of keys
   */
  public keys(): string[] {
    return Object.keys(localStorage);
  }

  /**
   * Get the number of items in localStorage
   * @returns The number of items
   */
  public length(): number {
    return localStorage.length;
  }
}

const storageController = new LocalStorageController();

export default storageController;