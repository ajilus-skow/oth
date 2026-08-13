# On The Hook

OnTheHookBeta is an iOS-first React Native application. The repository is an npm
workspace so additional applications and shared packages can be added without
changing the development model.

## Prerequisites

- Node.js 22 and npm
- macOS with current Xcode and CocoaPods for iOS builds and Simulator runs

## Setup and run

```bash
npm install
cd apps/mobile/ios && bundle exec pod install
cd ../../..
make run-ios
```

The Xcode project is `apps/mobile/ios/oth.xcodeproj`; its bundle identifier is
`com.ajilus.oth`.

## Validate

```bash
make lint
make test
```

See [the app guide](apps/mobile/README.md) for iOS-specific commands.

## Remote Mac and GitHub Actions

Linux-to-Mac iOS builds use Audestra's configured development host:

```bash
make ios-remote-doctor
make ios-remote-build
```

GitHub Actions expects opt-in self-hosted runners labelled `oth-linux` and
`oth-mac`. An authorized repository administrator can register them with:

```bash
make runners-register RUNNER_REPOSITORY=owner/repository
```

Pull requests and `main` pushes run JavaScript checks and an iOS Simulator
build. Tags matching `oth-v*` trigger the TestFlight release workflow after
the required GitHub environment variables and App Store Connect secrets are
configured.
