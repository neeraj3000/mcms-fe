import React from "react";
import { View, Text, Button, Linking, StyleSheet } from "react-native";

export default function ContactMessCoordinator() {
  const makeCall = () => {
    Linking.openURL("tel:1234567890"); // Replace with Mess Coordinator's phone number
  };

  const sendEmail = () => {
    Linking.openURL("mailto:messcoordinator@example.com"); // Replace with Mess Coordinator's email
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contact Mess Coordinator</Text>
      <Button title="Call Mess Coordinator" onPress={makeCall} />
      <Button title="Email Mess Coordinator" onPress={sendEmail} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
