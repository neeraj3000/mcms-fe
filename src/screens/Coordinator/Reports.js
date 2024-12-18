import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ViewInspectionReports from "./ViewInspectionReport";
import FeedbackScreen from "./ViewFeedBack";

const Tab = createMaterialTopTabNavigator();

export default function Reports() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarIndicatorStyle: { backgroundColor: "#007bff" },
        tabBarActiveTintColor: "#007bff",
      }}
    >
      <Tab.Screen name="Feedback Reports" component={FeedbackScreen} />
      <Tab.Screen name="Inspection Reports" component={ViewInspectionReports} />
    </Tab.Navigator>
  );
}
