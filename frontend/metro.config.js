const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow SQLite .db files to be bundled
config.resolver.assetExts.push('db');
config.resolver.assetExts.push('wasm');

// Remove 'db' from sourceExts if it was added there
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'db');

module.exports = config;
