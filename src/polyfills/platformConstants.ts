/**
 * Polyfill for PlatformConstants TurboModule
 * Fixes: TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found
 * 
 * This only affects Expo Go development mode, not production builds
 */

import { Platform, Dimensions } from 'react-native';

// Aplicar INMEDIATAMENTE antes de cualquier otra cosa
try {
  // Intentar acceder a TurboModuleRegistry
  const TurboModuleRegistry = require('react-native/Libraries/TurboModule/TurboModuleRegistry');
  
  // Guardar la función original
  const originalGetEnforcing = TurboModuleRegistry.getEnforcing;
  const originalGet = TurboModuleRegistry.get;
  
  // Mock de PlatformConstants
  const createPlatformConstantsMock = () => {
    const { width } = Dimensions.get('window');
    return {
      getConstants: () => ({
        isTesting: false,
        reactNativeVersion: { major: 0, minor: 76, patch: 5 },
        forceTouchAvailable: false,
        osVersion: Platform.Version || '14',
        systemName: Platform.OS,
        interfaceIdiom: width >= 768 ? 'tablet' : 'phone',
      }),
      isTesting: false,
      reactNativeVersion: { major: 0, minor: 76, patch: 5 },
      forceTouchAvailable: false,
      osVersion: Platform.Version || '14',
      systemName: Platform.OS,
      interfaceIdiom: width >= 768 ? 'tablet' : 'phone',
    };
  };
  
  // Sobrescribir getEnforcing
  TurboModuleRegistry.getEnforcing = function(name: string) {
    if (name === 'PlatformConstants') {
      return createPlatformConstantsMock();
    }
    
    try {
      return originalGetEnforcing.call(this, name);
    } catch (error) {
      // Si falla, intentar con get
      const module = TurboModuleRegistry.get(name);
      if (module) return module;
      throw error;
    }
  };
  
  // Sobrescribir get también
  TurboModuleRegistry.get = function(name: string) {
    if (name === 'PlatformConstants') {
      return createPlatformConstantsMock();
    }
    return originalGet.call(this, name);
  };
  
  console.log('✅ PlatformConstants polyfill applied');
} catch (error) {
  console.warn('⚠️ Could not apply PlatformConstants polyfill:', error);
}

export {};
