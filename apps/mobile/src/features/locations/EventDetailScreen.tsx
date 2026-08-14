import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { Card, PrimaryButton } from "../../design/primitives";
import { ResourceState } from "../../design/ResourceState";
import { images } from "../../assets/registry";
import { colors, radii, sizes, spacing } from "../../design/tokens";
import type { TruckEvent } from "../../domain/models";
import { mobileEnvironment } from "../../config/environment";
import { getMobileRepository } from "../../services/api/mockRepository";
import { openDirections } from "../../services/linking/directions";
import { openExternalUrl, validateExternalUrl } from "../../services/linking/externalLinks";
import { addCalendarEvent } from "../../services/calendar/nativeCalendar";
import { calendarEventFromTruckVisit } from "../../services/calendar/calendarEvent";
import { formatEventTime } from "./selectEvents";
import { analytics } from "../../analytics/analytics";
import {
  cancelLocalReminder,
  hasLocalReminder,
  localRemindersSupported,
  scheduleLocalReminder
} from "../../services/notifications/localReminders";
type Navigation = NativeStackNavigationProp<RootStackParams>;
export function EventDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<RootStackParams, "EventDetail">>();
  const repository = useMemo(() => getMobileRepository(mobileEnvironment.useMockData), []);
  const [event, setEvent] = useState<TruckEvent | null>(null);
  const [failed, setFailed] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const load = () => {
    setFailed(false);
    void repository
      .events({ limit: 250 })
      .then(page => setEvent(page.events.find(item => item.eventId === params.eventId) ?? null))
      .catch(() => setFailed(true));
  };
  useEffect(load, [params.eventId, repository]);
  useEffect(() => {
    void hasLocalReminder(params.eventId).then(setHasReminder);
  }, [params.eventId]);
  if (failed) return <ResourceState kind="error" onRetry={load} />;
  if (!event) return <ResourceState kind="loading" />;
  const currentEvent = event;
  const active = currentEvent.status !== "canceled";
  const orderUrl = currentEvent.orderUrl;
  const eventId = currentEvent.eventId;
  async function order() {
    if (!orderUrl) return;
    analytics.track({ name: "order_external_tapped", properties: { eventId } });
    const result = await openExternalUrl(orderUrl, "web");
    if (!result.ok) Alert.alert("Ordering unavailable", result.message);
  }
  async function addToCalendar() {
    try {
      await addCalendarEvent(calendarEventFromTruckVisit(currentEvent));
      analytics.track({ name: "calendar_added", properties: { eventId } });
      Alert.alert("Added to Calendar", "This truck visit is now on your calendar.");
    } catch (error) {
      Alert.alert(
        "Calendar unavailable",
        error instanceof Error ? error.message : "We couldn’t add this visit to your calendar.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => void Linking.openSettings() }
        ]
      );
    }
  }
  async function toggleReminder() {
    try {
      if (hasReminder) await cancelLocalReminder(currentEvent.eventId);
      else await scheduleLocalReminder(currentEvent);
      setHasReminder(value => !value);
    } catch (error) {
      Alert.alert("Reminder unavailable", error instanceof Error ? error.message : "We couldn’t update this reminder.");
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <Image accessible={false} source={images.brand.fishLineArt} style={styles.fishDecoration} />
        <Text style={styles.eyebrow}>YOUR NEXT TRUCK STOP</Text>
        <Text accessibilityRole="header" maxFontSizeMultiplier={1.35} style={styles.title}>
          {event.city}, {event.state}
        </Text>
        <Text maxFontSizeMultiplier={1.35} style={styles.host}>
          {event.hostName}
        </Text>
      </View>
      <Card style={styles.visitCard}>
        <Text style={styles.cardLabel}>WHEN &amp; WHERE</Text>
        <Text style={styles.time}>{formatEventTime(event)}</Text>
        <View style={styles.rule} />
        <Text style={styles.address}>{event.address1}</Text>
        {event.address2 ? <Text style={styles.address}>{event.address2}</Text> : null}
        <Text style={styles.address}>
          {event.city}, {event.state} {event.postalCode ?? ""}
        </Text>
        {event.status !== "scheduled" ? (
          <View accessibilityRole="alert" style={styles.statusBanner}>
            <Text style={styles.status}>
              {event.status === "canceled" ? "This visit has been canceled." : "This visit has been rescheduled."}
            </Text>
          </View>
        ) : null}
      </Card>
      {active ? (
        <View style={styles.actions}>
          <PrimaryButton accessibilityLabel="Get directions" onPress={() => void openDirections(event)}>
            Get Directions
          </PrimaryButton>
          <View style={styles.secondaryActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add to Calendar"
              onPress={() => void addToCalendar()}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionLabel}>PLAN AHEAD</Text>
              <Text style={styles.secondaryActionText}>Add to Calendar</Text>
            </Pressable>
            {localRemindersSupported() ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={hasReminder ? "Remove visit reminder" : "Set visit reminder"}
                onPress={() => void toggleReminder()}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionLabel}>DON'T MISS IT</Text>
                <Text style={styles.secondaryActionText}>{hasReminder ? "Remove Reminder" : "Set Reminder"}</Text>
              </Pressable>
            ) : null}
          </View>
          {event.orderUrl && validateExternalUrl(event.orderUrl, "web") ? (
            <Pressable
              accessibilityHint="Opens the ordering website"
              accessibilityLabel="Order food, opens externally"
              accessibilityRole="button"
              onPress={() => void order()}
              style={styles.orderAction}
            >
              <Text style={styles.orderActionText}>Order Food ↗</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={styles.menuCallout}>
        <Image accessible={false} source={images.brand.friesLineArt} style={styles.friesDecoration} />
        <Text style={styles.menuEyebrow}>COME HUNGRY</Text>
        <Text accessibilityRole="header" style={styles.menuTitle}>
          Fresh, wild-caught fish and chips.
        </Text>
        <Text style={styles.menuBody}>Browse the informational menu before you visit the truck.</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View full menu"
          onPress={() => navigation.navigate("Tabs", { screen: "Menu" } as never)}
          style={styles.menuLink}
        >
          <Text style={styles.menuLinkText}>View Full Menu</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, paddingBottom: spacing.section },
  hero: {
    backgroundColor: colors.brandYellow,
    gap: spacing.compact,
    minHeight: 212,
    overflow: "hidden",
    padding: spacing.screen,
    paddingTop: spacing.section
  },
  fishDecoration: {
    bottom: -42,
    height: 180,
    opacity: 0.2,
    position: "absolute",
    right: -45,
    transform: [{ rotate: "-12deg" }],
    width: 250
  },
  eyebrow: { color: colors.brandBlue, fontSize: 13, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.ink, fontSize: 34, fontWeight: "900", lineHeight: 40, maxWidth: "88%" },
  host: { color: colors.ink, fontSize: 20, fontWeight: "700", lineHeight: 26, maxWidth: "82%" },
  visitCard: { gap: spacing.compact, marginHorizontal: spacing.screen, padding: spacing.standard },
  cardLabel: { color: colors.brandBlue, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  time: { color: colors.ink, fontSize: 21, fontWeight: "800", lineHeight: 28 },
  rule: { backgroundColor: colors.border, height: 1, marginVertical: 2 },
  address: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  statusBanner: {
    backgroundColor: "#FDECEA",
    borderRadius: radii.card,
    marginTop: spacing.compact,
    padding: spacing.compact
  },
  status: { color: colors.danger, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  actions: { gap: spacing.compact, paddingHorizontal: spacing.screen },
  secondaryActions: { flexDirection: "row", gap: spacing.compact },
  secondaryAction: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.primaryButtonHeight + 18,
    padding: spacing.compact
  },
  secondaryActionLabel: { color: colors.brandBlue, fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  secondaryActionText: { color: colors.ink, fontSize: 15, fontWeight: "800", lineHeight: 20, marginTop: 2 },
  orderAction: { alignItems: "center", minHeight: sizes.minimumTapTarget, paddingVertical: 10 },
  orderActionText: { color: colors.brandBlue, fontSize: 16, fontWeight: "800" },
  menuCallout: {
    backgroundColor: colors.brandBlue,
    gap: spacing.compact,
    marginTop: spacing.compact,
    minHeight: 220,
    overflow: "hidden",
    padding: spacing.screen
  },
  friesDecoration: { bottom: -55, height: 220, opacity: 0.2, position: "absolute", right: -30, width: 180 },
  menuEyebrow: { color: colors.brandYellow, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  menuTitle: { color: colors.white, fontSize: 28, fontWeight: "900", lineHeight: 34, maxWidth: "82%" },
  menuBody: { color: colors.white, fontSize: 16, lineHeight: 23, maxWidth: "76%" },
  menuLink: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandYellow,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    minHeight: sizes.minimumTapTarget,
    paddingHorizontal: spacing.standard,
    justifyContent: "center"
  },
  menuLinkText: { color: colors.ink, fontSize: 15, fontWeight: "900" }
});
