const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración súper optimizada para velocidad
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  // Desactivar minificación en desarrollo
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    ecma: 8,
    keep_fnames: true,
    module: true,
  },
};

// Resolver optimizado
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  platforms: ['ios', 'android', 'native', 'web'],
  // Blacklist para evitar módulos problemáticos
  blockList: [
    /.*\/__tests__\/.*/,
    /.*\/test\/.*/,
    /.*\.test\.(js|jsx|ts|tsx)$/,
    /.*\.spec\.(js|jsx|ts|tsx)$/,
  ],
};

// Configuración de workers para velocidad
const os = require('os');
config.maxWorkers = Math.max(1, Math.floor(os.cpus().length * 0.75));

// Cache agresivo
config.resetCache = false;

// Servidor optimizado
config.server = {
  ...config.server,
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Headers de cache para assets
      if (req.url.includes('.bundle') || req.url.includes('.map')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
      return middleware(req, res, next);
    };
  },
};

// Watcher optimizado
config.watchFolders = [];
config.watcher = {
  ...config.watcher,
  additionalExts: ['cjs'],
  healthCheck: {
    enabled: false,
  },
};

module.exports = config;