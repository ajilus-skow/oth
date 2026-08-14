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
to Calendar. Notifications are local-device
onboarding/preferences only—there is no server-driven push service in this
release. Ordering is an external handoff only when the schedule supplies an
explicit safe URL; never infer one from an `orderNow` flag.

`src/fixtures/` is reserved for deterministic development and test data. It may
only be enabled during development with `OTH_USE_MOCK_DATA=1`; release
configuration always selects bundled production content.
