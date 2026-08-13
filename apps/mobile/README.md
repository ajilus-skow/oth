# OTH iOS app

Bare React Native TypeScript application for iOS. Its native target and module
name are `oth`; the bundle identifier is `com.ajilus.oth`. Android work is
paused.

```bash
npm install
cd ios && bundle exec pod install
cd ../..
npm run ios -w @ajilus/oth
```

Use `npm run lint -w @ajilus/oth` and `npm test -w @ajilus/oth` for JavaScript
validation. iOS builds require macOS, Xcode, and CocoaPods.

The app ships approved bundled production content for Home copy, Menu, About,
Contact, and More links, so those informational screens do not require a
backend. `src/fixtures/` is reserved for deterministic development/test
schedule data and can only be enabled in development with `OTH_USE_MOCK_DATA=1`.

`OTH_API_BASE_URL` is optional. When configured, its validated bootstrap, menu,
and about responses can override bundled content; unavailable or invalid remote
content falls back to the bundled production provider. Truck schedules remain a
separate dynamic service.
