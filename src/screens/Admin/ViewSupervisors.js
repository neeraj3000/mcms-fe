import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getAllMess } from "../../../backend/messnew";
import {
  deleteSupervisorById,
  updateSupervisorProfile,
  getSupervisorsByMessId,
} from "../../../backend/supervisornew";
import Icon from "react-native-vector-icons/MaterialIcons";

const ViewMessSupervisor = () => {
  const [messes, setMesses] = useState([]);
  const [selectedMessId, setSelectedMessId] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  const fetchMesses = async () => {
    const result = await getAllMess();
    if (result.success) {
      setMesses(result.messList);
    } else {
      console.error("Failed to fetch messes:", result.message);
    }
  };

  const fetchSupervisors = async (messId) => {
    setSupervisors([]); // Clear previous supervisors
    if (!messId) return;
    const result = await getSupervisorsByMessId(String(messId));
    if (result.success) {
      setSupervisors(result.supervisors);
    } else {
      console.error("Failed to fetch supervisors:", result.message);
    }
  };

  const handleEditSupervisor = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedSupervisor(null);
  };

  const handleDeleteSupervisor = async (supervisorId) => {
    const result = await deleteSupervisorById(supervisorId);
    if (result.success) {
      fetchSupervisors(selectedMessId);
    } else {
      console.error("Failed to delete supervisor:", result.message);
    }
  };

  const handleUpdateSupervisor = async () => {
    const { supervisorId, name, mobileNo } = selectedSupervisor;
    const result = await updateSupervisorProfile(supervisorId, name, mobileNo);
    if (result.success) {
      fetchSupervisors(selectedMessId);
      closeModal();
    } else {
      console.error("Failed to update supervisor:", result.message);
    }
  };

  useEffect(() => {
    fetchMesses();
  }, []);

  useEffect(() => {
    fetchSupervisors(selectedMessId);
  }, [selectedMessId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Mess</Text>
      <Picker
        selectedValue={selectedMessId}
        onValueChange={(itemValue) => setSelectedMessId(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a Mess" value={null} />
        {messes.map((mess, index) => (
          <Picker.Item
            key={mess.id || index}
            label={mess.name}
            value={mess.messId}
          />
        ))}
      </Picker>

      {supervisors.length > 0 ? (
        <FlatList
          data={supervisors}
          keyExtractor={(item) => item.supervisorId.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.supervisorName}>{item.name}</Text>
                <Text style={styles.supervisorInfo}>
                  Mobile: {item.mobileNo}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => handleEditSupervisor(item)}>
                  <Icon name="edit" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteSupervisor(item.supervisorId)}
                  style={{ marginLeft: 10 }}
                >
                  <Icon name="delete" size={24} color="#FF3B30" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${item.mobileNo}`)}
                  style={{ marginLeft: 10 }}
                >
                  <Icon name="phone" size={24} color="#34C759" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noSupervisorsText}>
          {selectedMessId
            ? "No supervisors found for this mess."
            : "Please select a mess to view supervisors."}
        </Text>
      )}

      {isModalVisible && selectedSupervisor && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalHeader}>Edit Supervisor</Text>
              <TextInput
                value={selectedSupervisor.name}
                onChangeText={(text) =>
                  setSelectedSupervisor({ ...selectedSupervisor, name: text })
                }
                style={styles.input}
                placeholder="Name"
              />
              <TextInput
                value={selectedSupervisor.mobileNo}
                onChangeText={(text) =>
                  setSelectedSupervisor({
                    ...selectedSupervisor,
                    mobileNo: text,
                  })
                }
                style={styles.input}
                placeholder="Mobile No"
                keyboardType="phone-pad"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleUpdateSupervisor}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ViewMessSupervisor;

// Styles updated for modern UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  supervisorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  supervisorInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: "row",
  },
  noSupervisorsText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    fontSize: 16,
    padding: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  cancelButton: {
    color: "#FF3B30",
    fontWeight: "bold",
  },
});
