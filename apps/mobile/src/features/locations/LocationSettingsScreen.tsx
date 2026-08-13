import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../design/tokens";
import { locationPermissionState, openLocationSettings } from "../../services/location/foregroundLocation";

export function LocationSettingsScreen() {
  const [status, setStatus] = useState("Checking location permission…");
  useEffect(() => {
    void locationPermissionState().then(result =>
      setStatus(
        result.ok
          ? "Location access is available while using the app."
          : "Location is off. You can still search by city, state, or ZIP."
      )
    );
  }, []);
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        Location Settings
      </Text>
      <Text style={styles.body}>{status}</Text>
      <Pressable accessibilityRole="button" onPress={() => void openLocationSettings()} style={styles.button}>
        <Text style={styles.buttonText}>Open iOS Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1, gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  button: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.brandBlue,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.standard
  },
  buttonText: { color: colors.brandBlue, fontSize: 16, fontWeight: "700" }
});
