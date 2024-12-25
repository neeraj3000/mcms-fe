import React, { useEffect } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native'; // Import Alert for confirmation
import { useSession } from '../src/SessionContext';
import StudentHomePage from '../src/screens/Student/Student';
import FeedbackForm from '../src/screens/Student/FeedbackScreen';
import Issues from '../src/screens/Student/Issues';
import RepresentativePage from '../src/screens/Representative/RepresentativePage';
import QualityInspection from '../src/screens/Representative/QualityInspection';
import AllComplaints from '../src/screens/Representative/ViewComplaints';
import ProfilePage from "../src/screens/Student/ProfilePage";
import MessMenuPage from "../src/screens/Student/MessMenu";
import GuidelinesPage from "../src/screens/Student/Guidelines";



const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const CustomDrawerContent = (props) => {
  const { logout } = useSession();
  const navigation = props.navigation; // Access navigation from props

  const handleLogout = () => {
    // Show a confirmation dialog
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Login'); // Navigate to Login screen
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
          marginTop: 'auto',
          backgroundColor: '#007BFF',
          borderRadius: 5,
        }}
        labelStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        icon={() => <Ionicons name="log-out-outline" size={24} color="white" />}
      />
    </DrawerContentScrollView>
  );
};

// Drawer Wrapper for Tab screens
const DrawerWrapper = (Component) => {
  return () => (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#fff',
          width: 240,
        },
        drawerLabelStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen name="RepresentativePage" component={RepresentativePage} options={{ title: 'Home' }} />
      <Drawer.Screen name="Feedback" component={FeedbackForm} />
      <Drawer.Screen name="QualityInspection" component={QualityInspection} options={{ title: 'Quality Inspection' }} />
      <Drawer.Screen name="View Complaints" component={AllComplaints} />
      <Drawer.Screen name="Issues" component={Issues} />
    </Drawer.Navigator>
  );
};

const MRPage = ({ navigation }) => {
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user]);

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
              : "information-circle-outline"; // Guidelines icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Remove header for all tabs
      })}
    >
      <Tab.Screen name="Home" component={DrawerWrapper(RepresentativePage)} />
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

export default MRPage;
