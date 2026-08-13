import { useEffect } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./navigation/AppNavigator";
import { analytics } from "../analytics/analytics";

function App() {
  const isDarkMode = useColorScheme() === "dark";
  useEffect(() => { analytics.track({ name: "app_open" }); }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
