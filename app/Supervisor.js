import React, { useEffect } from "react";
import { useSession } from "../src/SessionContext";
import { Alert } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Import Supervisor screens
import SupervisorHome from "../src/screens/Supervisor/Superviser";
import Contact from "../src/screens/Supervisor/Contact";
import RequestMenuChange from "../src/screens/Supervisor/RequestMenuChnge";
import ViewIssues from "../src/screens/Supervisor/ViewIssues";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { logout } = useSession();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      "Logout:",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {}, // Do nothing on cancel
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => {
            logout();
            navigation.replace("Login"); // Navigate to Login screen
          },
          style: "destructive", // Optional: makes the button red
        },
      ],
      { cancelable: true } // Dismiss alert by tapping outside
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={handleLogout}
        style={{
          marginTop: "auto",
          backgroundColor: "#007BFF",
          borderRadius: 5,
        }}
        labelStyle={{
          color: "white",
          fontWeight: "bold",
        }}
        icon={() => <Ionicons name="log-out-outline" size={24} color="white" />}
      />
    </DrawerContentScrollView>
  );
};

const Supervisor = () => {
  const { user } = useSession();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      console.log("User is not logged in.");
    }
  }, [user, navigation]);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitle: "Menu",
        drawerStyle: { backgroundColor: "#fff", width: 240 },
        drawerLabelStyle: { fontWeight: "bold" },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={SupervisorHome}
        options={{ title: "Dashboard" }}
      />
      <Drawer.Screen
        name="Contact"
        component={Contact}
        options={{ title: "Contact Mess Coordinator" }}
      />
      <Drawer.Screen
        name="RequestMenuChange"
        component={RequestMenuChange}
        options={{ title: "Request Menu Change" }}
      />
      <Drawer.Screen
        name="ViewIssues"
        component={ViewIssues}
        options={{ title: "View Complaints" }}
      />
    </Drawer.Navigator>
  );
};

export default Supervisor;
