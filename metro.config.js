const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix EPERM errors on Windows by disabling workers
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
  unstable_allowRequireContext: true,
  // Disable worker processes to avoid EPERM errors
  enableBabelRCLookup: false,
  enableBabelConfigLookup: false,
  workerPath: require.resolve('metro/src/DeltaBundler/Worker'),
};

// Configure resolver for web compatibility
config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'],
  platforms: ['ios', 'android', 'native', 'web'],
  alias: {
    // Use crypto-browserify for crypto on web
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
  },
};

// Prevent EPERM issues by using single worker
config.maxWorkers = 1;
config.resetCache = true;

// Disable problematic cache stores
config.cacheStores = [];

// Add Windows-specific fixes
if (process.platform === 'win32') {
  config.watchFolders = [];
  config.transformer.enableBabelRuntime = false;
}

module.exports = config;