import React, { useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import Admin from "../src/screens/Admin/Admin";
import ViewMessRepresentative from "../src/screens/Admin/ViewMessRepresentative";
import ViewMessSupervisor from "../src/screens/Admin/ViewSupervisors";
import ViewStudents from "../src/screens/Admin/ViewStudents";
import AssignMess from "../src/screens/Admin/AssignMess";
import MessMenuPage from "../src/screens/Admin/MessMenuPage";
import { useSession } from "../src/SessionContext";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const { logout } = useSession();
  const { navigation } = props;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            logout(); // Clear session data
            navigation.replace("Login"); // Navigate to Login screen
          },
        },
      ],
      { cancelable: false }
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

const AdminPage = () => {
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      console.log("User is not logged in.");
    }
  }, [user]);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTitle: "Menu",
        drawerStyle: {
          backgroundColor: "#fff",
          width: 240,
        },
        drawerLabelStyle: {
          fontWeight: "bold",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={Admin}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="View Mess Representative"
        component={ViewMessRepresentative}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="View Supervisors"
        component={ViewMessSupervisor}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="View Students"
        component={ViewStudents}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Assign Mess"
        component={AssignMess}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Mess Menu"
        component={MessMenuPage}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default AdminPage;
