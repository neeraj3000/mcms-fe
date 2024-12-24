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
} from "../../../backend/representativesnew";
import { getUsersByUserIds } from "../../../backend/studentnew"; // Use named export

const ViewMessRepresentatives = () => {
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState("");
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchMesses = async () => {
      setLoading(true);
      try {
        const { success, messList, message } = await getAllMess();
        if (success) {
          setMesses(messList);
        } else {
          alert(`Error fetching messes: ${message}`);
        }
      } catch (error) {
        alert("An error occurred while fetching messes.");
      } finally {
        setLoading(false);
      }
    };

    fetchMesses();
  }, []);

  const fetchRepresentatives = async () => {
    if (!selectedMess) {
      alert("Please select a mess first.");
      return;
    }

    setLoading(true);
    setRepresentatives([]);

    try {
      const { success, representatives, error } =
        await getRepresentativesByMessNo(selectedMess);

      if (success) {
        const userIds = representatives
          .map((rep) => rep.userId)
          .filter(Boolean);

        const [studentResponse, userResponse] = await Promise.all([
          getStudentsByUserIds(userIds),
          getUsersByUserIds(userIds),
        ]);

        if (studentResponse.success && userResponse.success) {
          const enrichedRepresentatives = representatives.map((rep) => {
            const student = studentResponse.students.find(
              (student) => student.userId === rep.userId
            );
            const user = userResponse.users.find(
              (user) => user.userId === rep.userId
            );

            return {
              ...rep,
              name: student?.name || "N/A",
              mobileNo: student?.mobileNo || "N/A",
              gender: student?.gender || "N/A",
              batch: student?.batch || "N/A",
              email: user?.email || "N/A",
              role: user?.role || "N/A",
            };
          });

          setRepresentatives(enrichedRepresentatives);
          setIsModalVisible(true);
        } else {
          alert("Error fetching student/user data.");
        }
      } else {
        alert(`Error fetching representatives: ${error}`);
      }
    } catch (error) {
      alert("An error occurred while fetching representatives.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepresentative = async (representativeId) => {
    try {
      const { success, message } = await deleteRepresentativeById(
        representativeId
      );
      if (success) {
        setRepresentatives((prev) =>
          prev.filter((rep) => rep.mrId !== representativeId)
        );
        alert("Representative deleted successfully.");
      } else {
        alert(`Error deleting representative: ${message}`);
      }
    } catch (error) {
      alert("An error occurred while deleting the representative.");
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>View Mess Representatives</Text>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Select Mess</Text>
        <Picker
          selectedValue={selectedMess}
          style={styles.dropdown}
          onValueChange={(value) => setSelectedMess(value)}
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

      <Button title="Fetch Representatives" onPress={fetchRepresentatives} />

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
                <Text style={styles.modalTitle}>Representatives</Text>
                {representatives.length > 0 ? (
                  representatives.map((rep, index) => (
                    <View key={index} style={styles.representativeCard}>
                      <Text>Name: {rep.name}</Text>
                      <Text>Email: {rep.email}</Text>
                      <Text>Role: {rep.role}</Text>
                      <Button
                        title="Delete"
                        onPress={() => handleDeleteRepresentative(rep.mrId)}
                      />
                    </View>
                  ))
                ) : (
                  <Text>No representatives found.</Text>
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
