import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { PrimaryButton, StatusMessage } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import {
  defaultNotificationPreferences,
  currentNotificationPermission,
  loadNotificationPreferences,
  normalizeHomeArea,
  openNotificationSettings,
  requestNotificationPermission,
  saveNotificationPreferences,
  type NotificationPermissionState,
  type NotificationPreferences
} from "../../services/notifications/notificationPreferences";
import { analytics } from "../../analytics/analytics";

const switches: ReadonlyArray<{ key: Exclude<keyof NotificationPreferences, "homeArea">; label: string }> = [
  { key: "scheduledNearby", label: "When a truck is scheduled nearby" },
  { key: "dayBefore", label: "One day before" },
  { key: "morningOf", label: "Morning of the visit" }
];

export function NotificationSetupScreen() {
  const [preferences, setPreferences] = useState(defaultNotificationPreferences);
  const [permission, setPermission] = useState<NotificationPermissionState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadNotificationPreferences().then(setPreferences);
    void currentNotificationPermission().then(setPermission);
  }, []);

  async function enableAlerts() {
    analytics.track({ name: "notification_setup_started" });
    const homeArea = normalizeHomeArea(preferences.homeArea);
    if (!homeArea) {
      setMessage("Enter a city and state, such as Cheyenne, WY, or a ZIP code.");
      return;
    }
    const draft = { ...preferences, homeArea };
    await saveNotificationPreferences(draft);
    setPreferences(draft);
    const nextPermission = await requestNotificationPermission();
    setPermission(nextPermission);
    analytics.track({ name: "notification_permission_result", properties: { result: nextPermission } });
    analytics.track({
      name: "notification_preferences_saved",
      properties: { scheduledNearby: draft.scheduledNearby, dayBefore: draft.dayBefore, morningOf: draft.morningOf }
    });
    setMessage(
      nextPermission === "granted"
        ? "Alerts are ready. We’ll use your selected area to find nearby truck visits."
        : "Alerts are off. You can continue using the app and change this later in Settings."
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        Never miss the truck.
      </Text>
      <Text style={styles.body}>
        Set local reminders for visits you choose. Alerts do not include live schedule updates.
      </Text>
      <Text style={styles.label}>Home area</Text>
      <TextInput
        accessibilityLabel="Home area, city and state or ZIP"
        autoCapitalize="words"
        onChangeText={homeArea => setPreferences(current => ({ ...current, homeArea }))}
        placeholder="City, state, or ZIP"
        style={styles.input}
        value={preferences.homeArea}
      />
      <View style={styles.switches}>
        {switches.map(({ key, label }) => (
          <View key={key} style={styles.switchRow}>
            <Text style={styles.switchLabel}>{label}</Text>
            <Switch
              accessibilityLabel={label}
              onValueChange={value => setPreferences(current => ({ ...current, [key]: value }))}
              trackColor={{ false: colors.border, true: colors.brandBlue }}
              value={preferences[key]}
            />
          </View>
        ))}
      </View>
      {permission === "denied" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notification settings"
          onPress={() => void openNotificationSettings()}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsText}>Open Notification Settings</Text>
        </Pressable>
      ) : (
        <PrimaryButton accessibilityLabel="Enable alerts" onPress={() => void enableAlerts()}>
          Enable Alerts
        </PrimaryButton>
      )}
      {message ? (
        <StatusMessage body={message} title={permission === "granted" ? "Alerts enabled" : "Alert preferences saved"} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  label: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.standard
  },
  switches: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 16, borderWidth: 1 },
  switchRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.standard,
    justifyContent: "space-between",
    minHeight: 64,
    paddingHorizontal: spacing.standard
  },
  switchLabel: { color: colors.ink, flex: 1, fontSize: 16, lineHeight: 23 },
  settingsButton: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  settingsText: { color: colors.brandBlue, fontSize: 16, fontWeight: "700" }
});
