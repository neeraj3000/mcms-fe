import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import IssuesComponent from "../../components/IssuesComponent";
import { useSession } from "@/src/SessionContext";
import ViewComplaints from "./ViewComplaints";

const Tab = createMaterialTopTabNavigator();

const IssuesCoordinator = () => {
  
  const { user, logout } = useSession(); // Assuming logout is available from your session context
  const [role, setRole] = useState(user?.role || null); // Track the role in local state

  // Update the role state when the user logs out
  useEffect(() => {
    if (user?.role === null) {
      setRole(null); // Clear the role when user logs out
    }
  }, [user]);

  let mode = "none"; // Default mode

  if (role === "student" || role === "representative") {
    mode = "vote"; // Set mode based on role
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#007bff" },
        tabBarActiveTintColor: "#007bff",
      }}
    >
      <Tab.Screen
        name="Complaints"
        component={ViewComplaints}
      />
      <Tab.Screen
        name="All Issues"
        component={() => <IssuesComponent mode={mode} />}
      />
    </Tab.Navigator>
  );
}

export default IssuesCoordinator