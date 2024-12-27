import React, { useEffect } from "react";
import { Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useSession } from "../src/SessionContext";
import { useNavigation } from "@react-navigation/native";
import FeedbackAnalytics from "../src/screens/Coordinator/FeedbackAnalytics";
import InspectionAnalytics from "../src/screens/Coordinator/InspectionAnalytics";
import RequestInspections from "../src/screens/Coordinator/RequestInspections";
import RequestFeedback from "../src/screens/Coordinator/RequestFeedback";
import FeedbackScreen from "../src/screens/Coordinator/ViewFeedBack";
import ViewInspectionReports from "../src/screens/Coordinator/ViewInspectionReport";
import ViewComplaints from "@/src/screens/Coordinator/ViewComplaints";
import IssuesList from "../src/screens/Coordinator/AllIssues";
import MessMenupage from "@/src/screens/Student/MessMenu";
import ProfilePage from "@/src/screens/Student/ProfilePage";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

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

// Drawer Wrapper for a Tab
const DrawerWrapper = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      drawerStyle: {
        backgroundColor: "#fff",
        width: 240,
      },
      drawerLabelStyle: {
        fontWeight: "bold",
      },
    }}
  >
    <Drawer.Screen name="Coordinator Home" component={ViewComplaints} />
    <Drawer.Screen name="Feedback Analytics" component={FeedbackAnalytics} />
    <Drawer.Screen
      name="Inspection Analytics"
      component={InspectionAnalytics}
    />
    <Drawer.Screen name="Feedback Reports" component={FeedbackScreen} />
    <Drawer.Screen
      name="Inspection Reports"
      component={ViewInspectionReports}
    />
    <Drawer.Screen name="Request Feedback" component={RequestFeedback} />
    <Drawer.Screen name="Request Inspection" component={RequestInspections} />
  </Drawer.Navigator>
);

// Bottom Tab Navigator
const CoordinatorPage = () => {
  const { user } = useSession();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      console.log("hloo User is not logged in."); // Navigate to Login screen if no user
    }
  }, [user, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Mess Menu") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Guidelines") {
            iconName = focused
              ? "information-circle"
              : "information-circle-outline";
          } else if (route.name === "Issues") {
            iconName = focused ? "list" : "list-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Remove header for all tabs
      })}
    >
      <Tab.Screen name="Home" component={DrawerWrapper} />

      <Tab.Screen
        name="Issues"
        component={IssuesList}
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: () => (
            <Ionicons
              name="arrow-back" // Contextual icon for guidelines
              size={24}
              color="black"
              style={{ marginLeft: 20 }} // Apply margin directly here
              onPress={() => navigation.goBack()} // Ensure navigation is passed correctly
            />
          ),
          headerTitleAlign: "center", // Optional: Center the title if needed
        })}
      />
      <Tab.Screen
        name="Mess Menu"
        component={MessMenupage}
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              style={{ marginLeft: 20 }} // Apply margin directly here
              onPress={() => navigation.goBack()}
            />
          ),
          headerTitleAlign: "center", // Optional: Center the title if needed
        })}
      />
    </Tab.Navigator>
  );
};

export default CoordinatorPage;
