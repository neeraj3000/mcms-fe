import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Checkbox } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

const RequestFeedback = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [FeedbackOptions, setFeedbackOptions] = useState([
    "TimelinessOfService",
    "CleanlinessOfDiningHall",
    "FoodQuality",
    "QuantityOfFood",
    "CourtesyOfStaff",
    "StaffHygiene",
    "MenuAdherence",
    "WashAreaCleanliness",
    "Comments",
  ]);
  const [newOption, setNewOption] = useState("");
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState("");

  const handleCheckboxToggle = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleAddField = () => {
    if (newOption.trim() !== "" && !FeedbackOptions.includes(newOption)) {
      setFeedbackOptions([...FeedbackOptions, newOption]);
      setNewOption("");
    } else {
      alert("Please enter a valid and unique field name.");
    }
  };

  const handleRequestFeedback = () => {
    setConfirmationVisible(false);
    if (selectedOptions.length > 0) {
      console.log("Feedback Requested for:", selectedOptions);
      setSelectedOptions([]);
      setStartDate(null);
      setEndDate(null);
      alert("Feedback request sent successfully!");
    } else {
      alert("Please select at least one Feedback criterion.");
    }
  };

  const showDatePickerHandler = (type) => {
    setDateType(type);
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (dateType === "start") {
        setStartDate(selectedDate);
      } else if (dateType === "end") {
        setEndDate(selectedDate);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request Feedback</Text>

      {/* Feedback Criteria */}
      <View style={styles.formItem}>
        <Text style={styles.label}>Feedback Criteria:</Text>
        {FeedbackOptions.map((option, index) => (
          <View key={index} style={styles.checkboxContainer}>
            <Checkbox
              status={
                selectedOptions.includes(option) ? "checked" : "unchecked"
              }
              onPress={() => handleCheckboxToggle(option)}
            />
            <Text style={styles.checkboxLabel}>{option}</Text>
          </View>
        ))}
        <View style={styles.addFieldContainer}>
          <TextInput
            style={styles.addFieldInput}
            placeholder="Add new field"
            value={newOption}
            onChangeText={(text) => setNewOption(text)}
          />
          <Button title="Add" onPress={handleAddField} color="#28a745" />
        </View>
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Start Date:</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => showDatePickerHandler("start")}
        >
          <Text style={styles.dateText}>
            {startDate ? startDate.toDateString() : "Select Start Date"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>End Date:</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => showDatePickerHandler("end")}
        >
          <Text style={styles.dateText}>
            {endDate ? endDate.toDateString() : "Select End Date"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Request Feedback Button */}
      <Button
        title="Request Feedback"
        onPress={() => setConfirmationVisible(true)}
        color="#007bff"
      />

      {/* Confirmation Modal */}
      <Modal
        transparent={true}
        visible={confirmationVisible}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Request</Text>
            <Text style={styles.modalText}>
              Are you sure you want to request feedback with the selected
              options and dates?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRequestFeedback}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmationVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  formItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  addFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addFieldInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    width: 100,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#28a745",
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RequestFeedback;
