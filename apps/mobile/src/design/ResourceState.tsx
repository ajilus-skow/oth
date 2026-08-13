import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "./tokens";

export type ResourceStateKind = "loading" | "error" | "empty" | "stale";
export const resourceStateCopy: Record<ResourceStateKind, { title: string; body: string }> = {
  loading: { title: "Loading…", body: "Getting the latest On The Hook information." },
  error: { title: "Unable to refresh", body: "Check your connection and try again." },
  empty: { title: "Nothing to show yet", body: "Try changing your search or check back soon." },
  stale: { title: "Showing saved information", body: "This content was saved from an earlier visit." }
};
export function ResourceState({ kind, onRetry, title, body }: { kind: ResourceStateKind; onRetry?: () => void; title?: string; body?: string }) {
  const copy = { ...resourceStateCopy[kind], title, body };
  return <View accessibilityRole={kind === "error" ? "alert" : undefined} style={styles.container}><Text style={styles.title}>{copy.title}</Text><Text style={styles.body}>{copy.body}</Text>{onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Try Again</Text></Pressable> : null}</View>;
}
const styles = StyleSheet.create({ container: { gap: spacing.compact, padding: spacing.standard }, title: { color: colors.ink, fontSize: 20, fontWeight: "700" }, body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 }, retry: { alignSelf: "flex-start", justifyContent: "center", minHeight: 44 }, retryText: { color: colors.brandBlue, fontSize: 16, fontWeight: "700" } });
