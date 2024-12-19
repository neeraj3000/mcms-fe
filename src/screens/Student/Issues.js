import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ReportIssue from "./IssueReportScreen";
import IssueHistory from "./HistoryScreen";
import IssueHistoryRep from "../Representative/HistoryScreenRep";
import IssuesComponent from "../../components/IssuesComponent";
import { useSession } from "@/src/SessionContext";

const Tab = createMaterialTopTabNavigator();

export default function App() {
  const { user, logout } = useSession(); // Assuming logout is available from your session context
  const [role, setRole] = useState(user?.role || null); // Track the role in local state
  
  // Update the role state when the user logs out
  useEffect(() => {
    if (user?.role === null) {
      setRole(null); // Clear the role when user logs out
    }
  }, [user]);

  let mode = "none"; // Default mode
  
  if (role === "student" || role === "mess_rep") {
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
        name="All Issues"
        component={() => <IssuesComponent mode={mode} />}
      />
      <Tab.Screen name="Report Issue" component={ReportIssue} />
      <Tab.Screen name="History" component={role==="student" ? IssueHistory : IssueHistoryRep} />
    </Tab.Navigator>
  );
}
