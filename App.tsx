import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import NavigationService from "./src/navigation/NavigationService";
import { getSession } from "./src/utils/authStorage";
import type { AuthUser } from "./src/utils/authStorage";
import { store } from "./src/store/store";

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [session, setSession] = useState<AuthUser | null>();

  useEffect(() => {
    let isMounted = true;

    getSession()
      .then(savedSession => {
        if (isMounted) {
          setSession(savedSession);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          Alert.alert(
            "Unable to restore session",
            error instanceof Error ? error.message : "Please try again.",
          );
          setSession(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {session === undefined ? (
          <View style={styles.loading}>
            <ActivityIndicator />
          </View>
        ) : (
          <NavigationService initialUser={session} />
        )}
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});

export default App;
