import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, PrimaryButton, StatusMessage } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import type { TruckEvent } from "../../domain/models";
import { mobileEnvironment } from "../../config/environment";
import { getMobileRepository } from "../../services/api/mockRepository";
import { openDirections } from "../../services/linking/directions";
import { requestForegroundLocation, type ForegroundLocationResult } from "../../services/location/foregroundLocation";
import { groupEventsByLocalDate, localHours } from "./groupEvents";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { analytics, searchQueryType } from "../../analytics/analytics";
import { ResourceState } from "../../design/ResourceState";
import { selectUpcomingEvents } from "./selectEvents";
import type { ScheduleState } from "../../services/api/fakeScheduleService";

export function FindUsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [result, setResult] = useState<ForegroundLocationResult | null>(null);
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [date, setDate] = useState("");
  const [events, setEvents] = useState<TruckEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showingSavedSchedule, setShowingSavedSchedule] = useState(false);
  const [states, setStates] = useState<ScheduleState[]>([]);
  const repository = useMemo(
    () => getMobileRepository(mobileEnvironment.useMockData),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setRefreshing(true);
      void repository
        .events({ query, state: state || undefined, from: date || undefined, to: date || undefined }, controller.signal)
        .then(page => {
          setEvents(selectUpcomingEvents(page.events, new Date()));
          setLastUpdated(page.updatedAt);
          setShowingSavedSchedule(repository.sourceFor("events") === "cache");
          setError(null);
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setError("We couldn’t refresh the schedule. Showing saved results when available.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setRefreshing(false);
        });
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [date, query, repository, state]);

  useEffect(() => {
    void repository
      .states()
      .then(setStates)
      .catch(() => setStates([]));
  }, [repository]);

  async function findNearMe() {
    analytics.track({ name: "find_near_me_tapped" });
    setResult(await requestForegroundLocation());
  }

  const message = !result
    ? null
    : result.ok
      ? "Location found. Nearby truck results will use it when the schedule is available."
      : "Search by city, state, or ZIP instead. Location is optional.";

  const sections = groupEventsByLocalDate(events);
  return (
    <SectionList
      style={styles.screen}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={event => event.eventId}
      ListHeaderComponent={
        <>
          <Text accessibilityRole="header" style={styles.title}>
            Find Us
          </Text>
          <Text style={styles.body}>Find a truck by city, state, or ZIP—or use your location just this once.</Text>
          <TextInput
            accessibilityLabel="Search city state ZIP or host"
            onChangeText={value => {
              setQuery(value);
              analytics.track({ name: "find_search_submitted", properties: { queryType: searchQueryType(value) } });
            }}
            placeholder="City, state, ZIP, or host"
            style={styles.input}
            value={query}
          />
          <View style={styles.filters}>
            <TextInput
              accessibilityLabel="Filter by date"
              onChangeText={value => {
                setDate(value);
                analytics.track({ name: "find_filter_changed", properties: { filter: "date" } });
              }}
              placeholder="YYYY-MM-DD"
              style={styles.dateInput}
              value={date}
            />
            {query || state || date ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setQuery("");
                  setState("");
                  setDate("");
                }}
              >
                <Text style={styles.clear}>Clear</Text>
              </Pressable>
            ) : null}
          </View>
          {states.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stateOptions}>
              {states.map(option => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: state === option.code }}
                  key={option.code}
                  onPress={() => {
                    setState(current => (current === option.code ? "" : option.code));
                    analytics.track({ name: "find_filter_changed", properties: { filter: "state" } });
                  }}
                  style={[styles.stateOption, state === option.code && styles.stateOptionSelected]}
                >
                  <Text style={[styles.stateOptionText, state === option.code && styles.stateOptionTextSelected]}>
                    {option.code}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          <PrimaryButton accessibilityLabel="Find a truck near me" onPress={() => void findNearMe()}>
            Find a Truck Near Me
          </PrimaryButton>
          {message ? <StatusMessage body={message} title={result?.ok ? "Nearby search" : "Search instead"} /> : null}
          {error ? <StatusMessage title="Schedule unavailable" body={error} /> : null}
          {showingSavedSchedule ? (
            <ResourceState
              kind="stale"
              title="Showing saved schedule"
              body={
                lastUpdated
                  ? `Last updated ${new Date(lastUpdated).toLocaleString()}.`
                  : "Refresh when online for the latest schedule."
              }
            />
          ) : null}
          {refreshing ? <Text style={styles.muted}>Refreshing schedule…</Text> : null}
        </>
      }
      renderSectionHeader={({ section }) => (
        <Text accessibilityRole="header" style={styles.date}>
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => (
        <EventCard event={item} onDetails={() => navigation.navigate("EventDetail", { eventId: item.eventId })} />
      )}
      ListEmptyComponent={
        !refreshing ? (
          <StatusMessage title="No truck visits found" body="Try another city, state, ZIP, or date." />
        ) : undefined
      }
    />
  );
}

function EventCard({ event, onDetails }: { event: TruckEvent; onDetails: () => void }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.city}>
        {event.city}, {event.state}
      </Text>
      <Text style={styles.host}>{event.hostName}</Text>
      <Text style={styles.body}>
        {localHours(event)} · {event.address1}
      </Text>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onDetails}>
          <Text style={styles.link}>Details</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void openDirections(event)}>
          <Text style={styles.link}>Directions</Text>
        </Pressable>
        {event.orderUrl ? (
          <Pressable accessibilityRole="button">
            <Text style={styles.link}>Order Food</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  input: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12 },
  filters: { flexDirection: "row", alignItems: "center", gap: spacing.compact },
  dateInput: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    flex: 1,
    padding: 12
  },
  clear: { color: colors.brandBlue, fontWeight: "700" },
  stateOptions: { gap: spacing.compact },
  stateOption: {
    borderColor: colors.brandBlue,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  stateOptionSelected: { backgroundColor: colors.brandBlue },
  stateOptionText: { color: colors.brandBlue, fontWeight: "700" },
  stateOptionTextSelected: { color: colors.white },
  muted: { color: colors.mutedInk },
  date: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: spacing.standard },
  card: { gap: spacing.compact },
  city: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  host: { color: colors.ink, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.standard },
  link: { color: colors.brandBlue, fontWeight: "700" }
});
