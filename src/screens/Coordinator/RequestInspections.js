import React, { useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "react-native-paper";
import { updateInspectionStatusAndDescription } from "../../../backend/inspectionnew";
import { addMultipleInspectOptions } from "../../../backend/inspectionnew";

const RequestInspection = () => {
  const [selectedMess, setSelectedMess] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inspectionOptions, setInspectionOptions] = useState([
    "Quality and Expiry",
    "Standards of Materials",
    "Staff and Food Adequacy",
    "Menu Discrepancies",
    "Supervisor Updates",
    "Food Taste and Quality",
    "Kitchen Hygiene",
    "Utensil Cleanliness",
    "Service Timings Adherence",
    "Comments",
  ]);
  const [newOption, setNewOption] = useState("");
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [date, setDate] = useState(""); // State for inspection date

  useEffect(() => {
    // Automatically set today's date when the component loads
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const messOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleCheckboxToggle = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleAddField = () => {
    if (newOption.trim() !== "" && !inspectionOptions.includes(newOption)) {
      setInspectionOptions([...inspectionOptions, newOption]);
      setNewOption("");
    } else {
      alert("Please enter a valid and unique field name.");
    }
  };

  const handleRequestInspection = async () => {
    setConfirmationVisible(false);
    if (selectedMess && description && selectedOptions.length > 0) {
      try {
        const messId = parseInt(selectedMess);
        console.log(messId, description, selectedOptions, date);

        const result = await updateInspectionStatusAndDescription(
          messId,
          description
        );
        console.log(result);
        console.log(selectedOptions)
        const optionsWithDate = [
          ...selectedOptions,
          date,
        ];
        console.log("heyy")
        console.log(optionsWithDate)
        const response = await addMultipleInspectOptions(
          messId.toString(),
          optionsWithDate,
        );
        console.log(response);
        if (result.success && response.success) {
          alert(result.message);
          setSelectedOptions([]);
          setDescription("");
          setSelectedMess("");
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while requesting the inspection.");
      }
    } else {
      alert(
        "Please select a mess, enter a description, and inspection criteria."
      );
    }
  };

  const showConfirmationModal = () => {
    if (selectedMess && description && selectedOptions.length > 0) {
      setConfirmationVisible(true);
    } else {
      alert(
        "Please select a mess, enter a description, and inspection criteria."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request Inspection</Text>

      <View style={styles.formItem}>
        <Text style={styles.label}>Select Mess:</Text>
        <Picker
          selectedValue={selectedMess}
          onValueChange={(itemValue) => setSelectedMess(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Mess" value="" />
          {messOptions.map((mess, index) => (
            <Picker.Item key={index} label={mess} value={mess} />
          ))}
        </Picker>
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter description here"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Inspection Date:</Text>
        <Text style={styles.dateField}>{date}</Text> 
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>Inspection Criteria:</Text>
        {inspectionOptions.map((option, index) => (
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

      <Button
        title="Request Inspection"
        onPress={showConfirmationModal}
        color="#007bff"
      />

      <Modal
        transparent={true}
        visible={confirmationVisible}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Request</Text>
            <Text style={styles.modalText}>
              Are you sure you want to request an inspection on {date} with the
              selected options?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRequestInspection}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Other styles
  dateField: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    backgroundColor: "#e9ecef",
    color: "#6c757d",
  },

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
  picker: {
    height: 50,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  input: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    textAlignVertical: "top",
    backgroundColor: "#fff",
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

export default RequestInspection;
