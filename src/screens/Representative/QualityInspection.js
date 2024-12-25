import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useSession } from "../../SessionContext";
import {
  getRepresentativeByUserId,
  getMrIdByUserId,
} from "../../../backend/representativesnew";
import {
  getInspectOptions,
  createInspectionReport,
} from "../../../backend/inspectionnew";

const QualityInspectionPage = () => {
  const { user } = useSession();
  const [ratings, setRatings] = useState({});
  const [options, setOptions] = useState([]);
  const [comments, setComments] = useState("");
  const [messNo, setMessNo] = useState(null);
  const [image, setImage] = useState(null);
  const [inspectionAllowed, setInspectionAllowed] = useState(false); // Inspection status
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger re-renders
  const [date, setDate] = useState("");

  // Fetch inspection options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        if (!user || !user.id) {
          return;
        }

        const res = await getRepresentativeByUserId(user.id);
        if (res.success) {
          const details = res.representative;
          setMessNo(details.messNo.toString());

          if (!details.inspectionStatus) {
            setInspectionAllowed(false); // Restrict rendering
            Alert.alert("Notice", "Inspection is not allowed at this time.");
            return;
          }

          setInspectionAllowed(true);

          const response = await getInspectOptions(details.messNo.toString());

          if (response.success) {
            const fetchedOptions = response.options;
            setOptions(fetchedOptions);
            setDate(fetchedOptions[fetchedOptions.length-1]);
            setRatings(
              fetchedOptions.reduce((acc, option) => {
                acc[option] = 1; // Default rating of 1
                return acc;
              }, {})
            );
          } else {
            Alert.alert(
              "Error",
              response.message || "Failed to fetch inspection options."
            );
          }
        } else {
          Alert.alert(
            "Error",
            res.message || "Failed to fetch representative details."
          );
        }
      } catch (error) {
        Alert.alert("Error", "An error occurred while fetching data.");
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, [user, refreshKey]); // Depend on refreshKey to trigger re-fetch

  const handleRatingChange = (category, value) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [category]: parseInt(value),
    }));
  };

  const handleImagePick = async () => {
    try {
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
      Alert.alert("Error", "Failed to pick an image.");
      console.error("Image picker error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!messNo) {
      Alert.alert("Error", "Mess Number is missing.");
      return;
    }

    if (!user || !user.id) {
      return;
    }

    try {
      const res = await getMrIdByUserId(user.id);
      const response = await createInspectionReport(
        res.mrId,
        messNo,
        image,
        ratings,
        date,
      );

      if (response.success) {
        Alert.alert("Success", "Quality inspection submitted successfully!");
        setRatings(
          options.reduce((acc, option) => {
            acc[option] = 1; // Reset to default rating
            return acc;
          }, {})
        );
        setComments("");
        setImage(null);
        setRefreshKey((prevKey) => prevKey + 1); // Trigger re-fetch
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to submit inspection."
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while submitting the data.");
      console.error("Error submitting inspection:", error);
    }
  };

  if (!inspectionAllowed) {
    return (
      <View style={styles.container}>
        <Text style={styles.noticeText}>
          Inspection is currently not allowed. Please check back later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quality Inspection</Text>

      <TextInput
        style={styles.input}
        placeholder="Mess Number"
        value={messNo}
        editable={false} // Mess number is fetched automatically
      />

      {options.slice(0, options.length - 1).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{category}</Text>

          {/* Render RNPickerSelect for all options except the last one */}
          <RNPickerSelect
            onValueChange={(value) => handleRatingChange(category, value)}
            items={[...Array(10).keys()].map((num) => ({
              label: `${num + 1}`,
              value: num + 1,
            }))}
            style={pickerSelectStyles}
            value={ratings[category]}
          />
        </View>
      ))}

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Comments"
        value={comments}
        onChangeText={setComments}
        multiline
      />

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity onPress={handleImagePick} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>
          {image ? "Change Image" : "Upload Image"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
    justifyContent: "center",
  },
  nonEditableInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f5f5f5", // Optional for a "disabled" look
  },

  noticeText: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "black",
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "black",
    marginBottom: 15,
    backgroundColor: "#fff",
  },
});

export default QualityInspectionPage;
