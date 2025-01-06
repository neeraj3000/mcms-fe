import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSession } from "../../SessionContext"; // Import context
import { loginUser } from "../../../backend/authnew";
import { registerIndieID, unregisterIndieDevice } from "native-notify";
import { PermissionsAndroid } from "react-native";

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useSession(); // Access the login function from context
  const [isLoading, setIsLoading] = useState(false); // State for activity indicator

  useEffect(async () => {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  }, []);
  // Handle user login
  const handleLogin = async () => {
    setIsLoading(true); // Show activity indicator before login request

    try {
      // Validate email and password
      if (!email || !password) {
        Alert.alert("Error", "Please fill in both email and password.");
        setIsLoading(false); // Hide activity indicator on error
        return;
      }

      // Fetch login response
      const response = await loginUser(email, password);

      if (!response.success) {
        Alert.alert("Error", "Invalid email or password.");
        setIsLoading(false); // Hide activity indicator on error
        return;
      }

      const user = response.user;

      // Save the session details
      login({
        email: user.email,
        role: user.role,
        name: user.name,
        id: user.userId, // Store the userId
      });
      registerIndieID(`${user.userId}`, 25949, "UuLEHJe9tNRmzE826jjCij");
      // Register for push notifications (only once)
      // ... (implementation details)

      // Navigate based on user role (only once)
      switch (user.role) {
        case "student":
          navigation.replace("StudentPage");
          break;
        case "representative":
          navigation.replace("MRPage");
          break;
        case "admin":
          navigation.replace("Admin");
          break;
        case "coordinator":
          navigation.replace("Coordinator");
          break;
        case "supervisor":
          navigation.replace("Supervisor");
          break;
        case "authority":
          navigation.replace("Authority");
          break;
        default:
          Alert.alert("Error", "Invalid role. Contact support.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Hide activity indicator after login attempt
    }
  };

  return (
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
        <Text style={styles.heading}>Login</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Wait a moment...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... your existing styles
  container: {
    flex: 1,
    backgroundColor: "#E3F2FD", // Light blue background
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    backgroundColor: "#007BFF", // Primary blue color
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  title: {
    color: "#007BFF", // Primary blue color
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  heading: {
    color: "#007BFF", // Primary blue color
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#90CAF9", // Light blue border
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF", // Primary blue color
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  linkText: {
    color: "#007BFF", // Primary blue color
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker blue background
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
});

export default LoginPage;
