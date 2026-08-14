# Backend-free final acceptance

## Release architecture

The mobile release is self-contained. Production Home, Menu, About, Contact,
and More content is bundled in the application, and Find Us/Event Detail use
the supplied `apps/mobile/src/content/current-schedule.json` snapshot. There is
no OTH API base URL, staging provider, remote override, mock HTTP provider,
web scraper, real checkout, payment provider, or server-driven push dependency
in the release path. The Menu does include a bundled, local-only cart
prototype; it never transmits a restaurant order.

Development fixtures require an explicit development build. `mobileEnvironment`
has no release-selectable remote setting, and the production repository always
uses bundled content.

## Accepted customer flows

- Home, Menu, About, More, and Contact render from bundled production content.
- Find Us searches the bundled snapshot; `Johnstown` is a verified known event.
- Event Detail hands the bundled address to the OS maps app.
- Add to Calendar creates a local-device calendar draft from the bundled venue,
  date, hours, and address, with permission recovery via Settings.
- Notification onboarding stores local preferences and requests permission only
  after an explicit customer action; this release has no server push claim.
- An `orderNow` availability flag never creates an order destination. Ordering
  is shown only for an explicit safe external URL.
- Menu cart additions, edits, and clearing happen entirely on-device. The
  shared `CartProvider` uses a reducer and persists only `{ menuItemId,
quantity }` intent under the versioned `oth.cart.v1` key. Names and integer
  cent prices are always re-resolved from `src/content/menu.json`.
- Submit Order calls `LocalOrderSubmissionService`, snapshots an in-memory
  receipt, clears live and saved cart intent, and displays “Prototype order
  confirmed” plus “No order was transmitted to a restaurant.” A future real
  integration replaces that service behind `OrderSubmissionService`; it must
  not be embedded in Menu or Cart UI.
- The prototype has no account, store selection, tax, tip, payment, promo,
  backend order, kitchen transmission, fulfillment, order history, status
  tracking, or ordering-provider integration.

## Verification evidence

- `npm --workspace apps/mobile test -- --runInBand src/features/backendFreeFlows.integration.test.tsx` — passed (4 tests).
- `make lint` — passed.
- `npm --workspace apps/mobile test -- --runInBand` — passed (33 suites, 68 tests),
  including cart domain, persistence, component, navigation, and shared-store
  integration coverage.
- `npm --workspace apps/mobile run lint` — passed.
- `git diff --check` — passed.

The offline cart E2E definition is the iOS Detox suite in
`apps/mobile/e2e/cart.e2e.js`. It covers add/edit,
badge, cart, local confirmation, post-submit clearing, cold relaunch, and
pre-submit restoration without a backend. It was not executed in this Linux
environment because an iOS Simulator is unavailable; this does not affect the
backend-free unit/component/integration verification above. Run them on a provisioned iOS
Simulator with `npm run test:e2e -w @ajilus/oth`.

## Release review boundaries

The release includes the packaged iOS app icon assets and uses foreground
location only when requested, contextual calendar write access only after the
calendar action, and no background location permission. Store metadata and
screenshots must continue to describe the bundled-snapshot, local-notification
release accurately when they are prepared outside this repository.

`npm audit --workspace apps/mobile --omit=dev --audit-level=critical` reports
no critical findings. Existing transitive high advisories are documented in the
security review Bead; its automated force-fix would select an incompatible
React Native downgrade, so it was not applied.
