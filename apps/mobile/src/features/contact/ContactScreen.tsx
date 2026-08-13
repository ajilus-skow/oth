import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import bootstrap from "../../content/bootstrap.json";
import { Card, PrimaryButton, StatusMessage } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import { openExternalUrl, validateExternalUrl } from "../../services/linking/externalLinks";

const fallbackContact = {
  email: "info@onthehookfishandchips.com",
  phone: "+13073164665"
};

export const contactDetails = {
  email: validateExternalUrl(`mailto:${bootstrap.links.contactEmail}`, "email")
    ? bootstrap.links.contactEmail
    : fallbackContact.email,
  phone: validateExternalUrl(`tel:${bootstrap.links.contactPhone}`, "phone")
    ? bootstrap.links.contactPhone
    : fallbackContact.phone
};

function displayPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1")
    ? `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
    : value;
}

export function ContactScreen() {
  async function openContact(value: string, kind: "email" | "phone") {
    const result = await openExternalUrl(`${kind === "email" ? "mailto" : "tel"}:${value}`, kind);
    if (!result.ok) Alert.alert("Contact unavailable", result.message);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        Contact Us
      </Text>
      <Text style={styles.description}>
        Questions, feedback, or a great truck-visit story? We’d love to hear from you.
      </Text>
      <Card style={styles.card}>
        <Text style={styles.label}>EMAIL</Text>
        <Text selectable style={styles.value}>
          {contactDetails.email}
        </Text>
        <PrimaryButton
          accessibilityLabel="Email On The Hook"
          onPress={() => void openContact(contactDetails.email, "email")}
        >
          Email Us
        </PrimaryButton>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.label}>PHONE</Text>
        <Text selectable style={styles.value}>
          {displayPhone(contactDetails.phone)}
        </Text>
        <PrimaryButton
          accessibilityLabel="Call On The Hook"
          onPress={() => void openContact(contactDetails.phone, "phone")}
        >
          Call Us
        </PrimaryButton>
      </Card>
      <StatusMessage title="We’ll connect you safely" body="Email and calling only open after you choose an action." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  description: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  card: { gap: spacing.standard },
  label: { color: colors.mutedInk, fontSize: 13, fontWeight: "700", letterSpacing: 0.6 },
  value: { color: colors.ink, fontSize: 20, fontWeight: "700", lineHeight: 28 }
});
