const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Plugin para deshabilitar el splash screen nativo de Android
 * Esto permite que el componente SplashScreen con video se muestre inmediatamente
 */
const withNoSplash = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Encontrar la actividad principal
    const mainApplication = androidManifest.manifest.application[0];
    const mainActivity = mainApplication.activity?.find(
      (activity) => activity.$?.['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Remover el tema de splash screen si existe
      if (mainActivity.$) {
        delete mainActivity.$['android:theme'];
      }
    }

    return config;
  });
};

module.exports = withNoSplash;
