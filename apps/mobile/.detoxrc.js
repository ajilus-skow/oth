/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: { $0: "jest", config: "detox.jest.config.js" },
    retries: 1
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/oth.app",
      build:
        "xcodebuild -workspace ios/oth.xcworkspace -scheme oth -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO"
    }
  },
  devices: { simulator: { type: "ios.simulator", device: { type: "iPhone 17 Pro" } } },
  configurations: { "ios.sim.debug": { device: "simulator", app: "ios.debug" } }
};
