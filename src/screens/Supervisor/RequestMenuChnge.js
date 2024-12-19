import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function RequestMenuChange() {
  const [date, setDate] = useState("");
  const [currentMenu, setCurrentMenu] = useState("");
  const [proposedMenu, setProposedMenu] = useState("");
  const [reason, setReason] = useState("");

  const submitRequest = () => {
    // Handle form submission logic
    alert("Menu Change Request Submitted");
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
      <Button title="Submit Request" onPress={submitRequest} />
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
