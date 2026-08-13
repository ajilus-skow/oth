# OTH iOS app

Bare React Native TypeScript application for iOS. Its native target and module
name are `oth`; the bundle identifier is `com.ajilus.oth`.

```bash
npm install
cd ios && bundle exec pod install
cd ../..
npm run ios -w @ajilus/oth
```

Use `npm run lint -w @ajilus/oth` and `npm test -w @ajilus/oth` for JavaScript
validation. iOS builds require macOS, Xcode, and CocoaPods.
