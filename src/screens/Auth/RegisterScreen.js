import React, { useState } from "react";
import { registerStudent } from "../../../backend/studentnew";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView, // Import ScrollView
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const RegisterPage = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [mobNumber, setMobNumber] = useState("");
  const [batch, setBatch] = useState("");
  const [gender, setGender] = useState("Male"); // Default gender value

  const handleRegister = async () => {
    console.log({ name, collegeId, mobNumber, gender, batch, email, password });
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !collegeId ||
      !mobNumber ||
      !batch ||
      !gender
    ) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await registerStudent(
        name,
        collegeId,
        mobNumber,
        gender,
        batch,
        email,
        password
      );

      if (response.success) {
        Alert.alert("Success", "Registration successful!", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Error", "Unable to register. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image
              source={require("../../../assets/images/rgulogo2.png")}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.title}>Mess Complaint Management System</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.heading}>Create New Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="College Id"
            value={collegeId}
            onChangeText={setCollegeId}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={mobNumber}
            onChangeText={setMobNumber}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Batch"
            value={batch}
            onChangeText={setBatch}
          />
          <Text style={styles.label}>Gender:</Text>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Ensures content grows within the ScrollView
  },
  container: {
    flex: 1,
    backgroundColor: "#e3f2fd",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1e88e5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    color: "#1e88e5",
    fontSize: 24,
    marginTop: 10,
    fontWeight: "bold",
  },
  formContainer: {
    alignItems: "center",
  },
  heading: {
    color: "#1565c0",
    fontSize: 30,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#90caf9",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  picker: {
    width: "100%",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#90caf9",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#1e88e5",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  linkText: {
    color: "#1e88e5",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  label: {
    width: "100%",
    color: "#1565c0",
    fontSize: 16,
    marginBottom: 5,
  },
});

export default RegisterPage;
