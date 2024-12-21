// ProfilePage.js

import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useSession } from "@/src/SessionContext"; // Assuming you have a SessionContext for managing user
import { getStudentById } from "../../../backend/studentnew"; // Assuming this function exists
import { useNavigation } from "@react-navigation/native"; // For navigation to login screen

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
      <Text style={styles.title}>Profile</Text>
      {studentProfile ? (
        <View style={styles.profileInfo}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Name:</Text> {studentProfile.name}
          </Text>
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
        <Text>No profile information available.</Text>
      )}
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
  },
  profileInfo: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
});

export default ProfilePage;
