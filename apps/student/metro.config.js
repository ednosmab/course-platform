const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const makeMetroResolver = require('@rnx-kit/metro-resolver-symlinks');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, '../../packages'),
  path.resolve(__dirname, '../../node_modules'),
];

config.resolver.resolveRequest = makeMetroResolver();
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
