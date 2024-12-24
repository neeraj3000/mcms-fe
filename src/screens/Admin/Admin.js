import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { registerAuthority } from "../../../backend/authoritynew";
import { registerCoordinator } from "../../../backend/coordinatornew";
import { createRepresentative } from "../../../backend/representativesnew";
import { registerSupervisor } from "../../../backend/supervisornew"; // Update with the correct path

const Admin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [mess, setMess] = useState("");

  const handleRegister = async () => {
    if (
      !email ||
      (role !== "Mess Representative" && (!name || !password || !mobileNo)) ||
      (role !== "Authority" &&
        role !== "Coordinator" &&
        role !== "Supervisor" &&
        !mess)
    ) {
      Alert.alert("Error", "Please fill in all the required fields.");
      return;
    }

    try {
      let response;

      switch (role) {
        case "Authority":
          response = await registerAuthority({
            name,
            mobileNo,
            email,
            password,
          });
          break;
        case "Coordinator":
          response = await registerCoordinator(name, mobileNo, email, password);
          break;
        case "Supervisor":
          response = await registerSupervisor(
            name,
            mobileNo,
            email,
            password,
            mess
          );
          break;
        case "Mess Representative":
          response = await createRepresentative(email, mess);
          break;
        default:
          Alert.alert("Error", "Invalid role selected.");
          return;
      }

      if (response?.success) {
        Alert.alert("Success", response.message);
        setName("");
        setEmail("");
        setPassword("");
        setMobileNo("");
        setRole("");
        setMess("");
      } else {
        Alert.alert("Error", response?.error || "Registration failed.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "An unexpected error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Registration</Text>

      {/* Role Dropdown */}
      <Text style={styles.label}>Role</Text>
      <View style={styles.dropdown}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Select Role" value="" />
          <Picker.Item label="Authority" value="Authority" />
          <Picker.Item label="Coordinator" value="Coordinator" />
          <Picker.Item label="Supervisor" value="Supervisor" />
          <Picker.Item
            label="Mess Representative"
            value="Mess Representative"
          />
        </Picker>
      </View>

      {/* Input Fields for Authority, Coordinator, Supervisor */}
      {role && role !== "Mess Representative" && (
        <>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter Name"
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={mobileNo}
            onChangeText={setMobileNo}
            placeholder="Enter Mobile Number"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Email"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Password"
            secureTextEntry={true}
          />
        </>
      )}
      {(role === "Supervisor") && (
        <>
          

          <Text style={styles.label}>Mess Number</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={mess}
              onValueChange={(itemValue) => setMess(itemValue)}
            >
              <Picker.Item label="Select Mess" value="" />
              {Array.from({ length: 8 }, (_, i) => (
                <Picker.Item
                  key={i}
                  label={`Mess ${i + 1}`}
                  value={`${i + 1}`}
                />
              ))}
            </Picker>
          </View>
        </>
      )}
      {/* Input Fields for Mess Representative and Supervisor */}
      {(role === "Mess Representative") && (
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Email"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Mess Number</Text>
          <View style={styles.dropdown}>
            <Picker
              selectedValue={mess}
              onValueChange={(itemValue) => setMess(itemValue)}
            >
              <Picker.Item label="Select Mess" value="" />
              {Array.from({ length: 8 }, (_, i) => (
                <Picker.Item
                  key={i}
                  label={`Mess ${i + 1}`}
                  value={`${i + 1}`}
                />
              ))}
            </Picker>
          </View>
        </>
      )}

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  registerButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Admin;
