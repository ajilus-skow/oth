import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { PrimaryButton } from "../../design/primitives";
import { colors, radii, spacing } from "../../design/tokens";
import { formatUsd } from "../../domain/money";

type Navigation = NativeStackNavigationProp<RootStackParams>;

export function OrderConfirmationScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<{
    key: string;
    name: "OrderConfirmation";
    params: RootStackParams["OrderConfirmation"];
  }>();
  const { receipt } = params;
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen} testID="order-confirmation-screen">
      <Text accessibilityRole="header" style={styles.title}>
        Prototype order confirmed
      </Text>
      <Text accessibilityRole="alert" style={styles.notice}>
        No order was transmitted to a restaurant. This is a local prototype confirmation only.
      </Text>
      <View style={styles.receipt}>
        {receipt.lines.map(line => (
          <View key={line.menuItemId} style={styles.line}>
            <View style={styles.lineText}>
              <Text style={styles.itemName}>{line.name}</Text>
              <Text style={styles.detail}>
                {line.quantity} × {formatUsd(line.unitPriceCents)}
              </Text>
            </View>
            <Text style={styles.lineTotal}>{formatUsd(line.lineTotalCents)}</Text>
          </View>
        ))}
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>SUBTOTAL</Text>
          <Text accessibilityLabel={`Submitted subtotal ${formatUsd(receipt.subtotalCents)}`} style={styles.subtotal}>
            {formatUsd(receipt.subtotalCents)}
          </Text>
        </View>
      </View>
      <PrimaryButton
        accessibilityLabel="Back to Menu"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "Tabs", params: { screen: "Menu" } }] })}
        testID="back-to-menu"
      >
        Back to Menu
      </PrimaryButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  notice: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  receipt: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radii.card, borderWidth: 1 },
  line: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.compact,
    justifyContent: "space-between",
    padding: spacing.standard
  },
  lineText: { flex: 1, gap: 2 },
  itemName: { color: colors.ink, fontSize: 16, fontWeight: "800", lineHeight: 22 },
  detail: { color: colors.mutedInk, fontSize: 14 },
  lineTotal: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  subtotalRow: {
    alignItems: "center",
    backgroundColor: colors.brandYellow,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.standard
  },
  subtotalLabel: { color: colors.brandBlue, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  subtotal: { color: colors.ink, fontSize: 24, fontWeight: "900" }
});
