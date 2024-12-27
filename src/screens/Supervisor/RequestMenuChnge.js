import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { createMenuChangeRequest } from "../../../backend/messMenuChangeRequests"; // Adjust the import path as needed

export default function RequestMenuChange() {
  const [date, setDate] = useState("");
  const [currentMenu, setCurrentMenu] = useState("");
  const [proposedMenu, setProposedMenu] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    setLoading(true);
    try {
      if (!date || !currentMenu || !proposedMenu || !reason) {
        Alert.alert("Error", "All fields are required");
        setLoading(false);
        return;
      }

      const result = await createMenuChangeRequest(
        date,
        currentMenu,
        proposedMenu,
        reason
      );

      if (result.success) {
        Alert.alert("Success", result.message);
        // Reset the form fields after successful submission
        setDate("");
        setCurrentMenu("");
        setProposedMenu("");
        setReason("");
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Request Menu Change</Text>
      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        style={styles.input}
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        placeholder="Current Menu"
        style={styles.input}
        value={currentMenu}
        onChangeText={setCurrentMenu}
      />
      <TextInput
        placeholder="Proposed Menu"
        style={styles.input}
        value={proposedMenu}
        onChangeText={setProposedMenu}
      />
      <TextInput
        placeholder="Reason for Change"
        style={styles.input}
        value={reason}
        onChangeText={setReason}
      />
      <Button
        title={loading ? "Submitting..." : "Submit Request"}
        onPress={submitRequest}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
