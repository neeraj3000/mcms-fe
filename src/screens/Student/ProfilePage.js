// ProfilePage.js

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSession } from "@/src/SessionContext"; // Assuming you have a SessionContext for managing user
import { getStudentById } from "../../../backend/studentnew"; // Assuming this function exists
import { useNavigation } from "@react-navigation/native"; // For navigation to login screen
import Icon from "react-native-vector-icons/AntDesign"; // Importing AntDesign for the edit icon

const ProfilePage = () => {
  const { user } = useSession(); // Get user info from session context
  const navigation = useNavigation(); // To navigate to the login screen
  const [studentProfile, setStudentProfile] = useState(null); // State to hold the student profile
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Check if user exists before attempting to fetch data
    if (!user || !user.id) {
      setLoading(false);
      setError("You need to log in to access the profile.");
      return;
    }

    const fetchStudentProfile = async () => {
      try {
        const response = await getStudentById(user.id); // Fetch student profile based on userId
        if (response.success) {
          setStudentProfile(response.student); // Set student profile data
        }
      } catch (err) {
        setError(err.message); // Set error message if an error occurs
      } finally {
        setLoading(false); // Set loading to false after fetching is done
      }
    };

    fetchStudentProfile(); // Call the function to fetch student profile
  }, [user]); // Depend on `user` to trigger effect when user state changes

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    // If user is not logged in, show an error and redirect to login page
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.infoText}>Redirecting to login page...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      {studentProfile ? (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Icon name="edit" size={24} color="#007bff" />
          </TouchableOpacity>

          <Image
            source={require("../../../assets/images/profile.jpg")}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{studentProfile.name}</Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>College ID:</Text>{" "}
            {studentProfile.collegeId}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Mobile No:</Text>{" "}
            {studentProfile.mobileNo}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Gender:</Text> {studentProfile.gender}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Batch:</Text> {studentProfile.batch}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Mess ID:</Text>{" "}
            {studentProfile.messId || "Not assigned"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>User ID:</Text> {studentProfile.userId}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Created At:</Text>{" "}
            {studentProfile.createdAt.toDate().toLocaleString()}
          </Text>
        </View>
      ) : (
        <Text style={styles.noProfileText}>
          No profile information available.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f7fc", // Soft background color
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
    marginBottom: 20,
    position: "relative", // To position the edit button on top right
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Slight background to make it stand out
    borderRadius: 50,
    elevation: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#007bff",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 12,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
    color: "#007bff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
    marginBottom: 20,
  },
  noProfileText: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ProfilePage;
