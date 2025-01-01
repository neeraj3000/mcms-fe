import React from "react";
import MessMenupage from "../Student/MessMenu";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const SupervisorHome = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to Supervisor Dashboard</Text>
        <Text style={styles.subHeaderText}>
          Manage the Mess Menu Efficiently
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Mess Menu</Text>
        <MessMenupage />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          For assistance, contact support at support@example.com
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E0F7FA",  // Light blue background for the page
    padding: 20,
  },
  header: {
    backgroundColor: "#B3E5FC",  // Lighter shade of blue for the header
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0277BD",  // A darker blue for the text
    textAlign: "center",
  },
  subHeaderText: {
    fontSize: 16,
    color: "#0288D1",  // Slightly darker for sub-header text
    textAlign: "center",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0288D1",  // Matching the sub-header color
    marginBottom: 15,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  footerText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});

export default SupervisorHome;
