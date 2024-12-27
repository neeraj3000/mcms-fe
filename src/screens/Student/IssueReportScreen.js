import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
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
    console.log(user);
    console.log(user.id);
    try {
      const issueData = {
        description,
        category:issueType,
        image,
        userId:user.id,
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
      <Text style={styles.title}>Report Issue</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Issue Type</Text>
        <TextInput
          style={styles.input}
          onChangeText={setIssueType}
          value={issueType}
          placeholder="Enter issue type"
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
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mess Number</Text>
        <TextInput
          style={styles.input}
          onChangeText={setMessNo}
          value={messNo}
          placeholder="Enter mess number"
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
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  uploadButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  uploadedImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#28A745",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ReportIssue;
