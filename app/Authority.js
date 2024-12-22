import React from "react";
import { Alert } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useSession } from "../src/SessionContext"; // Import session context
import AuthorityHome from "../src/screens/Authority/Authority"; // Renamed for Authority
import RequestInspections from "../src/screens/Coordinator/RequestInspections"; // Adjusted for Authority
import ReportTable from "../src/screens/Coordinator/Reports"; // Adjusted for Authority
import IssuesAuthority from "../src/screens/Coordinator/IssuesCoordinator"; // Adjusted for Authority

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { logout } = useSession(); // Access logout function from session context
  const { navigation } = props; // Access navigation prop

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
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
        label="Logout" // Corrected label here
        onPress={handleLogout}
        style={{
          marginTop: "auto",
          backgroundColor: "#007BFF", // Highlight with blue background
          borderRadius: 5, // Rounded corners
        }}
        labelStyle={{
          color: "white", // White text color for contrast
          fontWeight: "bold", // Bold text for emphasis
        }}
        icon={() => (
          <Ionicons name="log-out-outline" size={24} color="white" /> // Custom logout icon
        )}
      />
    </DrawerContentScrollView>
  );
};

const AuthorityNavigate = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />} // Custom Drawer Content
      screenOptions={{
        headerTitle: "Authority Dashboard", // Updated header title
        drawerStyle: {
          backgroundColor: "#fff",
          width: 240,
        },
        drawerLabelStyle: {
          fontWeight: "bold", // Bold labels in the drawer
        },
        drawerHeaderStyle: {
          backgroundColor: "#007BFF", // Set background color for drawer header
          height: 120, // Set height of the header
        },
        drawerHeaderTitleStyle: {
          color: "white", // Set color of the title text to white
          fontSize: 22, // Increase font size for the title
          fontWeight: "bold", // Make title bold
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={AuthorityHome} // Adjusted for Authority
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="View Complaints"
        component={IssuesAuthority} // Adjusted for Authority
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="report-problem" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Request Inspections"
        component={RequestInspections} // Adjusted for Authority
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportTable} // Adjusted for Authority
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AuthorityNavigate;
