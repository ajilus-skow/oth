# OTH iOS app

Bare React Native TypeScript application for iOS. Its native target and module
name are `oth`; the bundle identifier is `com.ajilus.oth`. The current native
target is iOS only.

```bash
npm install
cd ios && bundle exec pod install
cd ../..
npm run ios -w @ajilus/oth
```

Use `npm run lint -w @ajilus/oth` and `npm test -w @ajilus/oth` for JavaScript
validation. iOS builds require macOS, Xcode, and CocoaPods.

From Linux, build through the configured remote Mac rather than attempting a
local Xcode build. Start with `make ios-remote-doctor`, then use
`make ios-remote-build` or `make ios-remote-run`; the full workflow, mirror
rules, and diagnostics are documented in
[`docs/local-development.md`](../../docs/local-development.md#remote-ios-development-machine).

## Backend-free release data

This release needs no On The Hook backend, API base URL, staging service, or mock
HTTP server. It runs entirely from production resources bundled with the app:

- Home, About, Contact, and More content: `src/content/bootstrap.json`
- Menu content: `src/content/menu.json`
- Schedule snapshot: `src/content/current-schedule.json`

`bundledScheduleService` loads the schedule snapshot and passes it through the
same domain validation boundary as production data. The current snapshot contains
71 events across 17 states, from 2026-08-13 through 2026-08-15. It is a
point-in-time snapshot and does not self-update.

Before a future release, replace `src/content/current-schedule.json` with the
approved snapshot and run `npm test -w @ajilus/oth` to validate it. Rebuild and
redistribute the app for the new schedule to reach customers.

Directions hand off to the device's maps app using the bundled formatted address.
Calendar event creation is local-device functionality based on the bundled date,
hours, venue, and address, and requests access only after the customer taps Add
to Calendar. Notifications are local-device onboarding/preferences only—there
is no server-driven push service in this release. Event-detail ordering remains
an external handoff only when the schedule supplies an explicit safe URL; never
infer one from an `orderNow` flag.

## Local Menu cart prototype

The Menu cart is entirely on-device and works with networking disabled.
Purchasable products and baseline prices come from bundled
`src/content/menu.json`; prices are integer cents and are formatted only for
display. Cart intent is persisted as versioned `oth.cart.v1` data containing
only product IDs, quantities, and an update timestamp. The current bundled
Menu resolves names and prices at display time, so stale saved prices are never
used.

**Submit Order does not place a restaurant order.** It snapshots a local
confirmation receipt, clears the live and persisted cart, and shows an explicit
no-transmission notice. There is no account, store selection, tax, tip,
payment, promo, backend order, kitchen transmission, fulfillment, order
history, status tracking, or provider integration. A future real implementation
would replace `LocalOrderSubmissionService` behind the
`OrderSubmissionService` interface without changing Menu or Cart UI.

Run the local cart unit and component coverage with:

```bash
npm test -w @ajilus/oth -- --runInBand
```

The iOS offline acceptance flows use Detox and are in `e2e/cart.e2e.js`. On a
provisioned iOS Simulator, run:

```bash
npm run test:e2e -w @ajilus/oth
```

They require no API, ordering provider, or network connection. This Linux
checkout cannot run an iOS Simulator; execution uses the configured
remote macOS workflow.

`src/fixtures/` is reserved for deterministic development and test data. It may
only be enabled during development with `OTH_USE_MOCK_DATA=1`; release
configuration always selects bundled production content.
