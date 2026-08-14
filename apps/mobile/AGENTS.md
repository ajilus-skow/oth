# OTH Mobile Agent Rules

These rules apply to `apps/mobile/`.

## Product Guardrails

- Build native React Native screens; never ship the website in a WebView.
- The local-only Menu cart prototype may add bundled, baseline-priced items,
  persist cart intent on-device, and create a local confirmation only. Never
  transmit an order, process payment, add accounts, loyalty, or order history.
  `orderUrl` remains opaque and may only be opened after an explicit user
  action; never crawl or inspect its vendor destination.
- Do not scrape `onthehookfishandchips.com` at runtime. Mobile data comes from
  structured first-party endpoints defined in `docs/mobile/API_CONTRACT.md`.
- Location access is optional and foreground-only. Never request it at launch,
  never request background location, and always provide city, state, and ZIP
  search when permission is unavailable.
- Do not request notification permission at launch. Explain alert value first,
  then request it only after the user chooses **Enable Alerts**.
- Keep API keys, push tokens, precise coordinates, and full external URLs with
  query data out of logs and source control.

## Architecture and Experience

- Use strict TypeScript and organize UI by product feature under `src/`. Do not
  add a root-level technical `components/` directory.
- Use React Navigation for navigation and TanStack Query for server state when
  those capabilities are introduced. Keep maps, calendar, push, and external
  linking behind small native adapters.
- Keep `ios/` changes limited to native configuration, native modules, or
  package auto-linking. The app bundle identifier is `com.ajilus.oth`.
- The native project is iOS-only. Keep TypeScript aligned with the current iOS
  application architecture; do not add or change unsupported native targets.
- Use `StyleSheet` and safe-area-aware layouts. Preserve iOS accessibility
  labels, 44-point minimum tap targets, Dynamic Type support, and stable
  `testID` values for interactive controls.
- Keep feature behavior in TypeScript and native bootstrapping in iOS Swift.
- Detox is the exclusive mobile E2E runner. Use stable `testID` values for
  automated controls and do not add a second mobile E2E framework.
- iOS builds, Simulator runs, and CocoaPods require macOS with Xcode. From
  Linux, read `docs/local-development.md#remote-ios-development-machine`, run
  `make ios-remote-doctor` first, then use the configured `ajilus-air.local`
  workflow via `make help-ios`. Edit locally only: the remote
  `~/on-the-hook-ios-build` checkout is an rsync mirror. Use
  `ios-remote-build` for a Simulator build, `ios-remote-run` to launch it, and
  `ios-remote-logs` for diagnostics; do not copy secrets to the Mac. The only
  permitted remote Simulator is `OTH iPhone 17 Pro`
  (`12276A7B-EAB6-46DB-8C34-5316EAAC6CB8`); never select or modify Audestra's
  Simulator.

## Product Reference Package

- Product content, API, design, analytics, and test specifications live in
  `docs/mobile/`. Treat them as the implementation source of truth.
- Deterministic development fixtures are in `src/fixtures/`; they must pass
  through the same validation boundary as production data and must never
  silently activate in release builds.
- Brand assets are in `src/assets/`. The packaged wordmark is a development
  reference only—replace it with official first-party logo art before release.
- Each Beads issue must meet its stated acceptance criteria and have
  proportionate automated coverage before it is closed.

Run proportionate checks from the repository root:

```bash
npm --workspace apps/mobile run lint
npm --workspace apps/mobile test
npm --workspace apps/mobile run build:ios
```
