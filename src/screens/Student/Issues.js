import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ReportIssue from "./IssueReportScreen";
import IssueHistory from "./HistoryScreen";
import IssueHistoryRep from "../Representative/HistoryScreenRep";
import IssuesComponent from "../../components/IssuesComponent";
import { useSession } from "@/src/SessionContext";
import IssuesWithVote from "./AllIssuesScreen";

const Tab = createMaterialTopTabNavigator();

const Issues = () => {
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#007bff" },
        tabBarActiveTintColor: "#007bff",
      }}
    >
      <Tab.Screen name="All Issues" component={IssuesWithVote} />
      <Tab.Screen name="Report Issue" component={ReportIssue} />
      <Tab.Screen name="History" component={IssueHistory} />
    </Tab.Navigator>
  );
}

export default Issues;