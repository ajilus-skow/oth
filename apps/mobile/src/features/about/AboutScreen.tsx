import { useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text } from "react-native";
import { images } from "../../assets/registry";
import { Card } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import { analytics } from "../../analytics/analytics";

const sections = [
  [
    "Know where your food comes from.",
    "Our Wild Alaskan Cod and Patagonian Merluza are line caught. Never caught in a net.",
    images.photos.ship
  ],
  [
    "Two Oceans. One Standard.",
    "Carefully handled fish from Alaska and Patagonia, selected for freshness and quality.",
    images.photos.freshestTaste
  ],
  [
    "Hand-battered, right in front of you.",
    "We never use pre-battered fish. Our secret-recipe sauces are made in Wyoming.",
    images.photos.serviceWindow
  ],
  [
    "Serving communities near and far.",
    "We proudly serve people who appreciate quality, integrity, and value.",
    images.photos.customerTruck
  ]
] as const;
export function AboutScreen() {
  useEffect(() => {
    analytics.track({ name: "about_viewed" });
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        Sea to table. Hook and line, one fish at a time.
      </Text>
      <Text style={styles.stat}>Over a decade in business.</Text>
      <Text style={styles.stat}>About 10 million meals of fish and chips served and counting.</Text>
      {sections.map(([title, body, source]) => (
        <Card key={title} style={styles.card}>
          <Image source={source} style={styles.image} />
          <Text accessibilityRole="header" style={styles.heading}>
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  stat: { color: colors.brandBlue, fontSize: 18, fontWeight: "700", lineHeight: 26 },
  card: { gap: spacing.standard },
  image: { borderRadius: 10, height: 180, width: "100%" },
  heading: { color: colors.ink, fontSize: 22, fontWeight: "800", lineHeight: 28 },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 }
});
