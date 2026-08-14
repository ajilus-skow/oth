# On The Hook Mobile App — Revenue & Customer Experience Feature Ideas

## Objective

Design mobile features that help On The Hook Fish & Chips:

1. Increase revenue.
2. Increase repeat visits.
3. Improve customer convenience.
4. Reduce missed visits caused by customers not knowing when a truck is nearby.
5. Improve route and demand intelligence.
6. Build a direct customer relationship independent of social media or website traffic.

The strongest opportunity is unique to On The Hook's mobile-truck model: customers often want the product but do not know when a truck will be near them. The app should turn that uncertainty into a repeatable loop:

**Discover → Remind → Visit/Order → Return**

## Priority Summary

| Priority | Feature | Revenue Impact | Customer Impact | Complexity |
|---|---|---:|---:|---:|
| P0 | Smart truck notifications | Very high | Very high | Medium |
| P0 | Nearby/upcoming truck finder | High | Very high | Low |
| P0 | One-tap ordering handoff | High | High | Low |
| P0 | Favorite locations/cities | High | High | Low |
| P1 | Loyalty/rewards | Very high | High | Medium |
| P1 | App-exclusive offers | High | Medium | Medium |
| P1 | Bring OTH Here demand signal | High | High | Medium |
| P1 | Visit / "I'm Coming" signal | High | High | Medium |
| P1 | Catering / large-order leads | High | High | Low |
| P2 | Referral program | Medium-high | Medium | Medium |
| P2 | Share an upcoming truck | Medium | High | Low |
| P2 | Personalized reminders | High | High | Medium |
| P2 | Menu favorites / reorder | Medium | High | Low |
| P2 | Order status integration | Medium | Very high | Medium-high |
| P3 | Group ordering | High | High | High |
| P3 | Truck passport / gamification | Medium | Medium | Medium |

# 1. Smart "Truck Is Coming" Notifications

This is likely the single most valuable app feature.

Instead of generic marketing pushes, notifications should be tied to a specific scheduled stop and a customer's location or preferences.

Example:

> **On The Hook will be 3.2 miles from you tomorrow**
> Lowe's — West Des Moines
> 11 AM–7 PM
> **View Location · Order**

Customers should be able to configure:

- Home location.
- Work location.
- Favorite cities.
- Favorite specific venues/stops.
- Notification radius: 5, 10, 25, or 50 miles.
- Day-before notification.
- Same-day notification.
- "Truck is now open" notification.

### Personalization

Avoid sending every nearby event to every user.

```text
Customer usually visits:
- West Des Moines
- Urbandale
- Clive

OTH is coming to West Des Moines Saturday.

→ Send high-relevance push
```

This should increase conversion while reducing notification fatigue.

# 2. Follow Locations, Cities, and Areas

Allow customers to follow a venue or location:

**♡ Notify me whenever OTH returns here**

Examples:

- Lowe's — West Des Moines.
- Tractor Supply — local town.
- Favorite city.
- Home radius.

The app automatically watches future schedules and alerts the customer when a matching stop appears.

# 3. Nearby and Upcoming Truck Finder

Users should immediately see:

- Nearby stops.
- Distance.
- Date.
- Serving hours.
- Venue.
- Address.
- Directions.
- Order availability.
- Add to calendar.
- Share.

Useful controls:

- Near Me.
- Search city or ZIP.
- State selector.
- Date selector.
- List/map toggle.

The mobile experience should prioritize device location instead of forcing customers through a long state-by-state schedule.

# 4. One-Tap Ordering Handoff

Do not rebuild the ordering system initially.

The app should deep-link customers directly from a specific scheduled stop to that stop's correct ordering destination.

Desired flow:

```text
App event → correct order page
```

Avoid:

```text
App
 ↓
Website
 ↓
Find location
 ↓
Pick event
 ↓
Ordering site
```

The app should treat the order URL as an external handoff while making the path to it as short as possible.

# 5. Loyalty / Rewards

A simple loyalty program has strong repeat-visit potential.

```text
OTH Hooks

86 Hooks

██████████████░░░

14 more until your next reward
```

Possible earning model:

- 1 point / Hook per $1 spent.

Possible rewards:

- Free drink.
- Free side.
- $5 off.
- Free cod cake.
- Upgrade.
- Eventually a free entree.

The program should not be overly generous. The goal is to increase repeat purchase frequency, not give away excessive margin.

If Square already tracks customers and purchases, investigate integrating with existing Square customer/order APIs instead of building an independent transaction ledger.

# 6. Strategic App-Only Promotions

Do not turn the app into a permanent coupon dispenser.

Use promotions to influence specific customer behavior.

### Slow location

> **We're in Laramie until 7 PM**
> Show this app offer for a free drink with an entree today.

### Lapsed customer

> **It's been a while.**
> OTH is back in your area Friday.
> $3 off your order.

### New market

> **First time in Ames!**
> App users get a free side today.

Promotions should be targeted, limited, measurable, and designed around incremental visits.

# 7. "Bring On The Hook Here"

This could be particularly valuable because OTH is mobile.

```text
BRING OTH TO MY TOWN

Your location:
Grimes, Iowa

[ Request a Visit ]
```

Internally, OTH could see demand such as:

```text
Requested markets

Grimes, IA            384
Ankeny, IA            297
Indianola, IA         163
Boone, IA             141
```

This turns the app into route-planning and demand-intelligence infrastructure.

Once a visit is scheduled, notify the requesting users:

> **You asked. They're coming.**
> On The Hook will be in Grimes on August 29.

# 8. "I'm Coming" / Visit Interest

Each scheduled stop could include:

**👍 I'M COMING**

This creates useful demand forecasting.

```text
West Des Moines
Saturday

184 interested
96 likely customers
Historical conversion: 61%

Expected demand: ~59 orders
```

Over time this could assist with:

- Staffing.
- Food preparation.
- Truck inventory.
- Route selection.
- Scheduling.
- Hours.

# 9. Catering and Large-Order Lead Capture

This may be one of the highest-dollar features relative to implementation cost.

Provide a prominent **Feed a crowd?** flow:

```text
Event type:
- Corporate lunch
- Church event
- School event
- Wedding
- Community event
- Private party

Approximate guests:
[ 75 ]

Date:
[ September 12 ]

Location:
[ Des Moines, IA ]

[ REQUEST OTH ]
```

One converted event may be worth many normal transactions.

# 10. Location-Aware Proximity Reminders

With appropriate permission:

> **On The Hook is serving 1.1 miles away until 7 PM.**

Recommended suppression rules:

- Maximum one proximity notification per event.
- Respect quiet hours.
- Do not notify after the user already ordered.
- Reduce frequency for repeatedly dismissed notifications.
- Allow users to disable proximity reminders separately.

# 11. Share an Upcoming Truck

Each event should expose the native Share action.

Example:

> On The Hook Fish & Chips is at Lowe's in West Des Moines this Saturday, 11 AM–7 PM.

The shared link should deep-link directly to that event in the app, with a web fallback if the recipient does not have the app.

# 12. Referral Program

Once identity and transaction attribution are reliable:

**Give $5, Get $5**

A referral reward should become valid only after:

- A new verified customer is created.
- The customer's first qualifying purchase occurs.
- The order meets a minimum transaction threshold.
- The payment settles.
- Abuse rules are satisfied.

Do not offer unlimited rewards for account creation alone.

# 13. Favorite Menu Items

Allow users to favorite menu items.

```text
♡ Fish & Chips
♥ Cod Cakes
♡ Chowder
```

This enables future personalization:

> Your favorite Cod Cakes are available at the West Des Moines truck Saturday.

Longer-term, an **Order My Usual** action could send customers into the existing ordering flow with a configured basket if the ordering API supports it.

# 14. Order Status

If the Square integration exposes sufficient real-time information:

```text
ORDER #4821

✓ Received
✓ Preparing
● Almost ready
○ Ready for pickup
```

Benefits:

- Better customer experience.
- Lower perceived wait time.
- Less crowding around the truck.
- Fewer "Is my order ready?" questions.

Only implement this if the backend can provide reliable status.

# 15. Wait-Time Indicator

Potential later feature:

```text
West Des Moines

Open until 7 PM

Current pickup estimate:
~18 minutes
```

Do not fake wait times with weak heuristics. Incorrect estimates are worse than providing none.

# 16. Add to Calendar

Each scheduled stop should support native calendar creation.

```text
On The Hook Fish & Chips
Saturday 11 AM–7 PM
Lowe's — West Des Moines
1700 50th St
```

This allows the user's phone to become an additional reminder channel.

# 17. Schedule Watch

When there are no nearby stops:

```text
No On The Hook stops are currently scheduled near you.

[ NOTIFY ME WHEN ONE IS ADDED ]
```

Users can subscribe to:

- A city.
- ZIP code.
- Radius.
- Specific venue.
- State.

# 18. Schedule Change and Cancellation Alerts

Operational changes should trigger immediate customer notifications.

Examples:

> **Schedule change**
> Today's Ames stop will now open at noon.

> **Canceled**
> Today's Ames stop has been canceled.

> **New location**
> The truck has moved to a different serving location.

This prevents customers from driving to a location based on stale schedule information.

# 19. Weather-Aware Operations

Weather itself does not need to become a major app feature.

The valuable use case is using weather and operations data to support:

- Severe weather closures.
- Delayed openings.
- Early closings.
- Location moves.

Notify customers only when weather materially changes OTH operations.

# 20. Sold-Out / Availability Notices

If inventory data becomes reliable:

```text
West Des Moines

Fish & Chips       Available
Cod Cakes          Sold Out
Chowder            Low availability
```

Only implement this with dependable inventory synchronization.

# 21. Seasonal and Limited-Time Items

The app can highlight limited products:

```text
LIMITED THIS WEEK

Bacon Clam Chowder

Available while supplies last.
```

Notifications can create urgency:

> Chowder is back this weekend.

Use limited-time items to create incremental visits without flooding users with generic advertising.

# 22. Truck Passport / Gamification

This is a lower-priority retention feature.

```text
YOUR OTH PASSPORT

Iowa        ✓
Nebraska    ✓
Colorado    ✓
Wyoming     ○

3 states
12 stops visited
```

Possible milestones:

- 5 visits.
- 10 visits.
- 5 unique locations.
- 3 states.
- First visit to a new market.

Occasional rewards can reinforce the behavior.

# 23. Group Ordering

A later-stage feature could support:

- Coworkers.
- Family.
- Church groups.
- Schools.
- Community events.

Example flow:

```text
Start Group Order
     ↓
Share invite link
     ↓
Each person adds items
     ↓
Organizer reviews
     ↓
Submit combined order
```

This has strong revenue potential but requires deeper integration with ordering, payments, limits, cutoff times, and fulfillment.

# Recommended Roadmap

## Phase 1 — Make the App Worth Installing

1. Nearby trucks.
2. Upcoming schedule.
3. Smart location notifications.
4. Favorite city/location.
5. Schedule-change notifications.
6. Menu.
7. Direct ordering handoff.
8. Directions.
9. Add to calendar.
10. Share stop.

### Goal

Make the app the easiest way to answer:

> Where is On The Hook, when will it be near me, and how do I get food?

## Phase 2 — Make the App Produce Incremental Revenue

1. Loyalty.
2. App-targeted promotions.
3. Catering/event lead capture.
4. Bring OTH Here.
5. I'm Coming / demand signal.
6. Referral system.

### Goal

Increase:

- Repeat purchase frequency.
- Customer lifetime value.
- New-market demand visibility.
- Catering revenue.
- Organic customer acquisition.

## Phase 3 — Deep Operational Integration

1. Transaction-aware personalization.
2. Order status.
3. Reorder favorites / Order My Usual.
4. Wait-time estimates.
5. Inventory / sold-out status.
6. Group ordering.
7. Advanced route-demand analytics.

### Goal

Connect the customer-facing app directly to operations and make customer behavior useful for forecasting and routing.

# Top Three Strategic Features

## 1. Location-Aware Schedule Notifications

The largest likely lost-sale scenario is:

> "I would have gone if I'd known they were here."

Solve that first.

## 2. Purchase-Linked Loyalty

This increases repeat visit frequency and creates an identifiable customer relationship.

It also provides the foundation for:

- Personalized promotions.
- Referrals.
- Visit history.
- Customer segmentation.
- Reordering.

## 3. Bring OTH Here + I'm Coming

This may have the most interesting long-term strategic value.

Because OTH is mobile, the app can eventually help answer:

> **Where should the trucks go?**

rather than merely:

> **Where are the trucks going?**

The combination of:

- Requested markets.
- Customer home areas.
- Favorite locations.
- I'm Coming signals.
- Actual orders.
- Historical event performance.

could eventually produce a valuable route-demand model for deciding where trucks should serve.

# Product Principle

The mobile app should not simply reproduce the website.

Its strongest value comes from capabilities a website cannot deliver as effectively:

- Knowing where the customer is.
- Remembering which locations matter to them.
- Proactively notifying them when OTH is nearby.
- Creating direct loyalty and purchase relationships.
- Capturing geographic demand.
- Sending operational schedule changes immediately.
- Making repeat purchasing easier.

The app should become the customer's persistent connection to On The Hook, and over time it should also become a source of operational intelligence for OTH.
