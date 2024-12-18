import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // If using Expo, or install react-native-vector-icons if not

const RefreshButton = ({ onRefresh }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onRefresh}>
      <Ionicons name="refresh" size={24} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
});

export default RefreshButton;
