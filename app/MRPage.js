import React, { useEffect } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import { useSession } from "../src/SessionContext";
import { useNavigation } from "@react-navigation/native";
import FeedbackForm from "../src/screens/Student/FeedbackScreen";
import Issues from "../src/screens/Student/Issues";
import RepresentativePage from "../src/screens/Representative/RepresentativePage";
import QualityInspection from "../src/screens/Representative/QualityInspection";
import AllComplaints from "../src/screens/Representative/ViewComplaints";
import ProfilePage from "../src/screens/Student/ProfilePage";
import MessMenuPage from "../src/screens/Student/MessMenu";
import GuidelinesPage from "../src/screens/Student/Guidelines";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const CustomDrawerContent = (props) => {
  const { logout } = useSession();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            navigation.replace("Login");
          },
        },
      ],
      { cancelable: true }
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
    <Drawer.Screen
      name="Representative Home"
      component={RepresentativePage}
    />
    <Drawer.Screen name="Feedback" component={FeedbackForm} />
    <Drawer.Screen
      name="QualityInspection"
      component={QualityInspection}
    />
    <Drawer.Screen name="View Complaints" component={AllComplaints} />
    <Drawer.Screen name="Issues" component={Issues} />
  </Drawer.Navigator>
);

const MRPage = () => {
  const { user } = useSession();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      console.log("User is not logged in.");
      navigation.replace("Login");
    }
  }, [user, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Mess Menu":
              iconName = focused ? "restaurant" : "restaurant-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            case "Guidelines":
              iconName = focused
                ? "information-circle"
                : "information-circle-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DrawerWrapper} />
      <Tab.Screen
        name="Mess Menu"
        component={MessMenuPage}
        options={{
          headerShown: true,
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              style={{ marginLeft: 20 }}
              onPress={() => navigation.goBack()}
            />
          ),
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="Guidelines"
        component={GuidelinesPage}
        options={{
          headerShown: true,
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              style={{ marginLeft: 20 }}
              onPress={() => navigation.goBack()}
            />
          ),
          headerTitleAlign: "center",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          headerShown: true,
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              size={24}
              color="black"
              style={{ marginLeft: 20 }}
              onPress={() => navigation.goBack()}
            />
          ),
          headerTitleAlign: "center",
        }}
      />
    </Tab.Navigator>
  );
};

export default MRPage;
