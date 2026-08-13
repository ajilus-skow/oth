# OTH Mobile Agent Rules

These rules apply to `apps/mobile/`.

- Use strict TypeScript and organize UI by product feature under `src/`. Do not
  add a root-level technical `components/` directory.
- Keep `ios/` changes limited to native configuration, native modules, or
  package auto-linking. The app bundle identifier is `com.ajilus.oth`.
- Use `StyleSheet` and safe-area-aware layouts. Preserve iOS accessibility
  labels and stable `testID` values for interactive controls.
- Keep feature behavior in TypeScript and native bootstrapping in iOS Swift.
- iOS builds, Simulator runs, and CocoaPods require macOS with Xcode. From
  Linux, use the configured `ajilus-air.local` workflow via `make help-ios`.

Run proportionate checks from the repository root:

```bash
npm --workspace apps/mobile run lint
npm --workspace apps/mobile test
npm --workspace apps/mobile run build:ios
```
