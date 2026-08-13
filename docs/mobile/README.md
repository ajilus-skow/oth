# On The Hook Mobile App Implementation Package

This package is a build handoff for a polished React Native customer app for On The Hook Fish & Chips, targeting iOS and Android from one codebase.

## Current platform scope

The iOS application is the active delivery target. Android work is paused, so
Android-specific implementation, validation, and release requirements in this
handoff are deferred until that work resumes. Shared TypeScript should remain
portable, but no Android native project is currently maintained.

## Product scope

The app is intentionally focused on the customer-facing information and navigation that matters on mobile:

- Home with brand story, nearby/upcoming truck teaser, and a strong Find a Truck CTA.
- Find Us with Near Me, city/ZIP/state/date filtering, list/map toggle, truck-event details, directions, calendar handoff, and external ordering handoff.
- Menu with Entrees, Sides, and Drinks.
- About with line-caught sourcing, sustainability, hand-battering, sauces, and brand photography.
- More with Contact, Jobs, Store, Franchise, notification/location settings, Privacy Policy, and Terms.
- Push notifications for upcoming truck visits near a user's chosen home area.

## Explicit non-goals for v1

- Do not implement a native ordering cart or checkout.
- Do not crawl, reverse-engineer, or reproduce third-party ordering/vendor flows.
- Do not create customer accounts, loyalty, rewards, payment methods, or order history.
- Do not scrape the production website HTML at runtime.
- Do not hardcode a long state-by-state schedule into the app.

`Order Food` is an external URL handoff supplied by the truck-event API. Store, Franchise, Jobs application flow, Privacy Policy, and Terms are also external web handoffs unless a structured first-party endpoint already exists.

## Package contents

- `oth-mobile-app-beads.jsonl` — dependency-ordered implementation backlog for Beads.
- `AGENTS.md` — primary coding-agent instructions.
- `.cursor/rules/oth-mobile.mdc` — Cursor-specific reinforcement of the same guardrails.
- `specs/DESIGN.md` — screen architecture, components, tokens, behavior, and responsive rules.
- `specs/CONTENT.md` — production copy and content mapping.
- `specs/API_CONTRACT.md` — required first-party public mobile API contract.
- `specs/TEST_PLAN.md` — unit, integration, E2E, accessibility, and release checks.
- `specs/ANALYTICS.md` — privacy-conscious event taxonomy.
- `fixtures/*.json` — deterministic dev/test content.
- `assets/` — downloaded brand/reference imagery plus source manifest.

## Import

```bash
bd import --input oth-mobile-app-beads.jsonl
```

The JSONL uses minimal Beads dependency records (`issue_id`, `depends_on_id`, `type`) and deliberately avoids dependency metadata objects.

## Asset warning

The photography and line-art files in `assets/` were directly served by the On The Hook website/CDN during research. `assets/brand/oth-wordmark-reference.jpeg` is a reference copy from a public franchise listing because the research tooling did not expose the site's production logo binary directly. Replace that file with the official first-party SVG/PNG from the company's brand repository before App Store/Play Store release. Do not trace/redraw the logo when official art is available.

## Implementation principle

The mobile app must feel native and fast. It is not a WebView wrapper. Shared React Native code should be the default, with small platform-specific adapters only where native OS behavior differs (maps, permissions, calendar, notification settings, external-link handling).
