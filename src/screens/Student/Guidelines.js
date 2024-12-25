import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const GuidelinesPage = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Guidelines and Instructions</Text>
      <Text style={styles.subtitle}>
        Please follow the rules and regulations outlined below:
      </Text>

      <View style={styles.guidelineContainer}>
        <Text style={styles.guidelineTitle}>1. Mess Timing</Text>
        <Text style={styles.guidelineText}>
          - Breakfast: 7:00 AM - 9:00 AM {"\n"}- Lunch: 12:00 PM - 2:00 PM{" "}
          {"\n"}- Dinner: 7:00 PM - 9:00 PM
        </Text>
      </View>

      <View style={styles.guidelineContainer}>
        <Text style={styles.guidelineTitle}>2. Cleanliness</Text>
        <Text style={styles.guidelineText}>
          - Keep your tables and utensils clean after eating.{"\n"}- Dispose of
          waste in designated bins.
        </Text>
      </View>

      <View style={styles.guidelineContainer}>
        <Text style={styles.guidelineTitle}>3. Behavior</Text>
        <Text style={styles.guidelineText}>
          - Be respectful to mess staff and other students.{"\n"}- Avoid loud
          conversations or disruptive behavior.
        </Text>
      </View>

      <View style={styles.guidelineContainer}>
        <Text style={styles.guidelineTitle}>4. Feedback</Text>
        <Text style={styles.guidelineText}>
          - Use the feedback section in the app for suggestions and complaints.
          {"\n"}- Provide constructive feedback for improvements.
        </Text>
      </View>

      <View style={styles.guidelineContainer}>
        <Text style={styles.guidelineTitle}>5. Upvoting Issues</Text>
        <Text style={styles.guidelineText}>
          - Students can upvote issues to prioritize their resolution.{"\n"}-
          Avoid misusing the feature by upvoting irrelevant issues.
        </Text>
      </View>

      <View style={styles.guidelineContainer}>
        <Text style={styles.guidelineTitle}>6. Attendance</Text>
        <Text style={styles.guidelineText}>
          - Attendance is mandatory for mess meetings and announcements.{"\n"}-
          Inform the Mess Supervisor in advance if unable to attend.
        </Text>
      </View>

      <Text style={styles.footer}>Thank you for your cooperation!</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#007BFF",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6c757d",
    marginBottom: 20,
  },
  guidelineContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 2, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  guidelineTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 16,
    color: "#555",
  },
  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#6c757d",
    marginTop: 20,
  },
});

export default GuidelinesPage;
