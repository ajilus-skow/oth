# Backend-free final acceptance

## Release architecture

The mobile release is self-contained. Production Home, Menu, About, Contact,
and More content is bundled in the application, and Find Us/Event Detail use
the supplied `apps/mobile/src/content/current-schedule.json` snapshot. There is
no OTH API base URL, staging provider, remote override, mock HTTP provider, web
scraper, native cart, checkout flow, or server-driven push dependency in the
release path.

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

## Verification evidence

- `npm --workspace apps/mobile test -- --runInBand src/features/backendFreeFlows.integration.test.tsx` — passed (4 tests).
- `make lint` — passed.
- `make test` — passed (23 suites, 44 tests).
- `git diff --check` — passed.
- `make ios-remote-verify` — passed; verified `artifacts/ios-remote/oth.app`.

The iOS remote workflow is the available native validation environment. Android
native work and an Android emulator runner are paused, so Android execution is
documented as deferred rather than treated as a backend failure. The critical
flow definitions remain platform-neutral in
`apps/mobile/src/features/backendFreeFlows.integration.test.tsx` and are ready
to run on an Android runner when one is available.

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
