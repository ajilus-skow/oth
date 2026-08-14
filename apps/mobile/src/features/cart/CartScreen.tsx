import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { PrimaryButton } from "../../design/primitives";
import { colors, radii, sizes, spacing } from "../../design/tokens";
import { formatUsd } from "../../domain/money";
import { useCart } from "./CartProvider";
import { localOrderSubmissionService } from "./orderSubmission";
import { useRef, useState } from "react";

type Navigation = NativeStackNavigationProp<RootStackParams>;

export function CartScreen({ onSubmit }: { onSubmit?: () => void }) {
  const navigation = useNavigation<Navigation>();
  const {
    add,
    clear,
    clearAndPersist,
    decrement,
    hydrated,
    lines,
    remove,
    storageError,
    subtotalCents,
    totalUnitCount
  } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const submitStarted = useRef(false);
  const submit = async () => {
    if (!hydrated || lines.length === 0 || submitStarted.current) return;
    submitStarted.current = true;
    setSubmitting(true);
    const receipt = localOrderSubmissionService.submit(lines, subtotalCents);
    await clearAndPersist();
    onSubmit?.();
    navigation.replace("OrderConfirmation", { receipt });
  };
  if (!hydrated)
    return (
      <View style={styles.loading}>
        <Text style={styles.body}>Loading your cart…</Text>
      </View>
    );
  if (lines.length === 0) {
    return (
      <View style={styles.empty}>
        <Text accessibilityRole="header" style={styles.title}>
          Your Cart
        </Text>
        <Text style={styles.body}>Your cart is ready for a fresh catch.</Text>
        {storageError ? (
          <Text accessibilityRole="alert" style={styles.storageNotice}>
            {storageError}
          </Text>
        ) : null}
        <PrimaryButton
          accessibilityLabel="Browse menu"
          onPress={() => navigation.navigate("Tabs", { screen: "Menu" } as never)}
        >
          Browse Menu
        </PrimaryButton>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen} testID="cart-screen">
      <Text accessibilityRole="header" style={styles.title}>
        Your Cart
      </Text>
      <Text style={styles.body}>
        {totalUnitCount} item{totalUnitCount === 1 ? "" : "s"} ready to review.
      </Text>
      {storageError ? (
        <Text accessibilityRole="alert" style={styles.storageNotice}>
          {storageError}
        </Text>
      ) : null}
      {lines.map(line => (
        <View key={line.id} style={styles.line} testID={`cart-line-${line.id}`}>
          <View style={styles.lineHeader}>
            <Text style={styles.itemName}>{line.name}</Text>
            <Pressable
              accessibilityLabel={`Remove ${line.name} from cart`}
              accessibilityRole="button"
              onPress={() => remove(line.id)}
            >
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
          <Text style={styles.price}>{formatUsd(line.unitPriceCents)} each</Text>
          <View style={styles.lineFooter}>
            <View style={styles.stepper}>
              <Pressable
                accessibilityLabel={`Remove one ${line.name} from cart`}
                accessibilityRole="button"
                onPress={() => decrement(line.id)}
                style={styles.stepperButton}
                testID={`decrement-cart-line-${line.id}`}
              >
                <Text style={styles.stepperText}>−</Text>
              </Pressable>
              <Text accessibilityLabel={`${line.name} quantity ${line.quantity}`} style={styles.quantity}>
                {line.quantity}
              </Text>
              <Pressable
                accessibilityLabel={`Add one ${line.name} to cart`}
                accessibilityRole="button"
                accessibilityState={{ disabled: line.quantity >= 99 }}
                disabled={line.quantity >= 99}
                onPress={() => add(line.id)}
                style={styles.stepperButton}
                testID={`increment-cart-line-${line.id}`}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.lineTotal}>{formatUsd(line.lineTotalCents)}</Text>
          </View>
        </View>
      ))}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>SUBTOTAL</Text>
        <Text
          accessibilityLabel={`Subtotal ${formatUsd(subtotalCents)}`}
          style={styles.subtotal}
          testID="cart-subtotal"
        >
          {formatUsd(subtotalCents)}
        </Text>
        <Text style={styles.summaryNote}>Taxes, tips, and payment are not part of this prototype.</Text>
      </View>
      <PrimaryButton
        accessibilityLabel="Submit prototype order"
        accessibilityState={{ disabled: submitting }}
        disabled={submitting}
        onPress={submit}
        testID="submit-order"
      >
        {submitting ? "Submitting…" : "Submit Order"}
      </PrimaryButton>
      <Pressable
        accessibilityLabel="Clear cart"
        accessibilityRole="button"
        onPress={() =>
          Alert.alert("Clear your cart?", "This removes all local items.", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear Cart", style: "destructive", onPress: clear }
          ])
        }
        style={styles.clear}
      >
        <Text style={styles.clearText}>Clear Cart</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  empty: { flex: 1, gap: spacing.standard, justifyContent: "center", padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  storageNotice: { color: colors.danger, fontSize: 15, fontWeight: "700", lineHeight: 22 },
  line: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: spacing.compact,
    padding: spacing.standard
  },
  lineHeader: { alignItems: "flex-start", flexDirection: "row", gap: spacing.compact, justifyContent: "space-between" },
  itemName: { color: colors.ink, flex: 1, fontSize: 18, fontWeight: "800", lineHeight: 24 },
  remove: { color: colors.danger, fontSize: 14, fontWeight: "700", minHeight: sizes.minimumTapTarget, paddingTop: 10 },
  price: { color: colors.mutedInk, fontSize: 14 },
  lineFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  stepper: { alignItems: "center", flexDirection: "row", gap: spacing.compact },
  stepperButton: {
    alignItems: "center",
    backgroundColor: colors.brandBlue,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  stepperText: { color: colors.white, fontSize: 24, fontWeight: "700" },
  quantity: { color: colors.ink, fontSize: 17, fontWeight: "800", minWidth: 24, textAlign: "center" },
  lineTotal: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  summary: {
    backgroundColor: colors.brandYellow,
    borderRadius: radii.card,
    gap: spacing.compact,
    padding: spacing.standard
  },
  summaryLabel: { color: colors.brandBlue, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  subtotal: { color: colors.ink, fontSize: 30, fontWeight: "900" },
  summaryNote: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  clear: { alignItems: "center", minHeight: sizes.minimumTapTarget, paddingVertical: 10 },
  clearText: { color: colors.danger, fontSize: 16, fontWeight: "800" }
});
