# DESIGN.md — On The Hook Mobile

## Information architecture

Bottom tabs:

1. **Home**
2. **Find Us**
3. **Menu**
4. **More**

About is reached from Home and More. Notifications/location settings live under More. This keeps the permanent navigation centered on the high-frequency customer jobs.

## Brand tokens

The exact release values should be reconciled with the company's official brand guide. The values below were sampled from the packaged wordmark reference and are sufficient for implementation until first-party tokens are supplied.

```ts
export const colors = {
  brandBlue: '#0382C8',
  brandYellow: '#FDC756',
  white: '#FFFFFF',
  offWhite: '#EFF1ED',
  ink: '#10212A',
  mutedInk: '#53636B',
  border: '#D9E1E5',
  success: '#16794B',
  warning: '#9A6500',
  danger: '#B42318',
  scrim: 'rgba(0,0,0,0.40)',
};
```

### Spacing

Use a 4-point base grid.

- screen horizontal padding: 20
- compact gap: 8
- standard gap: 12/16
- section gap: 28/32
- card padding: 16/20
- button height: 52 minimum
- card radius: 16
- pill radius: 999

### Typography

Use a bold condensed/display face only if the official brand font is licensed and available in the repository. Otherwise use the platform/system font for production rather than shipping an unlicensed look-alike. Suggested hierarchy:

- Display: 34/40, 800
- H1: 30/36, 800
- H2: 24/30, 800
- H3: 20/26, 700
- Body: 16/23, 400
- Body strong: 16/23, 700
- Caption: 13/18, 500
- Button: 16/20, 700

## App shell

- Yellow or white top region depending on screen context.
- Bottom tab bar is native-feeling, safe-area aware, and uses blue for selected state.
- Use SF Symbols-compatible semantic icons on iOS and equivalent Material-style symbols on Android, behind a shared icon abstraction.
- Avoid decorative shadows everywhere; use subtle borders/elevation only to separate interactive cards from background.

## Home

### Hero

Use `assets/photos/truck-side.jpg` or `meal-truck.jpg` as the hero image with a dark lower scrim where text overlays.

Content:

- official wordmark/logo
- “Fresh, wild-caught fish and chips.”
- “Brought to your neck of the woods.”
- secondary: “Strict seafood standards. Beloved taste.”
- primary CTA: **Find a Truck Near Me**

If location has not been requested yet, the CTA navigates to Find Us; Find Us then explains location access contextually.

### Coming Near You

Show up to 3 next relevant events. Priority:

1. events within 75 miles if location is authorized;
2. events within user's saved home area;
3. otherwise a prompt to choose city/ZIP/state.

Truck event card:

- date badge (`TODAY`, `TOMORROW`, or localized short date)
- city/state
- host/location name
- serving hours
- distance when known
- Directions button
- Details button

### Brand-story cards

Horizontal snap carousel with three cards:

- Line Caught
- Hand Battered
- Secret-Recipe Sauces

Use `freshest-taste.jpg`, `fish-and-chips-eating.jpg`, and `original-sauces.jpg`.

### Notification CTA

Card: “Get notified when we're coming to your city.” Button: **Set Up Alerts**.

## Find Us

### Header controls

- Search field: “City, state, or ZIP”
- Near Me affordance
- Date filter (default: next available / upcoming)
- State filter populated by API
- segmented list/map toggle

Filters persist for the session; list/map preference persists across launches.

### List mode

Virtualized list grouped by local event date. Each event row/card shows:

- city/state + host
- formatted local hours
- full address
- distance when known
- actions: Details, Directions
- optional Order Food tertiary action only when `orderUrl` exists

No “Order Food” button should dominate discovery. Finding the truck remains primary.

### Map mode

- Render pins only for events with valid coordinates.
- Fit viewport to visible results with reasonable max zoom.
- Selected pin shows a compact bottom sheet/card with city, host, date/time, directions/details actions.
- Selecting a list result then switching to map centers that event.
- Cluster markers when the mapping library supports it without unstable custom code.

### Event detail

Sections:

1. City/state and host
2. Date + serving hours
3. Address
4. Actions: Get Directions, Add to Calendar
5. Menu preview with View Full Menu
6. External Order Food button if available

Opening Order Food uses the system browser (or a safe in-app browser if already standardized) and never attempts to inspect the destination.

## Menu

Sticky category tabs: **Entrees / Sides / Drinks**.

Card style:

- item title
- description
- optional packaged image when appropriate
- do not show price unless current location-valid pricing is returned from a trusted first-party endpoint

Base informational menu content lives in `fixtures/menu.json` and should be replaced by API data in production.

## About

A visual editorial scroll:

1. **Sea to table. Hook and line, one fish at a time.**
2. “Over a decade in business.” + “About 10 million meals of fish and chips served and counting.”
3. **Know where your food comes from.**
4. Four benefits: Fresher, Higher Quality, More Sustainable, Kinder
5. **Two Oceans. One Standard.**
6. Sauces
7. Hand-battered
8. Secret-recipe beer batter
9. Closing service/community statement

Suggested images: `ship.jpg`, `freshest-taste.jpg`, `original-sauces.jpg`, `service-window.jpg`, `customer-truck.jpg`.

## More

Rows:

- About On The Hook
- Contact Us
- Jobs ↗
- On The Hook Store ↗
- Franchise Opportunities ↗
- Notification Settings
- Location Settings
- Privacy Policy ↗
- Terms & Conditions ↗

Use an external-link glyph for web handoffs.

## Contact

Native informational screen:

- email: `info@onthehookfishandchips.com`
- phone: `307-316-4665`
- buttons: Email Us, Call Us

Use `mailto:` and `tel:` only after user tap.

## Notifications

Pre-permission screen:

**Never miss the truck.**

“Tell us where you'd like to hear about On The Hook visits.”

Fields:

- Home area (city/state or ZIP; required before subscribing)
- switches:
  - When a truck is scheduled nearby
  - One day before
  - Morning of the visit

Primary: **Enable Alerts**

On tap:
1. persist preference draft;
2. request OS notification permission;
3. if granted, register push token and subscriptions;
4. if denied, show Settings guidance without nagging.

Do not request continuous/background location.

## Loading/empty/error states

Every API-backed screen needs:

- initial skeleton
- pull-to-refresh where natural
- no-results state with clear filter reset
- retryable error state
- offline cached state showing “Last updated …”
- no-location-permission state that immediately offers search instead

## Motion

- Keep transitions subtle and native.
- Respect Reduce Motion.
- No autoplay video in v1.
- Hero image parallax is optional and must be disabled with Reduce Motion.
