# TEST_PLAN.md — On The Hook Mobile

## Test pyramid

### Unit

Cover:

- event date/time formatting using event timezone
- distance formatting and nearby sorting
- filter serialization/deserialization
- home-area preference validation
- external URL allow-list validation
- menu/category transformations
- notification preference state machine
- cache stale/fresh selection

### Component/UI

Cover all reusable components in important states:

- TruckEventCard
- MenuItemCard
- BrandStoryCard
- SearchField
- FilterChip/StatePicker/DatePicker
- Loading skeletons
- Offline/stale banner
- Error/empty states
- notification pre-permission card

### Integration

Use the release-selected bundled production content and verify:

- Home, Menu, About, More, and Contact render with no API base URL
- Find Us manual search/filter reaches a known bundled event
- Event Detail exposes directions and calendar mapping from bundled data
- Order Food is omitted when an event has no explicit safe order URL
- notification onboarding requests permission only after an explicit tap

## Required E2E scenarios

The critical suite is implemented as platform-neutral React Native integration
tests in `apps/mobile/src/features/backendFreeFlows.integration.test.tsx`, so it
does not start or expect a backend, staging service, mock HTTP server, website
scraper, or server-driven push provider. Run it on every available platform
runner. The current iOS simulator build is validated through the configured
remote macOS workflow; Android native work and its emulator runner are paused.

1. **Find by search**
   - launch
   - open Find Us
   - type `Johnstown`
   - open event
   - verify address/time
   - tap Directions and assert correct external linking intent

2. **Location denied**
   - deny location permission
   - verify no dead end
   - search manually
   - event list remains functional

3. **Safe order boundary**
   - open a bundled event with `actionsAvailable.orderNow` but no explicit URL
   - assert Order Food is absent
   - do not infer or inspect a vendor destination

4. **Menu**
   - switch Entrees/Sides/Drinks
   - verify expected items
   - verify no fabricated prices

5. **Notification onboarding**
   - open Set Up Alerts
   - select home area
   - tap Enable Alerts
   - assert OS prompt occurs only after explicit tap
   - handle granted and denied variants

6. **Calendar handoff**
   - open a bundled event
   - tap Add to Calendar
   - assert the local event payload contains its date, hours, venue, and address
   - verify denied access offers Settings recovery

7. **External destinations**
   - Jobs, Store, Franchise, Privacy, Terms invoke expected HTTPS URLs
   - Contact invokes correct `mailto:` and `tel:` actions

## Accessibility

Automate where tooling permits, then manually verify:

- VoiceOver and TalkBack reading order
- meaningful labels for map/list controls and external links
- 44x44 minimum target sizes
- Dynamic Type/font scaling at accessibility sizes
- no clipping of CTA labels
- color contrast at WCAG AA target for text/control states
- Reduce Motion behavior

## Visual QA

Reference widths:

- 320 pt narrow iPhone
- 393 pt mainstream iPhone
- 430 pt large iPhone
- small Android ~360 dp
- mainstream Android ~412 dp

Verify both light appearance and any platform system settings that affect text contrast. The branded app may remain light-first; do not create an unreviewed dark theme merely because the OS is dark.

## Performance budgets

- list interactions should remain responsive with 250 events
- image assets should be resized/compressed for actual display size
- avoid decoding full-resolution photography when thumbnails suffice
- no synchronous bulk geocoding
- no background location polling
- no WebViews loading entire site pages as app screens

## Release gate

- typecheck/lint/tests pass
- backend-free critical flows pass on every available platform runner
- iOS simulator build artifact passes the remote macOS workflow
- Android validation is deferred while Android native work is paused
- packaged app icon assets are present
- privacy disclosures match actual location/push behavior
- App Store/Play Store screenshots and metadata reviewed
