import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Modal,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getAllMess } from "../../../backend/messnew";
import {
  deleteRepresentativeById,
  getRepresentativesByMessNo,
  getStudentsByUserIds,
} from "../../../backend/representativesnew"; // Import the required functions

const ViewMessRepresentatives = () => {
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState("");
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch all messes when the component mounts
  const fetchMesses = async () => {
    const { success, messList, message } = await getAllMess();
    if (success) {
      setMesses(messList);
    } else {
      console.error(message);
    }
  };

  // Fetch representatives for the selected mess
  const fetchRepresentatives = async () => {
    if (!selectedMess) {
      alert("Please select a mess first.");
      return;
    }

    setLoading(true);
    setRepresentatives([]);

    const { success, representatives, error } =
      await getRepresentativesByMessNo(selectedMess);
    if (success) {
      // Extract userIds from representatives
      const userIds = representatives
        .map((rep) => rep.userId)
        .filter((userId) => userId); // Filter out undefined or invalid userIds

      if (userIds.length === 0) {
        alert("No valid userIds found for the representatives.");
        setLoading(false);
        return;
      }

      // Now fetch detailed student information using the valid userIds
      const studentResponse = await getStudentsByUserIds(userIds);

      if (studentResponse.success) {
        const enrichedRepresentatives = representatives.map((rep) => {
          const student = studentResponse.students.find(
            (student) => student.userId === rep.userId
          );
          return {
            ...rep,
            mobileNo: student?.mobileNo,
            gender: student?.gender,
            batch: student?.batch,
          };
        });

        setRepresentatives(enrichedRepresentatives); // Set the representatives with additional details
      } else {
        alert(`Error fetching student details: ${studentResponse.error}`);
      }

      setIsModalVisible(true); // Open the modal after fetching data
    } else {
      alert(`Error: ${error}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMesses();
  }, []);

  // Handle deleting a representative
  const handleDeleteRepresentative = async (representativeId) => {
    const { success, message } = await deleteRepresentativeById(
      representativeId
    );
    if (success) {
      setRepresentatives(
        representatives.filter((rep) => rep.mrId !== representativeId)
      );
      alert("Representative deleted successfully.");
    } else {
      alert(`Error deleting representative: ${message}`);
    }
  };

  // Close the modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>View Mess Representatives</Text>

      {/* Dropdown for selecting a mess */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Select Mess</Text>
        <Picker
          selectedValue={selectedMess}
          style={styles.dropdown}
          onValueChange={(value) => {
            console.log("Selected Mess:", value); // Debugging log
            setSelectedMess(value);
          }}
        >
          <Picker.Item label="Select Mess" value="" />
          {messes.map((mess) => (
            <Picker.Item
              key={mess.messId}
              label={mess.name}
              value={mess.messId}
            />
          ))}
        </Picker>
      </View>

      {/* Button to fetch representatives */}
      <Button
        title="Fetch Representatives"
        onPress={fetchRepresentatives}
        color="#007BFF"
      />

      {/* Modal for displaying representatives */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#007BFF" />
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  Representatives of Mess {selectedMess}
                </Text>
                {representatives.length > 0 ? (
                  representatives.map((representative, index) => (
                    <View key={index} style={styles.representativeCard}>
                      <Text style={styles.representativeText}>
                        Name: {representative.name}
                      </Text>
                      <Text style={styles.representativeText}>
                        Email: {representative.email}
                      </Text>
                      <Text style={styles.representativeText}>
                        Role: {representative.role}
                      </Text>
                      <Text style={styles.representativeText}>
                        Mobile No: {representative.mobileNo}
                      </Text>
                      <Text style={styles.representativeText}>
                        Gender: {representative.gender}
                      </Text>
                      <Text style={styles.representativeText}>
                        Batch: {representative.batch}
                      </Text>
                      <View style={styles.actionButtons}>
                        <Button
                          title="Edit"
                          onPress={() =>
                            alert("Edit feature not implemented yet")
                          }
                        />
                        <Button
                          title="Delete"
                          onPress={() =>
                            handleDeleteRepresentative(representative.mrId)
                          }
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>
                    No representatives found.
                  </Text>
                )}
                <Button title="Close" onPress={closeModal} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e3f2fd",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "center",
    marginBottom: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#B0BEC5",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 15,
    textAlign: "center",
  },
  representativeCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#007BFF",
    elevation: 2,
  },
  representativeText: {
    fontSize: 16,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
});

export default ViewMessRepresentatives;
