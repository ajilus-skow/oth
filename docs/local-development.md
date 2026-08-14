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
The native project currently targets iOS only.

## Remote iOS development machine

From Linux, use the designated Mac at `ajilus-air.local` for every native iOS
build, Simulator run, and native diagnostic. It is reached as `skow` with
`~/.ssh/id_ed25519_mac_air`; its `~/on-the-hook-ios-build` checkout is an
rsync mirror, not a source of truth. Make every edit locally—the next sync uses
`--delete` and can overwrite remote source files.

Begin each iOS session by confirming access and the remote toolchain:

```bash
make ios-remote-doctor
```

The Mac needs Remote Login, Xcode at `/Applications/Xcode.app` (with its
first-launch tasks complete), Homebrew Node.js 22, and CocoaPods. The command
checks the SSH connection plus Xcode, Node, npm, and CocoaPods before a build.
For read-only investigation, direct SSH is also available:

```bash
ssh -i ~/.ssh/id_ed25519_mac_air skow@ajilus-air.local
```

Use the Make targets from the repository root for normal work:

| Goal | Command |
| --- | --- |
| Check the Mac and tools | `make ios-remote-doctor` |
| Sync sources and install dependencies | `make ios-remote-sync` |
| Build the Debug Simulator app and download it | `make ios-remote-build` |
| Build and launch the configured Simulator | `make ios-remote-run` |
| Verify the downloaded app bundle | `make ios-remote-verify` |
| Collect Xcode, Metro, and Simulator logs | `make ios-remote-logs` |

`ios-remote-build` and `ios-remote-run` already run the doctor, synchronize
the local tree, run `npm ci`, run `pod install`, and build `oth.xcworkspace`.
The resulting Simulator app is downloaded to `artifacts/ios-remote/oth.app`.
The run target starts a dedicated Metro listener on port `8097`; do not use
port `8081`, which is reserved by the neighboring Audestra workspace.

The sync process deliberately preserves Mac-generated `Pods`,
`oth.xcworkspace`, `Podfile.lock`, build output, and local Xcode environment
files. Do not open the bare `.xcodeproj` for CocoaPods builds; use the
generated `oth.xcworkspace` if an Xcode UI session is necessary. Never copy
`.env` files, App Store Connect keys, signing material, or other secrets to the
remote mirror.

The defaults may be overridden for a different machine or remote directory:

```bash
make ios-remote-build IOS_REMOTE_HOST=other-mac.local IOS_REMOTE_USER=other-user
```

Run `make help-ios` for the command summary. TestFlight archives are submitted
by the separate GitHub Actions release workflow described in
[the release process](release-process.md), not by the Simulator build targets.
