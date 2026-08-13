import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { externalDestinations } from "../../config/externalDestinations";
import { colors, spacing } from "../../design/tokens";
import { openExternalUrl } from "../../services/linking/externalLinks";
import { analytics } from "../../analytics/analytics";

type Navigation = NativeStackNavigationProp<RootStackParams>;

type MoreRow =
  { label: string; route: Exclude<keyof RootStackParams, "Tabs" | "EventDetail"> } | { label: string; url: string };

export const moreRows: readonly MoreRow[] = [
  { label: "About On The Hook", route: "About" },
  { label: "Contact Us", route: "Contact" },
  { label: "Jobs", url: externalDestinations.jobs },
  { label: "On The Hook Store", url: externalDestinations.store },
  { label: "Franchise Opportunities", url: externalDestinations.franchise },
  { label: "Notification Settings", route: "NotificationSettings" },
  { label: "Location Settings", route: "LocationSettings" },
  { label: "Privacy Policy", url: externalDestinations.privacy },
  { label: "Terms & Conditions", url: externalDestinations.terms }
];

export function MoreScreen() {
  const navigation = useNavigation<Navigation>();

  async function openWeb(url: string, destination: "jobs" | "store" | "franchise" | "privacy" | "terms") {
    analytics.track({ name: "external_link_tapped", properties: { destination } });
    const result = await openExternalUrl(url, "web");
    if (!result.ok) Alert.alert("Link unavailable", result.message);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        More
      </Text>
      <Text style={styles.description}>Account-free ways to stay connected with On The Hook.</Text>
      <View style={styles.list}>
        {moreRows.map(row => {
          const external = "url" in row;
          return (
            <Pressable
              accessibilityHint={external ? "Opens externally" : undefined}
              accessibilityLabel={external ? `${row.label}, opens externally` : row.label}
              accessibilityRole="button"
              key={row.label}
              onPress={() =>
                external
                  ? void openWeb(
                      row.url,
                      row.label === "Jobs"
                        ? "jobs"
                        : row.label === "On The Hook Store"
                          ? "store"
                          : row.label === "Franchise Opportunities"
                            ? "franchise"
                            : row.label === "Privacy Policy"
                              ? "privacy"
                              : "terms"
                    )
                  : navigation.navigate(row.route)
              }
              style={styles.row}
            >
              <Text style={styles.rowText}>{row.label}</Text>
              <Text accessibilityElementsHidden accessibilityLabel={undefined} style={styles.chevron}>
                {external ? "↗" : "›"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  description: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  list: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 16, borderWidth: 1 },
  row: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: spacing.standard
  },
  rowText: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: "600", lineHeight: 23 },
  chevron: { color: colors.brandBlue, fontSize: 22, marginLeft: spacing.standard }
});
