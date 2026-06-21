const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, '../../packages'),
  path.resolve(__dirname, '../../node_modules'),
];

config.resolver.unstable_enablePackageExports = true;

// Exclude expo-sqlite from web builds (it requires native WASM support)
config.resolver.platforms = ['native', 'web'];
config.resolver.unstable_conditionNames = ['browser', 'require', 'import'];

module.exports = config;