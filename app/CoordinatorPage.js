import React, { useEffect } from "react";
import { Alert } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useSession } from "../src/SessionContext";
import CoordinatorHome from "../src/screens/Coordinator/Coordinator";
import RequestInspections from "../src/screens/Coordinator/RequestInspections";
import RequestFeedback from "../src/screens/Coordinator/RequestFeedback";
import ReportTable from "../src/screens/Coordinator/Reports";
import IssuesCoordinator from "../src/screens/Coordinator/IssuesCoordinator";
import { useNavigation } from "@react-navigation/native";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = React.memo((props) => {
  const { logout } = useSession();
  const navigation = useNavigation();

  const handleLogout = React.useCallback(() => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => {
            logout();
            navigation.replace("Login");
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  }, [logout, navigation]);

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
});

const CoordinatorPage = () => {
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      console.log("User is not logged in.");
    }
  }, [user]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitle: "Mess Coordinator",
        drawerStyle: { backgroundColor: "#fff", width: 240 },
        drawerLabelStyle: { fontWeight: "bold" },
      }}
    >
      <Drawer.Screen
        name="Coordinator Home"
        component={CoordinatorHome}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="View Complaints"
        component={IssuesCoordinator}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="report-problem" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Request Inspections"
        component={RequestInspections}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Request Feedback"
        component={RequestFeedback}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportTable}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default CoordinatorPage;
