module.exports = {
  preset: "@react-native/jest-preset",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|@react-native-async-storage|react-native-permissions|react-native-safe-area-context|react-native-screens)/)"
  ],
  moduleNameMapper: {
    "^@react-native-community/geolocation$": "<rootDir>/test/geolocationMock.js",
    "^react-native-permissions$": "<rootDir>/test/reactNativePermissionsMock.js"
  }
};
