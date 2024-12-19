import React from "react";
import { View, Text, StyleSheet } from "react-native";
import FeedbackScreen from "./ViewFeedBack";
import Analytics from "./Analytics";

const CoordinatorHome = () => {
  return <Analytics />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  text: { fontSize: 16, color: "#555" },
});

export default CoordinatorHome;
