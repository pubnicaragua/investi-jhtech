import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Cross-platform storage utility
class Storage {
  private isWeb = Platform.OS === 'web';

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        // Use localStorage for web
        localStorage.setItem(key, value);
      } else {
        // Use SecureStore for native platforms
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Use SecureStore for native platforms
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        // Use localStorage for web
        localStorage.removeItem(key);
      } else {
        // Use SecureStore for native platforms
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isWeb) {
        // Clear all localStorage items (be careful with this)
        localStorage.clear();
      } else {
        // For native, we'd need to track keys or clear specific ones
        // This is a basic implementation
        const keys = ['access_token', 'refresh_token', 'user_data'];
        for (const key of keys) {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch (error) {
            // Ignore errors for non-existent keys
          }
        }
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export const storage = new Storage();
