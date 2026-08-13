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

Mock the first-party mobile API and verify:

- Home shows nearest upcoming event set
- Find Us search + filter + pagination
- map/list selection synchronization
- event detail and conditional Order Food action
- Add to Calendar payload
- Menu and About remote-content fallback behavior
- push registration/preferences requests
- cached schedule survives network loss

## Required E2E scenarios

Run on at least one current iOS simulator and one current Android emulator in CI/nightly or release gating.

1. **Find by search**
   - launch
   - open Find Us
   - type `West Des Moines, IA`
   - open event
   - verify address/time
   - tap Directions and assert correct external linking intent

2. **Location denied**
   - deny location permission
   - verify no dead end
   - search manually
   - event list remains functional

3. **Order handoff**
   - open event with `orderUrl`
   - tap Order Food
   - assert only an external-link invocation occurred
   - do not automate or inspect vendor destination

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

6. **Offline cache**
   - seed successful events response
   - disable network
   - relaunch
   - show cached data with stale/last-updated indicator

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
- E2E critical flows pass iOS + Android
- official production logo replaces reference logo
- production API base URL configured
- APNs + FCM production credentials configured outside source control
- privacy disclosures match actual location/push behavior
- App Store/Play Store screenshots and metadata reviewed
