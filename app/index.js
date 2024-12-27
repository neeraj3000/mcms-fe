import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { SessionProvider } from "../src/SessionContext";
import registerNNPushToken from "native-notify";
import NotificationInbox from "../src/components/NotificationInbox";
import LoginPage from "../src/screens/Auth/LoginScreen";
import RegisterPage from "../src/screens/Auth/RegisterScreen";
import StudentPage from "./StudentPage";
import MRPage from "./MRPage";
import AdminPage from "./AdminPage";
import Supervisor from "./Supervisor";
import CoordinatorPage from "./CoordinatorPage";
import AuthorityPage from "./Authority";

const Stack = createStackNavigator();

// Splash Screen Component
const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity is 0

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Fully visible
      duration: 2000, // Duration in milliseconds
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.splashContainer}>
      <Animated.Image
        source={require("../assets/images/splash2.png")} // Replace with your image file path
        style={[styles.fullScreenImage, { opacity: fadeAnim }]} // Bind opacity to fadeAnim
      />
    </View>
  );
};

const App = () => {
  registerNNPushToken(25679, "XWq6oWFv6eHddwmOo9m6Mv");
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      // Simulate a delay for loading resources
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
    resizeMode: "cover", // Ensures the image fills the entire screen
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  loader: {
    marginTop: 10,
  },
});

export default App;
