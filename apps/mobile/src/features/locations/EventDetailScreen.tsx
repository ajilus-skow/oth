import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { Card, PrimaryButton } from "../../design/primitives";
import { ResourceState } from "../../design/ResourceState";
import { colors, spacing } from "../../design/tokens";
import type { TruckEvent } from "../../domain/models";
import { mobileEnvironment } from "../../config/environment";
import { getMobileRepository } from "../../services/api/mockRepository";
import { openDirections } from "../../services/linking/directions";
import { openExternalUrl, validateExternalUrl } from "../../services/linking/externalLinks";
import { formatEventTime } from "./selectEvents";
import { analytics } from "../../analytics/analytics";
type Navigation = NativeStackNavigationProp<RootStackParams>;
export function EventDetailScreen() {
  const navigation = useNavigation<Navigation>(); const { params } = useRoute<RouteProp<RootStackParams, "EventDetail">>();
  const repository = useMemo(() => getMobileRepository(mobileEnvironment.useMockData, mobileEnvironment.apiBaseUrl), []);
  const [event, setEvent] = useState<TruckEvent | null>(null); const [failed, setFailed] = useState(false);
  const load = () => { setFailed(false); void repository.events({ limit: 250 }).then(page => setEvent(page.events.find(item => item.eventId === params.eventId) ?? null)).catch(() => setFailed(true)); };
  useEffect(load, [params.eventId, repository]);
  if (failed) return <ResourceState kind="error" onRetry={load} />;
  if (!event) return <ResourceState kind="loading" />;
  const active = event.status !== "canceled";
  const orderUrl = event.orderUrl;
  const eventId = event.eventId;
  async function order() { if (!orderUrl) return; analytics.track({ name: "order_external_tapped", properties: { eventId } }); const result = await openExternalUrl(orderUrl, "web"); if (!result.ok) Alert.alert("Ordering unavailable", result.message); }
  return <ScrollView contentContainerStyle={styles.content} style={styles.screen}><Text accessibilityRole="header" style={styles.title}>{event.city}, {event.state}</Text><Text style={styles.host}>{event.hostName}</Text><Card style={styles.card}><Text style={styles.body}>{formatEventTime(event)}</Text><Text style={styles.body}>{[event.address1, event.address2, `${event.city}, ${event.state} ${event.postalCode ?? ""}`].filter(Boolean).join(", ")}</Text>{event.status !== "scheduled" ? <Text style={styles.status}>{event.status === "canceled" ? "This visit has been canceled." : "This visit has been rescheduled."}</Text> : null}</Card>{active ? <View style={styles.actions}><PrimaryButton accessibilityLabel="Get directions" onPress={() => void openDirections(event)}>Get Directions</PrimaryButton><Pressable accessibilityRole="button" onPress={() => Alert.alert("Calendar", "Calendar support will be available in a future update.")}><Text style={styles.link}>Add to Calendar</Text></Pressable>{event.orderUrl && validateExternalUrl(event.orderUrl, "web") ? <Pressable accessibilityRole="button" onPress={() => void order()}><Text style={styles.link}>Order Food ↗</Text></Pressable> : null}</View> : null}<Card style={styles.card}><Text style={styles.host}>Menu</Text><Text style={styles.body}>See our informational menu before you visit.</Text><Pressable accessibilityRole="button" onPress={() => navigation.navigate("Tabs", { screen: "Menu" } as never)}><Text style={styles.link}>View Full Menu</Text></Pressable></Card></ScrollView>;
}
const styles = StyleSheet.create({ screen: { backgroundColor: colors.offWhite, flex: 1 }, content: { gap: spacing.standard, padding: spacing.screen }, title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 }, host: { color: colors.ink, fontSize: 20, fontWeight: "700", lineHeight: 26 }, card: { gap: spacing.compact }, body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 }, status: { color: colors.danger, fontSize: 16, fontWeight: "700" }, actions: { gap: spacing.standard }, link: { color: colors.brandBlue, fontSize: 16, fontWeight: "700", minHeight: 44, paddingTop: 10 } });
