# API_CONTRACT.md — Public Mobile Read API

The app must not scrape website HTML. Provide a small, unauthenticated, read-oriented first-party JSON API. If equivalent structured endpoints already exist, adapt the app to those endpoints rather than duplicating them.

Suggested base path:

`/public/mobile/v1`

All timestamps use ISO 8601. Truck events also include an IANA timezone.

## GET /bootstrap

Purpose: app-config/content bootstrap that can be cached for 24 hours.

```json
{
  "schemaVersion": 1,
  "minimumSupportedAppVersion": null,
  "links": {
    "jobs": "https://onthehookfishandchips.com/jobs",
    "store": "https://onthehookoutfitters.com/",
    "franchise": "https://franchiseonthehook.com/",
    "privacy": "https://onthehookfishandchips.com/privacy-policy",
    "terms": "https://onthehookfishandchips.com/terms-and-conditions",
    "contactEmail": "info@onthehookfishandchips.com",
    "contactPhone": "+13073164665"
  },
  "content": {
    "heroTitle": "Fresh, wild-caught fish and chips.",
    "heroSubtitle": "Brought to your neck of the woods.",
    "heroSupporting": "Strict seafood standards. Beloved taste."
  }
}
```

## GET /menu

```json
{
  "updatedAt": "2026-08-13T12:00:00Z",
  "categories": [
    {
      "id": "entrees",
      "name": "Entrees",
      "items": [
        {
          "id": "fish-and-chips",
          "name": "Fish & Chips",
          "description": "...",
          "imageKey": "fish-and-chips-plate",
          "price": null,
          "currency": null
        }
      ]
    }
  ]
}
```

Price is optional and must be omitted/null unless it is valid for the context the app displays.

## GET /states

Returns only states with upcoming events inside the server's normal schedule horizon.

```json
{
  "states": [
    {"code":"IA","name":"Iowa"},
    {"code":"WY","name":"Wyoming"}
  ]
}
```

## GET /events

Query parameters:

- `from=YYYY-MM-DD` optional
- `to=YYYY-MM-DD` optional
- `state=IA` optional
- `q=city|state|zip|host` optional
- `lat=...&lng=...&radiusMiles=75` optional; only when the user explicitly enabled location
- `limit` default 100, max 250
- `cursor` optional

Response:

```json
{
  "updatedAt": "2026-08-13T15:10:00Z",
  "nextCursor": null,
  "events": [
    {
      "eventId": "evt_20260815_wdm_lowes",
      "truckId": null,
      "city": "West Des Moines",
      "state": "IA",
      "hostName": "Lowe's",
      "address1": "1700 50th St",
      "address2": null,
      "postalCode": "50266",
      "latitude": 41.572,
      "longitude": -93.77,
      "timezone": "America/Chicago",
      "startsAt": "2026-08-15T11:00:00-05:00",
      "endsAt": "2026-08-15T19:00:00-05:00",
      "orderUrl": "https://...",
      "status": "scheduled"
    }
  ]
}
```

Rules:

- Return stable `eventId`.
- Normalize inconsistent time formatting at the server boundary.
- Exclude canceled events by default, or return `status: canceled` when the UI needs to surface a cancellation.
- Provide latitude/longitude from the scheduling source or server-side geocoding cache; do not force the mobile app to geocode every address.
- `orderUrl` is opaque. The mobile app never follows it until user tap.

## GET /about

Structured blocks are preferable to raw HTML.

```json
{
  "updatedAt":"2026-08-13T12:00:00Z",
  "hero":"Sea to table. Hook and line, one fish at a time.",
  "stats":[
    {"label":"Over a decade in business."},
    {"label":"About 10 million meals of fish and chips served and counting."}
  ],
  "sections":[
    {"id":"fresher","title":"Fresher","body":"...","imageKey":"freshest-taste"}
  ]
}
```

## POST /push/devices

No user account required.

Request:

```json
{
  "installationId": "uuid-generated-on-device",
  "platform": "ios",
  "pushToken": "opaque-token",
  "appVersion": "1.0.0",
  "locale": "en-US",
  "timezone": "America/Chicago"
}
```

Response:

```json
{"deviceId":"pushdev_..."}
```

Do not log the raw push token.

## PUT /push/devices/{deviceId}/preferences

```json
{
  "homeArea": {
    "city": "Des Moines",
    "state": "IA",
    "postalCode": null,
    "latitude": null,
    "longitude": null,
    "radiusMiles": 50
  },
  "alerts": {
    "scheduledNearby": true,
    "dayBefore": true,
    "morningOf": false
  }
}
```

The home area may be represented by normalized city/state or ZIP without storing precise device GPS coordinates.

## DELETE /push/devices/{deviceId}

Removes push registration/preferences on notification disable/reset.

## Caching/HTTP

- Send `ETag` and/or `Last-Modified` for bootstrap, menu, about, states, and events.
- Honor conditional requests.
- Suggested cache:
  - bootstrap/about/menu: 24 hours
  - states/events: 15 minutes while online
- API failures must not wipe a previously successful cached payload.

## Backend notification job

A scheduled server process compares upcoming truck events against device home-area subscriptions and enqueues only the user's selected alert types. Requirements:

- idempotency key per `deviceId + eventId + alertType`
- canceled/rescheduled visits update or suppress notifications
- do not send duplicate “scheduled nearby” alerts each time the schedule feed refreshes
- respect local event timezone for “day before” and “morning of” timing
- handle invalid/unregistered push tokens by disabling/removing them
