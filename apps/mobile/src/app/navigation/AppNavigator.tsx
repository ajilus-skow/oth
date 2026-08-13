import { NavigationContainer, type LinkingOptions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
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

export type RootStackParams = {
  Tabs: undefined;
  About: undefined;
  EventDetail: { eventId: string };
  Contact: undefined;
  NotificationSettings: undefined;
  LocationSettings: undefined;
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
      screenOptions={{ headerStyle: { backgroundColor: colors.brandYellow }, tabBarActiveTintColor: colors.brandBlue }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tabs.Screen name="FindUs" component={FindUsScreen} options={{ title: "Find Us" }} />
      <Tabs.Screen name="Menu" component={MenuScreen} options={{ title: "Menu" }} />
      <Tabs.Screen name="More" component={MoreScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: "About On The Hook" }} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Truck Visit" }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: "Contact Us" }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSetupScreen} options={{ title: "Alerts" }} />
        <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, gap: spacing.standard, justifyContent: "center", padding: spacing.screen },
  body: { color: colors.mutedInk, fontSize: 16 }
});
