import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ReportIssue from "./IssueReportScreen";
import IssueHistory from "./HistoryScreen";
import IssuesComponent from "../../components/IssuesComponent";

const Tab = createMaterialTopTabNavigator();

// Wrapper components to send props
const IssuesWithVoting = () => <IssuesComponent route={{ params: { featureType: "vote" } }} />;

export default function App() {
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
          component={() => <IssuesComponent mode="vote" />}
        />
        <Tab.Screen name="Report Issue" component={ReportIssue} />
        <Tab.Screen name="History" component={IssueHistory} />
      </Tab.Navigator>
  );
}
