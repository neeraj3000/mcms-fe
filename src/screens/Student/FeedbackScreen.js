import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSession } from "../../SessionContext"; // Adjust the path as necessary
import {
  getAllFeedbackOptions,
  createFeedbackReport,
} from "../../../backend/feedbacknew";
import { getStudentDetailsByUserId } from "../../../backend/studentnew";

const FeedbackForm = () => {
  const [isFeedbackEnabled, setIsFeedbackEnabled] = useState(false);
  const [feedbackFields, setFeedbackFields] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [messNumber, setMessNumber] = useState(null);
  const [feedbackDuration, setFeedbackDuration] = useState("");
  const [comment, setComment] = useState("");
  const { user } = useSession(); // Access session data

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details
        const userDetails = await getStudentDetailsByUserId(user.id);
        setMessNumber(userDetails.messId);
        setIsFeedbackEnabled(userDetails.isFeedback);

        // Fetch feedback fields
        const feedbackOptions = await getAllFeedbackOptions();
        const lastTwoFields = feedbackOptions.options.slice(-2);
        setFeedbackFields(feedbackOptions.options.slice(0, -2));
        const duration = `${lastTwoFields[0]} - ${lastTwoFields[1]}`;
        setFeedbackDuration(duration);

        // Initialize feedback state
        const initialFeedback = feedbackOptions.options.reduce(
          (acc, field) => ({ ...acc, [field]: null }),
          {}
        );
        setFeedback({
          ...initialFeedback,
          FeedbackDuration: duration,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load feedback data. Please try again.");
      }
    };

    fetchData();
  }, [isFeedbackEnabled]);

  const handleRatingChange = (field, rating) => {
    setFeedback((prev) => ({
      ...prev,
      [field]: rating,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User is not logged in. Please login again.");
      return;
    }

    if (!feedbackDuration) {
      Alert.alert("Error", "Feedback duration is not set.");
      return;
    }

    Alert.alert(
      "Confirmation",
      "Are you sure you want to submit the feedback?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // Remove null values from feedback object
              const filteredFeedback = Object.fromEntries(
                Object.entries(feedback).filter(([_, value]) => value !== null)
              );

              // Add comment to the filtered feedback
              const feedbackData = { ...filteredFeedback, comment };

              // Call the API to submit the feedback
              await createFeedbackReport(user.id, messNumber, feedbackData);

              Alert.alert("Success", "Feedback successfully submitted!");
              setShowForm(false); // Hide the form after submission
            } catch (error) {
              console.error("Error submitting feedback:", error);
              Alert.alert(
                "Error",
                "There was an issue submitting your feedback. Please try again."
              );
            }
          },
        },
      ]
    );
  };


  const isSubmitDisabled = () => {
    return feedbackFields.some((field) => feedback[field] === null);
  };

  return (
    <View style={styles.container}>
      {messNumber === null ? (
        <View style={styles.centeredMessage}>
          <Text style={styles.centeredMessageText}>Mess is not assigned</Text>
        </View>
      ) : !isFeedbackEnabled ? (
        <View style={styles.centeredMessage}>
          <Text style={styles.centeredMessageText}>
            You have already submitted the feedback.
          </Text>
        </View>
      ) : !showForm ? (
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.feedbackButtonText}>Give Feedback</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.messNumberText}>Mess Number: {messNumber}</Text>
          <Text style={styles.feedbackDurationText}>
            Feedback Duration: {feedbackDuration}
          </Text>

          <View style={styles.card}>
            {feedbackFields.map((field) => (
              <View style={styles.fieldRow} key={field}>
                <Text style={styles.fieldLabel}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Text>
                <Picker
                  selectedValue={feedback[field]}
                  style={styles.picker}
                  onValueChange={(rating) => handleRatingChange(field, rating)}
                >
                  <Picker.Item label="Select Rating" value={null} />
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Picker.Item
                      key={rating}
                      label={String(rating)}
                      value={rating}
                    />
                  ))}
                </Picker>
              </View>
            ))}
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.fieldLabel}>
              Additional Comments (Optional)
            </Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Write your comments here..."
              multiline
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitDisabled() && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled()}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Style definitions remain the same as your initial code.
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff", // Light blue background
    padding: 20,
  },
  centeredMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredMessageText: {
    color: "#888", // Grey color
    fontSize: 18,
    fontWeight: "500",
  },
  feedbackButton: {
    backgroundColor: "#007BFF", // Primary blue color
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  feedbackButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  form: {
    paddingBottom: 30,
  },
  messNumberText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  feedbackDurationText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  fieldRow: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  picker: {
    height: 60,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    color: "#333",
  },
  commentSection: {
    marginBottom: 20,
  },
  commentInput: {
    height: 100,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 16,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#007BFF", // Primary blue color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default FeedbackForm;
