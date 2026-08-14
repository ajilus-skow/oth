# OTH Mobile — Backend-Free Release Correction

## Production data model

This release requires **no first-party backend**.

- Static app content: bundled production resources.
- Schedule: bundled `on-the-hook-current-schedule` JSON supplied by the project owner.
- Current schedule snapshot: **71 events**, **17 states**, **2026-08-13 through 2026-08-15**.
- Directions: OS maps handoff using the bundled formatted address.
- Calendar: local calendar event creation from bundled date/hours/address.
- Notifications: local-device onboarding/reminders based only on bundled schedule data.
- Ordering: external only, and only when an explicit safe order URL exists. The current schedule snapshot contains an `orderNow` availability flag but no order URL, so the app must not invent one.
- No runtime website scraping.
- No bootstrap/menu/about/schedule API.
- No staging or mock HTTP service required by release acceptance.
- No server-driven push requirement.

## Important limitation

The bundled schedule is a snapshot. It does not self-update. After **2026-08-15**, a future release must replace the bundled schedule data (or a separate future project can introduce a live data-delivery mechanism).

## Remaining bead sequence

1. `oth-mobile.37` — wire bundled-only production data and integration tests.
2. `oth-mobile.42` — document backend-free release model. Can run in parallel with `.37`.
3. `oth-mobile.38` — E2E after `.37`.
4. `oth-mobile.43` — release review after `.38` and `.42`.
5. `oth-mobile.44` — final acceptance after `.43`.
