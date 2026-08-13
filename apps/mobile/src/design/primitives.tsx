import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, sizes, spacing } from "./tokens";

export function AppScreen({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.screen}>{children}</SafeAreaView>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={styles.sectionHeader}>
      {children}
    </Text>
  );
}

export function PrimaryButton({ children, accessibilityLabel, ...props }: PropsWithChildren<PressableProps>) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={styles.primaryButton}
      {...props}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function StatusMessage({ title, body }: { title: string; body: string }) {
  return (
    <View accessibilityRole="alert" style={styles.status}>
      <Text style={styles.statusTitle}>{title}</Text>
      <Text style={styles.statusBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offWhite, paddingHorizontal: spacing.screen },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.standard
  },
  sectionHeader: { color: colors.ink, fontSize: 24, fontWeight: "800", lineHeight: 30 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brandBlue,
    borderRadius: radii.card,
    justifyContent: "center",
    minHeight: sizes.primaryButtonHeight,
    paddingHorizontal: spacing.standard
  },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: "700", lineHeight: 20 },
  status: { gap: spacing.compact, padding: spacing.standard },
  statusTitle: { color: colors.ink, fontSize: 20, fontWeight: "700" },
  statusBody: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 }
});
