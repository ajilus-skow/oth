# Local development

Use Node.js 22 and npm from the repository root. The app is a bare React Native
iOS project, so native dependencies and builds require macOS, Xcode, and
CocoaPods.

```bash
npm install
cd apps/mobile/ios
bundle exec pod install
cd ../../..
make run-ios
```

Linux hosts can edit TypeScript and run workspace validation. iOS work requires
a Mac development machine for CocoaPods, Simulator, device, and Xcode work.
Android development is currently paused.

## Remote iOS development machine

The designated Mac is `ajilus-air.local`, reached as `skow` with
`~/.ssh/id_ed25519_mac_air`. The remote checkout is an rsync mirror at
`~/on-the-hook-ios-build`; make source edits in this repository, not on the
Mac.

```bash
make ios-remote-doctor
make ios-remote-build
make ios-remote-run
```

The Mac needs Xcode at `/Applications/Xcode.app`, Node 22, and CocoaPods.
Remote sync protects Mac-generated `Pods`, the CocoaPods workspace, and local
build output from rsync deletion. Use `make ios-remote-logs` for diagnostics.
