const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const fs = require("fs");
const path = require("path");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const workspaceRoot = path.resolve(__dirname, "../..");
const babelRuntimeRoot = path.resolve(workspaceRoot, "node_modules/@babel/runtime");
const reactNativeRoot = path.resolve(workspaceRoot, "node_modules/react-native");
const config = {
  resolver: {
    // Metro starts from this workspace package, while npm hoists shared
    // dependencies to the monorepo root. Resolve Babel helpers explicitly so
    // generated imports work both locally and on the remote macOS builder.
    resolveRequest(context, moduleName, platform) {
      if (moduleName.startsWith("@babel/runtime/")) {
        const helperPath = path.resolve(babelRuntimeRoot, moduleName.slice("@babel/runtime/"));

        if (helperPath.startsWith(`${babelRuntimeRoot}${path.sep}`) && fs.existsSync(helperPath)) {
          return { filePath: helperPath, type: "sourceFile" };
        }
      }

      return context.resolveRequest(context, moduleName, platform);
    },
    extraNodeModules: {
      "@babel/runtime": babelRuntimeRoot,
      react: path.resolve(workspaceRoot, "node_modules/react"),
      "react-native": reactNativeRoot
    },
    nodeModulesPaths: [path.resolve(__dirname, "node_modules"), path.resolve(workspaceRoot, "node_modules")],
    unstable_enablePackageExports: false
  },
  watchFolders: [workspaceRoot]
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
