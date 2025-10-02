const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Silenciar warnings específicos de paquetes
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('use-latest-callback') || 
      args[0]?.includes?.('invalid package.json configuration')) {
    return; // Ignorar este warning específico
  }
  originalWarn(...args);
};

// Detectar si es producción
const isProduction = process.env.NODE_ENV === 'production';

// Transformer básico - SIN optimizaciones agresivas que causen problemas
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false, // DESACTIVADO: Puede causar problemas de módulos
    },
  }),
};

// Resolver simplificado
config.resolver = {
  ...config.resolver,
  sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json', 'mjs', 'cjs'],
  assetExts: [...(config.resolver.assetExts || [])],
};

// Configuración mínima - sin optimizaciones que puedan causar problemas

// Serializer simplificado - SIN custom module IDs
config.serializer = {
  ...config.serializer,
  // Filtrar solo módulos de test
  processModuleFilter: (module) => {
    if (module.path.includes('__tests__') || 
        module.path.includes('test.') ||
        module.path.includes('.spec.')) {
      return false;
    }
    return true;
  },
};

module.exports = config;