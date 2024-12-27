import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { sendNotification, sendToAll } from "../../utils/sendNotifications"; // Assuming you have this function for sending notifications

export default function ProvideUpdates() {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [googleFormLink, setGoogleFormLink] = useState("");

  // Send notification function
  const handleSubmit = () => {
    if (!notificationTitle || !notificationMessage) {
      Alert.alert("Error", "Please fill out all fields for the notification.");
      return;
    }

    // If a Google Form link is provided, append it to the notification message
    if (googleFormLink) {
      if (!googleFormLink.startsWith("http")) {
        Alert.alert("Error", "Please provide a valid Google Form link.");
        return;
      }
      notificationMessage += `\n\nGoogle Form: ${googleFormLink}`;
    }

    // Send notification with or without the Google Form link
    sendToAll(notificationTitle, notificationMessage);
    Alert.alert(
      "Notification Sent",
      `Title: ${notificationTitle}\nMessage: ${notificationMessage}`
    );

    // Clear inputs after sending notification
    setNotificationTitle("");
    setNotificationMessage("");
    setGoogleFormLink(""); // Clear the Google Form link input
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Provide Updates</Text>

      {/* Notification Section */}
      <Text style={styles.sectionHeader}>Send Notification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Notification Title"
        value={notificationTitle}
        onChangeText={setNotificationTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter Notification Message"
        value={notificationMessage}
        onChangeText={setNotificationMessage}
        multiline
        numberOfLines={4}
      />

      {/* Google Forms Section */}
      <Text style={styles.sectionHeader}>Share Google Form (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Google Form Link"
        value={googleFormLink}
        onChangeText={setGoogleFormLink}
      />

      {/* Single Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Update</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
