import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { SessionProvider } from "../src/SessionContext";
import * as SplashScreen from "expo-splash-screen";

import LoginPage from "../src/screens/Auth/LoginScreen";
import RegisterPage from "../src/screens/Auth/RegisterScreen";
import StudentPage from "../app/StudentPage";
import MRPage from "../app/MRPage";
import CoordinatorPage from "../app/CoordinatorPage";
import AdminPage from "../app/AdminPage";
import Director from "../app/Director";
import AdministrativeOfficer from "../src/screens/AdministrativeOfficer/AdministrativeOfficer";
import Supervisor from "./Supervisor";

const Stack = createStackNavigator();

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        await SplashScreen.preventAutoHideAsync();
        // Perform any async setup tasks here
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, []);

  if (!appIsReady) {
    return null; // Optionally, you can return a loading spinner here
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
            name="Admin"
            component={AdminPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Coordinator"
            component={CoordinatorPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Director"
            component={Director}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AO"
            component={AdministrativeOfficer}
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

export default App;
