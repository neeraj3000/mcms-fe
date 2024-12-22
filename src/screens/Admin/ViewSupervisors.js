import React, { useState, useEffect } from "react";
import { View, Text, Button, Modal } from "react-native";
import { getAllMess } from "../../../backend/messnew"; // Make sure this path is correct
import {
  getSupervisorsByMessId,
  deleteSupervisorById,
  updateSupervisorProfile,
} from "../../../backend/supervisornew"; // Same here for supervisor functions
import { Picker } from "@react-native-picker/picker";

const ViewMessSupervisor = () => {
  const [messes, setMesses] = useState([]);
  const [selectedMessId, setSelectedMessId] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  // Fetch messes from Firestore
  const fetchMesses = async () => {
    const result = await getAllMess();
    if (result.success) {
      setMesses(result.messList); // Set the fetched mess list
    } else {
      console.error("Failed to fetch messes:", result.message);
    }
  };

  // Fetch supervisors for the selected mess
  const fetchSupervisors = async (messId) => {
    const result = await getSupervisorsByMessId(messId);
    if (result.success) {
      setSupervisors(result.supervisors); // Set the fetched supervisors for the selected mess
    } else {
      console.error("Failed to fetch supervisors:", result.message);
    }
  };

  // Show modal to edit supervisor
  const handleEditSupervisor = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedSupervisor(null);
  };

  // Handle delete supervisor
  const handleDeleteSupervisor = async (supervisorId) => {
    const result = await deleteSupervisorById(supervisorId);
    if (result.success) {
      console.log("Supervisor deleted successfully");
      fetchSupervisors(selectedMessId); // Refresh supervisors after deletion
    } else {
      console.error("Failed to delete supervisor:", result.message);
    }
  };

  // Handle update supervisor details
  const handleUpdateSupervisor = async () => {
    const { supervisorId, name, mobileNo } = selectedSupervisor;
    const result = await updateSupervisorProfile(supervisorId, name, mobileNo);
    if (result.success) {
      console.log("Supervisor updated successfully");
      fetchSupervisors(selectedMessId); // Refresh supervisors after update
      closeModal();
    } else {
      console.error("Failed to update supervisor:", result.message);
    }
  };

  // Fetch messes when component mounts
  useEffect(() => {
    fetchMesses();
  }, []);

  // Fetch supervisors when selected mess changes
  useEffect(() => {
    if (selectedMessId) {
      fetchSupervisors(selectedMessId);
    }
  }, [selectedMessId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0", padding: 20 }}>
      {/* Dropdown for selecting mess */}
      <Text>Select a Mess:</Text>
      <Picker
        selectedValue={selectedMessId}
        onValueChange={(itemValue) => setSelectedMessId(itemValue)}
      >
        <Picker.Item label="Select a Mess" value={null} />
        {messes.map((mess, index) => (
          <Picker.Item
            key={mess.id || index} // Use mess.id if available, otherwise fallback to index
            label={mess.name}
            value={mess.messId}
          />
        ))}
      </Picker>

      {/* Button to fetch and show supervisors */}
      <Button
        title="Fetch Supervisors"
        onPress={() => fetchSupervisors(selectedMessId)}
      />

      {/* List of supervisors */}
      {supervisors.length > 0 ? (
        <View>
          {supervisors.map((supervisor, index) => (
            <View
              key={supervisor.supervisorId || index} // Use supervisor.supervisorId if available, otherwise fallback to index
              style={{ marginBottom: 10 }}
            >
              <Text>Name: {supervisor.name}</Text>
              <Text>Mobile: {supervisor.mobileNo}</Text>
              <Button
                title="Edit"
                onPress={() => handleEditSupervisor(supervisor)}
              />
              <Button
                title="Delete"
                onPress={() => handleDeleteSupervisor(supervisor.supervisorId)}
              />
            </View>
          ))}
        </View>
      ) : (
        <Text>No supervisors found</Text>
      )}

      {/* Modal for editing supervisor */}
      {isModalVisible && selectedSupervisor && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 10,
                width: "80%",
              }}
            >
              <Text>Edit Supervisor</Text>
              <Text>Name:</Text>
              <TextInput
                value={selectedSupervisor.name}
                onChangeText={(text) =>
                  setSelectedSupervisor({ ...selectedSupervisor, name: text })
                }
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
              />
              <Text>Mobile No:</Text>
              <TextInput
                value={selectedSupervisor.mobileNo}
                onChangeText={(text) =>
                  setSelectedSupervisor({
                    ...selectedSupervisor,
                    mobileNo: text,
                  })
                }
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
              />
              <Button title="Save" onPress={handleUpdateSupervisor} />
              <Button title="Cancel" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ViewMessSupervisor;
