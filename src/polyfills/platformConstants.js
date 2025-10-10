/**
 * Polyfill for PlatformConstants TurboModule
 * Fixes: TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found
 * 
 * This is a React Native compatible polyfill (no Node.js modules)
 */

// Este código se ejecuta inmediatamente cuando se importa
(function() {
  // Esperar a que TurboModuleRegistry esté disponible
  let attempts = 0;
  const maxAttempts = 50;
  
  const tryPatch = () => {
    try {
      // Intentar obtener TurboModuleRegistry
      const TurboModuleRegistry = require('react-native/Libraries/TurboModule/TurboModuleRegistry');
      
      if (!TurboModuleRegistry || !TurboModuleRegistry.getEnforcing) {
        if (attempts++ < maxAttempts) {
          setTimeout(tryPatch, 10);
        }
        return;
      }
      
      // Ya está parcheado
      if (TurboModuleRegistry.__platformConstantsPatched) {
        return;
      }
      
      const originalGetEnforcing = TurboModuleRegistry.getEnforcing;
      const originalGet = TurboModuleRegistry.get || (() => null);
      
      // Mock de PlatformConstants
      const platformConstantsMock = {
        getConstants: () => ({
          isTesting: false,
          reactNativeVersion: { major: 0, minor: 76, patch: 5 },
          forceTouchAvailable: false,
          osVersion: '14',
          systemName: 'android',
          interfaceIdiom: 'phone',
        }),
        isTesting: false,
        reactNativeVersion: { major: 0, minor: 76, patch: 5 },
        forceTouchAvailable: false,
        osVersion: '14',
        systemName: 'android',
        interfaceIdiom: 'phone',
      };
      
      // Patch getEnforcing
      TurboModuleRegistry.getEnforcing = function(name) {
        if (name === 'PlatformConstants') {
          return platformConstantsMock;
        }
        return originalGetEnforcing.call(this, name);
      };
      
      // Patch get
      TurboModuleRegistry.get = function(name) {
        if (name === 'PlatformConstants') {
          return platformConstantsMock;
        }
        return originalGet.call(this, name);
      };
      
      TurboModuleRegistry.__platformConstantsPatched = true;
      console.log('✅ PlatformConstants polyfill applied');
      
    } catch (error) {
      if (attempts++ < maxAttempts) {
        setTimeout(tryPatch, 10);
      } else {
        console.warn('⚠️ Could not apply PlatformConstants polyfill after', maxAttempts, 'attempts');
      }
    }
  };
  
  // Iniciar el proceso de parcheo
  tryPatch();
})();
