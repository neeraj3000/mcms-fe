import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { createMessSurvey } from "../../../backend/authoritynew";

const MessInspectionScreen = () => {
  const [messNumber, setMessNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [image, setImage] = useState(null);

  const currentDateTime = new Date().toLocaleString();

  // Function to pick an image
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!messNumber || !image) {
      alert("Please fill all the required fields (Mess Number and Image).");
      return;
    }

    const inspectionData = {
      messNo: messNumber,
      remarks,
      imageUrl: image,
      datetime: currentDateTime,
    };

    const response = await createMessSurvey(
      inspectionData.messNo,
      inspectionData.remarks,
      inspectionData.imageUrl,
      inspectionData.datetime
    );

    if (response.success) {
      alert("Inspection submitted successfully!");
    } else {
      alert("Failed to submit inspection: " + response.message);
    }

    setMessNumber("");
    setRemarks("");
    setImage(null);
  };

  const discardImage = () => {
    setImage(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mess Inspection</Text>

      <Text style={styles.label}>Mess Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Mess Number"
        keyboardType="numeric"
        value={messNumber}
        onChangeText={setMessNumber}
      />

      <Text style={styles.label}>Remarks (Optional)</Text>
      <TextInput
        style={[styles.input, styles.remarksInput]}
        placeholder="Enter your remarks"
        multiline={true}
        value={remarks}
        onChangeText={setRemarks}
      />

      <Text style={styles.label}>Upload Live Image</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Capture Image</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.closeIcon} onPress={discardImage}>
            <Ionicons name="close-circle" size={30} color="#ff0000" />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.timestamp}>Time & Date: {currentDateTime}</Text>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Inspection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  remarksInput: {
    height: 100,
    textAlignVertical: "top",
  },
  imageButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  timestamp: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MessInspectionScreen;
