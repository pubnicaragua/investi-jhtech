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

// Configuración para reducir uso de memoria - OPTIMIZADO
config.maxWorkers = 2; // Limitar workers para reducir memoria
config.resetCache = false; // No resetear cache automáticamente

// Deshabilitar cache de disco para evitar errores de memoria
config.cacheStores = [];

// Transformer optimizado para memoria
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: false,
    },
  },
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // ACTIVADO: Reduce memoria al cargar módulos bajo demanda
    },
  }),
};

// Resolver simplificado
config.resolver = {
  ...config.resolver,
  sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json', 'mjs', 'cjs'],
  assetExts: [...(config.resolver.assetExts || [])],
  // Bloquear archivos que no deben ser procesados por Metro
  blockList: [
    /.*\.sql$/,
    /.*\.md$/,
    /.*\.bat$/,
    /.*\.txt$/,
  ],
};

// Configuración mínima - sin optimizaciones que puedan causar problemas

// Serializer optimizado para memoria
config.serializer = {
  ...config.serializer,
  // Filtrar módulos innecesarios para reducir memoria
  processModuleFilter: (module) => {
    // Excluir archivos de test
    if (module.path.includes('__tests__') || 
        module.path.includes('test.') ||
        module.path.includes('.spec.') ||
        module.path.includes('/tests/') ||
        module.path.includes('\\tests\\')) {
      return false;
    }
    // Excluir archivos grandes de documentación
    if (module.path.match(/\.(sql|md|txt)$/)) {
      return false;
    }
    return true;
  },
};

module.exports = config;