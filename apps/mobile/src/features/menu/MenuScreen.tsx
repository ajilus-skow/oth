import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import menu from "../../content/menu.json";
import { images } from "../../assets/registry";
import { Card } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import { analytics } from "../../analytics/analytics";
import { mobileEnvironment } from "../../config/environment";
import { getMobileRepository } from "../../services/api/mockRepository";

type ImageKey = "fish-and-chips-plate" | "freshest-taste";
const menuImages: Record<ImageKey, ReturnType<typeof require>> = {
  "fish-and-chips-plate": images.photos.fishAndChipsPlate,
  "freshest-taste": images.photos.freshestTaste
};

export function MenuScreen() {
  const repository = useMemo(() => getMobileRepository(mobileEnvironment.useMockData), []);
  const [content, setContent] = useState(menu);
  const [categoryId, setCategoryId] = useState(menu.categories[0].id);
  useEffect(() => {
    void repository.menu().then(value => {
      if (
        value &&
        typeof value === "object" &&
        "categories" in value &&
        Array.isArray((value as { categories?: unknown }).categories)
      )
        setContent(value as typeof menu);
    });
  }, [repository]);
  const category = content.categories.find(item => item.id === categoryId) ?? content.categories[0];
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        Menu
      </Text>
      <Text style={styles.body}>Made fresh at the truck. Availability can vary by location.</Text>
      <View accessibilityRole="tablist" style={styles.tabs}>
        {content.categories.map(item => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: categoryId === item.id }}
            key={item.id}
            onPress={() => {
              setCategoryId(item.id);
              analytics.track({ name: "menu_category_viewed", properties: { categoryId: item.id } });
            }}
            style={[styles.tab, categoryId === item.id && styles.selectedTab]}
          >
            <Text style={[styles.tabText, categoryId === item.id && styles.selectedTabText]}>{item.name}</Text>
          </Pressable>
        ))}
      </View>
      {category.items.map(item => (
        <Card key={item.id} style={styles.card}>
          {item.imageKey && item.imageKey in menuImages ? (
            <Image
              accessibilityIgnoresInvertColors
              source={menuImages[item.imageKey as ImageKey]}
              style={styles.image}
            />
          ) : null}
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.body}>{item.description}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { backgroundColor: colors.offWhite, flex: 1 },
  content: { gap: spacing.standard, padding: spacing.screen },
  title: { color: colors.ink, fontSize: 30, fontWeight: "800", lineHeight: 36 },
  body: { color: colors.mutedInk, fontSize: 16, lineHeight: 23 },
  tabs: { flexDirection: "row", gap: spacing.compact },
  tab: {
    alignItems: "center",
    borderColor: colors.brandBlue,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    justifyContent: "center"
  },
  selectedTab: { backgroundColor: colors.brandBlue },
  tabText: { color: colors.brandBlue, fontWeight: "700" },
  selectedTabText: { color: colors.white },
  card: { gap: spacing.compact },
  image: { borderRadius: 10, height: 150, width: "100%" },
  itemName: { color: colors.ink, fontSize: 20, fontWeight: "800", lineHeight: 26 }
});
