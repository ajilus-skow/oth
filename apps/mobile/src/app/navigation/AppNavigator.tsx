import {
  NavigationContainer,
  useNavigation,
  type LinkingOptions,
  type NavigatorScreenParams
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { PrimaryButton, SectionHeader } from "../../design/primitives";
import { colors, spacing } from "../../design/tokens";
import { MoreScreen } from "../../features/more/MoreScreen";
import { NotificationSetupScreen } from "../../features/notifications/NotificationSetupScreen";
import { FindUsScreen } from "../../features/locations/FindUsScreen";
import { LocationSettingsScreen } from "../../features/locations/LocationSettingsScreen";
import { ContactScreen } from "../../features/contact/ContactScreen";
import { MenuScreen } from "../../features/menu/MenuScreen";
import { AboutScreen } from "../../features/about/AboutScreen";
import { HomeScreen } from "../../features/home/HomeScreen";
import { EventDetailScreen } from "../../features/locations/EventDetailScreen";
import { analytics } from "../../analytics/analytics";
import { CartScreen } from "../../features/cart/CartScreen";
import { OrderConfirmationScreen } from "../../features/cart/OrderConfirmationScreen";
import { useCart } from "../../features/cart/CartProvider";
import type { LocalOrderReceipt } from "../../features/cart/orderSubmission";

export type RootStackParams = {
  Tabs: NavigatorScreenParams<TabParams> | undefined;
  About: undefined;
  EventDetail: { eventId: string };
  Contact: undefined;
  NotificationSettings: undefined;
  LocationSettings: undefined;
  Cart: undefined;
  OrderConfirmation: { receipt: LocalOrderReceipt };
};

type TabParams = { Home: undefined; FindUs: undefined; Menu: undefined; More: undefined };
const Tabs = createBottomTabNavigator<TabParams>();
const Stack = createNativeStackNavigator<RootStackParams>();

const linking: LinkingOptions<RootStackParams> = {
  prefixes: ["onthehookbeta://"],
  config: {
    screens: {
      Tabs: "",
      About: "about",
      EventDetail: "events/:eventId",
      Contact: "contact",
      NotificationSettings: "notifications",
      LocationSettings: "location"
    }
  }
};

function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.placeholder}>
      <SectionHeader>{title}</SectionHeader>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.brandYellow },
        // Keep the compact native header within its fixed safe-area height at
        // Accessibility text sizes. Screen content remains Dynamic Type aware.
        headerTitleAllowFontScaling: false,
        headerRight: () => <CartButton />,
        tabBarActiveTintColor: colors.brandBlue,
        tabBarInactiveTintColor: colors.mutedInk,
        tabBarIcon: ({ color }) => <FishHookIcon color={color} />
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarButtonTestID: "tab-home", title: "Home" }} />
      <Tabs.Screen
        name="FindUs"
        component={FindUsScreen}
        options={{ tabBarButtonTestID: "tab-find-us", title: "Find Us" }}
      />
      <Tabs.Screen name="Menu" component={MenuScreen} options={{ tabBarButtonTestID: "tab-menu", title: "Menu" }} />
      <Tabs.Screen name="More" component={MoreScreen} options={{ tabBarButtonTestID: "tab-more" }} />
    </Tabs.Navigator>
  );
}

export function CartButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { totalUnitCount } = useCart();
  const badge = totalUnitCount > 99 ? "99+" : String(totalUnitCount);
  return (
    <Pressable
      accessibilityLabel={totalUnitCount ? `Cart, ${totalUnitCount} items` : "Cart"}
      accessibilityRole="button"
      onPress={() => navigation.navigate("Cart")}
      style={styles.cartButton}
      testID="cart-button"
    >
      <Text style={styles.cartIcon}>Cart</Text>
      {totalUnitCount ? (
        <Text style={styles.badge} testID="cart-badge">
          {badge}
        </Text>
      ) : null}
    </Pressable>
  );
}

function FishHookIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 32 32" fill="none" accessible={false}>
      <Path
        d="M9 4c5.5 0 10 4.5 10 10v7c0 4.4-3.6 8-8 8s-8-3.6-8-8c0-2.8 2.2-5 5-5s5 2.2 5 5"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="m17.5 5.5 3-3v6l-3-3Z" fill={color} />
      <Path d="m13 21-3 3 5 .5" stroke={color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer
      linking={linking}
      onStateChange={state =>
        analytics.track({ name: "navigation_changed", properties: { screen: state?.routes.at(-1)?.name ?? "unknown" } })
      }
    >
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: "About On The Hook" }} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Truck Visit" }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: "Contact Us" }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSetupScreen} options={{ title: "Alerts" }} />
        <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Your Cart" }} />
        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
          options={{ gestureEnabled: false, headerBackVisible: false, title: "Confirmation" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, gap: spacing.standard, justifyContent: "center", padding: spacing.screen },
  body: { color: colors.mutedInk, fontSize: 16 },
  cartButton: { alignItems: "center", flexDirection: "row", minHeight: 44, paddingHorizontal: spacing.compact },
  cartIcon: { color: colors.brandBlue, fontSize: 15, fontWeight: "800" },
  badge: {
    backgroundColor: colors.brandBlue,
    borderRadius: 10,
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 4,
    minWidth: 20,
    overflow: "hidden",
    paddingHorizontal: 4,
    textAlign: "center"
  }
});
