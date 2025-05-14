const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
  __dirname,
  path.resolve(__dirname, '../../shared'), // Path to shared folder
];

module.exports = config;
