import { storage } from './storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Migración de claves antiguas con '@' a claves válidas sin '@'
 * SecureStore no acepta claves con '@', solo caracteres alfanuméricos, '.', '-', y '_'
 */
export async function migrateStorageKeys(): Promise<void> {
  try {
    console.log('🔄 [StorageMigration] Iniciando migración de claves...');

    // Mapeo de claves antiguas a nuevas
    const keyMigrations: Record<string, string> = {
      '@auth_token': 'auth_token',
      '@onboarding_complete': 'onboarding_complete',
      '@communities_complete': 'communities_complete',
    };

    if (Platform.OS === 'web') {
      // En web, usar localStorage directamente
      for (const [oldKey, newKey] of Object.entries(keyMigrations)) {
        const value = localStorage.getItem(oldKey);
        if (value) {
          console.log(`✅ [StorageMigration] Migrando ${oldKey} → ${newKey}`);
          localStorage.setItem(newKey, value);
          localStorage.removeItem(oldKey);
        }
      }
    } else {
      // En móvil, usar AsyncStorage (SecureStore se maneja internamente)
      for (const [oldKey, newKey] of Object.entries(keyMigrations)) {
        try {
          const value = await AsyncStorage.getItem(oldKey);
          if (value) {
            console.log(`✅ [StorageMigration] Migrando ${oldKey} → ${newKey}`);
            await AsyncStorage.setItem(newKey, value);
            await AsyncStorage.removeItem(oldKey);
          }
        } catch (error) {
          // Ignorar errores de claves que no existen
          console.log(`⚠️ [StorageMigration] No se pudo migrar ${oldKey}:`, error);
        }
      }
    }

    console.log('✅ [StorageMigration] Migración completada');
  } catch (error) {
    console.error('❌ [StorageMigration] Error durante la migración:', error);
  }
}

/**
 * Limpiar todas las claves antiguas con '@'
 */
export async function cleanupOldKeys(): Promise<void> {
  try {
    console.log('🧹 [StorageMigration] Limpiando claves antiguas...');

    const oldKeys = [
      '@auth_token',
      '@onboarding_complete',
      '@communities_complete',
    ];

    if (Platform.OS === 'web') {
      for (const key of oldKeys) {
        localStorage.removeItem(key);
      }
    } else {
      for (const key of oldKeys) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          // Ignorar errores
        }
      }
    }

    console.log('✅ [StorageMigration] Limpieza completada');
  } catch (error) {
    console.error('❌ [StorageMigration] Error durante la limpieza:', error);
  }
}
