import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { images, OfficialWordmark } from "../../assets/registry";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { Card, PrimaryButton } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import type { TruckEvent } from "../../domain/models";
import { mobileEnvironment } from "../../config/environment";
import { getMobileRepository } from "../../services/api/mockRepository";
import { localHours } from "../locations/groupEvents";
import { selectUpcomingEvents } from "../locations/selectEvents";
import { ResourceState } from "../../design/ResourceState";

type Navigation = NativeStackNavigationProp<RootStackParams>;
export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const repository = useMemo(
    () => getMobileRepository(mobileEnvironment.useMockData, mobileEnvironment.apiBaseUrl),
    []
  );
  const [events, setEvents] = useState<TruckEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => {
    setLoading(true);
    void repository
      .events({ limit: 3 })
      .then(page => {
        setEvents(selectUpcomingEvents(page.events, new Date()).slice(0, 3));
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, [repository]);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ImageBackground source={images.photos.truckSide} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.scrim}>
          <OfficialWordmark accessibilityLabel="On The Hook" accessibilityRole="image" height={88} width={160} />
          <Text accessibilityRole="header" style={styles.heroTitle}>
            Fresh, wild-caught fish and chips.
          </Text>
          <Text style={styles.heroText}>Brought to your neck of the woods.</Text>
          <PrimaryButton
            accessibilityLabel="Find a truck near me"
            onPress={() => navigation.navigate("Tabs", { screen: "FindUs" } as never)}
          >
            Find a Truck Near Me
          </PrimaryButton>
        </View>
      </ImageBackground>
      <Text accessibilityRole="header" style={styles.heading}>
        Coming Near You
      </Text>
      {loading ? (
        <ResourceState kind="loading" />
      ) : error && !events.length ? (
        <ResourceState kind="error" onRetry={load} />
      ) : events.length ? (
        events.map(event => (
          <Card key={event.eventId} style={styles.event}>
            <Text style={styles.city}>
              {event.city}, {event.state}
            </Text>
            <Text style={styles.body}>
              {event.hostName} · {localHours(event)}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("EventDetail", { eventId: event.eventId })}
            >
              <Text style={styles.link}>Details</Text>
            </Pressable>
          </Card>
        ))
      ) : (
        <ResourceState
          kind="empty"
          title="Choose an area"
          body="Search by city, state, or ZIP to see upcoming visits."
        />
      )}
      <Text accessibilityRole="header" style={styles.heading}>
        Why On The Hook
      </Text>
      <View style={styles.story}>
        <Card style={styles.storyCard}>
          <Text style={styles.storyTitle}>Line Caught</Text>
          <Text style={styles.body}>Wild fish caught one at a time for freshness.</Text>
        </Card>
        <Card style={styles.storyCard}>
          <Text style={styles.storyTitle}>Hand Battered</Text>
          <Text style={styles.body}>Prepared fresh at the truck.</Text>
        </Card>
      </View>
      <Card style={styles.alertCard}>
        <Text style={styles.storyTitle}>Get notified when we’re coming to your city.</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate("NotificationSettings")}>
          <Text style={styles.link}>Set Up Alerts</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, paddingBottom: spacing.screen },
  hero: { height: 350, justifyContent: "flex-end" },
  heroImage: { resizeMode: "cover" },
  scrim: { backgroundColor: "rgba(0,0,0,0.45)", gap: spacing.standard, padding: spacing.screen },
  heroTitle: { color: colors.white, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  heroText: { color: colors.white, fontSize: 16, lineHeight: 23 },
  heading: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginHorizontal: spacing.screen,
    marginTop: spacing.standard
  },
  event: { gap: spacing.compact, marginHorizontal: spacing.screen },
  city: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  link: { color: colors.brandBlue, fontSize: 16, fontWeight: "700", minHeight: 44, paddingTop: 10 },
  story: { flexDirection: "row", gap: spacing.standard, paddingHorizontal: spacing.screen },
  storyCard: { flex: 1, gap: spacing.compact },
  storyTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", lineHeight: 24 },
  alertCard: { gap: spacing.compact, marginHorizontal: spacing.screen }
});
