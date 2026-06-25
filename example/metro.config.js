const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
	extraNodeModules: {
	  '@faceaisdk/react-native-face-sdk': workspaceRoot,
	},
	nodeModulesPaths: [
	  path.resolve(projectRoot, 'node_modules'),
	  path.resolve(workspaceRoot, 'node_modules'),
	],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
