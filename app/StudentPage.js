import React, { useEffect } from "react";
import { Alert } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../src/SessionContext";
import { useNavigation } from "@react-navigation/native";
import StudentHomePage from "../src/screens/Student/Student";
import FeedbackForm from "../src/screens/Student/FeedbackScreen";
import IssueHistory from "@/src/screens/Student/HistoryScreen";
import IssuesWithVote from "@/src/screens/Student/AllIssuesScreen";
import ReportIssue from "@/src/screens/Student/IssueReportScreen";
import ProfilePage from "../src/screens/Student/ProfilePage";
import MessMenuPage from "../src/screens/Student/MessMenu";
import GuidelinesPage from "../src/screens/Student/Guidelines";
import GlobalFAB from "../src/components/GlobalFAB";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const CustomDrawerContent = (props) => {
  const { logout } = useSession();
  const navigation = useNavigation(); // Access navigation from props

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
    <Drawer.Screen name="Student Home" component={StudentHomePage} />
    <Drawer.Screen name="Feedback" component={FeedbackForm} />
    <Drawer.Screen name="Report Issue" component={ReportIssue} />
    <Drawer.Screen name="History" component={IssueHistory} />
  </Drawer.Navigator>
);

// Bottom Tab Navigator
const StudentPage = () => {
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
        name="Mess Menu"
        component={MessMenuPage}
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
      <Tab.Screen
        name="Issues"
        component={IssuesWithVote}
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
        name="Guidelines"
        component={GuidelinesPage}
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
        name="Profile"
        component={ProfilePage}
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

export default StudentPage;
