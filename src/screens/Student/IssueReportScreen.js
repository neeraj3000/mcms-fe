import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator, // Import ActivityIndicator for the loading spinner
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useSession } from "../../SessionContext";
import { createIssue } from "../../../backend/issuesnew";

const ReportIssue = () => {
  const { user } = useSession(); // Access session data
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [messNo, setMessNo] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state to track submission progress

  useEffect(() => {
    if (!user) {
      Alert.alert("Unauthenticated", "Please log in to report an issue.");
    }
  }, [user]);

  const handleImageUpload = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        return Alert.alert(
          "Permission Denied",
          "Media library access is required."
        );
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const compressedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImage(compressedImage.uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image.");
      console.error(error);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!issueType || !description || !messNo) {
      return Alert.alert("Error", "Please fill in all the fields.");
    }

    setLoading(true); // Set loading to true when submission starts

    try {
      const issueData = {
        description,
        category: issueType,
        image,
        userId: user.id,
        messNo: messNo,
      };

      const response = await createIssue(issueData);
      if (response.success) {
        Alert.alert("Success", "Your issue has been reported.");
        setIssueType("");
        setDescription("");
        setMessNo("");
        setImage(null);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to report the issue.");
      console.error(error);
    } finally {
      setLoading(false); // Reset loading state after the action is complete
    }
  }, [issueType, description, messNo, image, user]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Image
            source={require("../../../assets/images/issue-icon.png")}
            style={styles.icon}
          />
        </View>
        <Text style={styles.title}>Report an Issue</Text>
        <Text style={styles.subtitle}>
          Please provide details about the issue you're facing.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Issue Title</Text>
          <TextInput
            style={styles.input}
            onChangeText={setIssueType}
            value={issueType}
            placeholder="Enter issue title"
            placeholderTextColor="#B0BEC5"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            onChangeText={setDescription}
            value={description}
            placeholder="Describe the issue"
            placeholderTextColor="#B0BEC5"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mess Number</Text>
          <TextInput
            style={styles.input}
            onChangeText={setMessNo}
            value={messNo}
            placeholder="Enter mess number"
            placeholderTextColor="#B0BEC5"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleImageUpload}
        >
          <Text style={styles.uploadButtonText}>
            {image ? "Change Image" : "Upload Image"}
          </Text>
        </TouchableOpacity>

        {image && (
          <Image source={{ uri: image }} style={styles.uploadedImage} />
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" /> // Loading indicator while submitting
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading} // Disable submit button during loading
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#B3E5FC",
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#1565C0",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#BBDEFB",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#333",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  uploadedImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  submitButton: {
    backgroundColor: "#1976D2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});

export default ReportIssue;
