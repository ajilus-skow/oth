import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { images, OfficialWordmark } from "../../assets/registry";
import type { RootStackParams } from "../../app/navigation/AppNavigator";
import { Card, PrimaryButton } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import { mobileEnvironment } from "../../config/environment";
import { getMobileRepository } from "../../services/api/mockRepository";

type Navigation = NativeStackNavigationProp<RootStackParams>;
export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const repository = useMemo(() => getMobileRepository(mobileEnvironment.useMockData), []);
  const [hero, setHero] = useState({
    title: "Fresh, wild-caught fish and chips.",
    subtitle: "Brought to your neck of the woods."
  });
  useEffect(() => {
    void repository.bootstrap().then(value => {
      const content =
        value && typeof value === "object" ? (value as { content?: Record<string, unknown> }).content : null;
      if (content && typeof content.heroTitle === "string" && typeof content.heroSubtitle === "string")
        setHero({ title: content.heroTitle, subtitle: content.heroSubtitle });
    });
  }, [repository]);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ImageBackground source={images.photos.truckSide} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.scrim}>
          <View style={styles.wordmark}>
            <OfficialWordmark accessibilityLabel="On The Hook" accessibilityRole="image" height={88} width={160} />
          </View>
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.4} style={styles.heroTitle}>
            {hero.title}
          </Text>
          <Text maxFontSizeMultiplier={1.4} style={styles.heroText}>
            {hero.subtitle}
          </Text>
          <PrimaryButton
            accessibilityLabel="Find a truck near me"
            onPress={() => navigation.navigate("Tabs", { screen: "FindUs" } as never)}
          >
            Find a Truck Near Me
          </PrimaryButton>
        </View>
      </ImageBackground>
      <View style={styles.storySection}>
        <Image source={images.brand.fishLineArt} style={styles.fishDecoration} accessible={false} />
        <Image source={images.brand.friesLineArt} style={styles.friesDecoration} accessible={false} />
        <Text style={styles.eyebrow}>TRADITION WITH A TWIST</Text>
        <Text accessibilityRole="header" style={styles.heading}>
          Why On The Hook
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.story}
          accessibilityLabel="Why On The Hook stories"
        >
          <StoryCard image={images.photos.freshestTaste} title="Line Caught">
            Wild fish caught one at a time for freshness.
          </StoryCard>
          <StoryCard image={images.photos.fishAndChipsEating} title="Hand Battered">
            Prepared fresh at the truck.
          </StoryCard>
          <StoryCard image={images.photos.originalSauces} title="Secret-Recipe Sauces">
            Made in Wyoming to pair with every order.
          </StoryCard>
        </ScrollView>
        <Card style={styles.alertCard}>
          <Text style={styles.storyTitle}>Get notified when we’re coming to your city.</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate("NotificationSettings")}>
            <Text style={styles.link}>Set Up Alerts</Text>
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}

function StoryCard({ children, image, title }: { children: string; image: ImageSourcePropType; title: string }) {
  return (
    <Card style={styles.storyCard}>
      <ImageBackground source={image} style={styles.storyImage} imageStyle={styles.storyImageCrop}>
        <View style={styles.storyScrim}>
          <Text style={styles.storyImageTitle}>{title}</Text>
        </View>
      </ImageBackground>
      <Text style={styles.body}>{children}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, paddingBottom: spacing.screen },
  hero: { justifyContent: "flex-end", minHeight: 350 },
  heroImage: { resizeMode: "cover" },
  scrim: { backgroundColor: "rgba(0,0,0,0.45)", gap: spacing.standard, padding: spacing.screen },
  wordmark: { alignItems: "center" },
  heroTitle: { color: colors.white, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  heroText: { color: colors.white, fontSize: 16, lineHeight: 23 },
  heading: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginHorizontal: spacing.screen
  },
  storySection: {
    backgroundColor: colors.brandYellow,
    gap: spacing.standard,
    overflow: "hidden",
    paddingVertical: spacing.section,
    position: "relative"
  },
  eyebrow: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginHorizontal: spacing.screen
  },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  link: { color: colors.brandBlue, fontSize: 16, fontWeight: "700", minHeight: 44, paddingTop: 10 },
  story: { gap: spacing.standard, paddingHorizontal: spacing.screen },
  storyCard: { gap: spacing.standard, width: 272 },
  storyImage: { height: 152, margin: -spacing.standard, marginBottom: 0, overflow: "hidden" },
  storyImageCrop: { borderTopLeftRadius: 15, borderTopRightRadius: 15, resizeMode: "cover" },
  storyScrim: { backgroundColor: colors.scrim, flex: 1, justifyContent: "flex-end", padding: spacing.standard },
  storyImageTitle: { color: colors.white, fontSize: 22, fontWeight: "800", lineHeight: 28 },
  storyTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", lineHeight: 24 },
  alertCard: { gap: spacing.compact, marginHorizontal: spacing.screen },
  fishDecoration: { height: 96, opacity: 0.22, position: "absolute", right: -18, top: -20, width: 116 },
  friesDecoration: { bottom: -30, height: 128, left: -30, opacity: 0.18, position: "absolute", width: 128 }
});
