module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Optimizaciones para velocidad
          lazyImports: true,
          native: {
            // Deshabilitar transformaciones innecesarias
            disableImportExportTransform: false,
          },
        },
      ],
    ],
    plugins: [
      // Module resolver SOLO si realmente lo usas
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.tsx', '.ts', '.jsx', '.js'], // Orden optimizado
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@api': './src/rest',
          },
        },
      ],
      // Reanimated SIEMPRE al final
      'react-native-reanimated/plugin',
    ],
    // Cache agresivo
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
