import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useSession } from "../../SessionContext";
import { createIssue } from "../../../backend/issuesnew"; // Import the Firebase function

const ReportIssue = () => {
  const { user } = useSession(); // Access session data
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [messNo, setMessNo] = useState("");
  const [image, setImage] = useState(null);

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

    try {
      const issueData = {
        description,
        category: issueType,
        image,
        userId: user.id,
        messNo: messNo,
      };

      const response = await createIssue(issueData); // Call Firebase function
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
    }
  }, [issueType, description, messNo, image, user]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Image
          source={require("../../../assets/images/issue-icon.png")} // Replace with your icon path
          style={styles.icon}
        />
      </View>
      <Text style={styles.title}>Report an Issue</Text>
      <Text style={styles.subtitle}>
        Please provide details about the issue you're facing.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Issue Type</Text>
        <TextInput
          style={styles.input}
          onChangeText={setIssueType}
          value={issueType}
          placeholder="Enter issue type"
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

      <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
        <Text style={styles.uploadButtonText}>
          {image ? "Change Image" : "Upload Image"}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.uploadedImage} />}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F5", // Light red to suggest an issue reporting theme
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#D32F2F", // Bold red to indicate seriousness
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
    borderBottomColor: "#E57373", // Accent underline for inputs
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#B71C1C", // Dark red for input labels
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFCDD2", // Subtle red for input borders
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#333",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#FF7043", // Orange for a secondary action
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
    borderColor: "#E57373",
  },
  submitButton: {
    backgroundColor: "#D32F2F", // Bold red for the primary action
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
