import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FeedbackAnalytics from "../Coordinator/FeedbackAnalytics";
import InspectionAnalytics from "../Coordinator/InspectionAnalytics";

const Tab = createMaterialTopTabNavigator();

export default function AuthorityHome() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#007bff" },
        tabBarActiveTintColor: "#007bff",
      }}
    >
      <Tab.Screen name="Feedback Reports" component={FeedbackAnalytics} />
      <Tab.Screen name="Inspection Reports" component={InspectionAnalytics} />
    </Tab.Navigator>
  );
}
