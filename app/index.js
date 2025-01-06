import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Alert,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { SessionProvider } from "../src/SessionContext";
import messaging from "@react-native-firebase/messaging";
import NotificationInbox from "../src/components/NotificationInbox";
import LoginPage from "../src/screens/Auth/LoginScreen";
import RegisterPage from "../src/screens/Auth/RegisterScreen";
import StudentPage from "./StudentPage";
import MRPage from "./MRPage";
import AdminPage from "./AdminPage";
import Supervisor from "./Supervisor";
import CoordinatorPage from "./CoordinatorPage";
import AuthorityPage from "./Authority";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

const Stack = createStackNavigator();

// Splash Screen Component
const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.splashContainer}>
      <Animated.Image
        source={require("../assets/images/splash2.png")}
        style={[styles.fullScreenImage, { opacity: fadeAnim }]}
      />
    </View>
  );
};

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  // Request Notification Permissions
  const requestNotificationPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Notification permission granted:", authStatus);

      // Get FCM token
      const token = await messaging().getToken();
      console.log("FCM Token:", token);
    } else {
      console.log("Notification permission denied.");
    }
  };

  useEffect(() => {
    // Check and request permissions
    requestNotificationPermission();

    // Listen for foreground messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const prepareApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setAppIsReady(true);
    };

    prepareApp();
  }, []);

  if (!appIsReady) {
    return <SplashScreen />;
  }

  return (
    <SessionProvider>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationInbox}
          options={{ title: "Notifications" }}
        />
        <Stack.Screen
          name="StudentPage"
          component={StudentPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MRPage"
          component={MRPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Authority"
          component={AuthorityPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Coordinator"
          component={CoordinatorPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Supervisor"
          component={Supervisor}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </SessionProvider>
  );
};

// Styles for Splash Screen
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
  },
  fullScreenImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default App;
