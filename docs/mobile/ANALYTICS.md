# ANALYTICS.md — Privacy-Conscious Event Taxonomy

Analytics are optional but recommended for product health. Do not send precise coordinates, push tokens, email addresses, phone numbers, or full free-text searches unless the analytics policy explicitly permits them.

## Events

- `app_open`
- `tab_viewed` `{tab}`
- `find_search_submitted` `{queryType: city|state|zip|unknown}`
- `find_near_me_tapped`
- `location_permission_result` `{result: granted|denied|restricted}`
- `find_filter_changed` `{filter: state|date}`
- `find_view_changed` `{view: list|map}`
- `truck_event_opened` `{eventId, state}`
- `directions_tapped` `{eventId}`
- `calendar_add_tapped` `{eventId}`
- `order_external_tapped` `{eventId}`
- `menu_category_viewed` `{categoryId}`
- `about_viewed`
- `notification_setup_started`
- `notification_permission_result` `{result}`
- `notification_preferences_saved` `{scheduledNearby, dayBefore, morningOf}`
- `external_link_tapped` `{destination: jobs|store|franchise|privacy|terms}`
- `offline_cache_used` `{resource: events|menu|about|bootstrap}`
- `api_error` `{resource, statusClass}`

## Rules

- Prefer stable event IDs over address strings.
- Do not include `orderUrl` in analytics payloads.
- Do not send raw city/ZIP search strings; classify the search locally and drop raw text.
- Respect any global analytics opt-out required by company policy or platform rules.
