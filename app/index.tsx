import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SessionProvider } from "../src/SessionContext";
import LoginPage from "../src/screens/Auth/LoginScreen";
import RegisterPage from "../src/screens/Auth/RegisterScreen";
import StudentPage from "../app/StudentPage";
import MRPage from "../app/MRPage";
import CoordinatorPage from "../app/CoordinatorPage";
import AdminPage from "../app/AdminPage";
import Director from "../app/Director";
import AdministrativeOfficer from "../src/screens/AdministrativeOfficer/AdministrativeOfficer";
import Supervisor from "./Supervisor";
import { Text, View } from "react-native";

// import { registerForPushNotificationsAsync } from "../src/utils/registerNotifications";

const Stack = createStackNavigator();

const App = () => {
  const [token, setToken] = useState(null); // State to hold the token

  useEffect(() => {
    // const getToken = async () => {
    //   const userId = 1; // Replace with the actual user ID
    //   const category = "student"; // Replace with the actual category
    //   const pushToken = await registerForPushNotificationsAsync(
    //     userId,
    //     category
    //   );
    //   setToken(pushToken); // Set the token in state
    // };

    // getToken(); // Call the function to get the token
  }, []);

  return (
    <SessionProvider>
      {/* <View>
        {token ? (
          <Text>Expo Push Token: {token}</Text> // Print the token if available
        ) : (
          <Text>Requesting push notification token...</Text> // Loading message
        )}
      </View> */}
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
