const { getDefaultConfig } = require('expo/metro-config');  
  
const config = getDefaultConfig(__dirname);  
  
// Deshabilitar cache para debugging  
config.cacheStores = [];  
  
// Configuración del transformer  
config.transformer.minifierPath = 'metro-minify-terser';  
config.transformer.minifierConfig = {  
  keep_fnames: true,  
  mangle: {  
    keep_fnames: true,  
  },  
  // Agregar límites de memoria  
  maxWorkers: 2,  
};  
  
config.transformer.unstable_allowRequireContext = true;  
  
// Configuración del resolver  
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'];  
config.resolver.platforms = ['ios', 'android', 'native', 'web'];  
  
// Agregar configuración de memoria  
config.maxWorkers = 2;  
config.watchFolders = [__dirname];  
  
module.exports = config;