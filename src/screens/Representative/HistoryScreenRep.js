import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { useSession } from "../../SessionContext";
import RefreshButton from "../../components/RefreshButton";

const IssueHistoryRep = () => {
  const [issueHistory, setIssueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedIssue, setEditedIssue] = useState({});
  const { user } = useSession();

  const fetchIssueHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `https://mcms-nseo.onrender.com/complaints/issues/user/${user.id}`
      );
      if (response.data.success && Array.isArray(response.data.issues)) {
        setIssueHistory(response.data.issues);
      } else {
        Alert.alert("Error", "No valid issues found.");
      }
    } catch (error) {
      console.error("Error fetching issue history:", error);
      Alert.alert("Error", "Unable to fetch issue history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueHistory();
  }, []);

  const openModal = (issue) => {
    setSelectedIssue(issue);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setIsModalVisible(false);
  };

  const openEditModal = () => {
    setEditedIssue({ ...selectedIssue });
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditedIssue({});
    setIsEditModalVisible(false);
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `https://mcms-nseo.onrender.com/complaints/issues/${editedIssue.id}`,
        editedIssue
      );
      if (response.data.success) {
        setIssueHistory((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === editedIssue.id ? { ...editedIssue } : issue
          )
        );
        closeEditModal();
        closeModal();
        Alert.alert("Success", "The issue has been updated.");
      } else {
        Alert.alert("Error", "Unable to update the issue. Please try again later.");
      }
    } catch (error) {
      console.error("Error updating issue:", error);
      Alert.alert("Error", "Unable to update the issue. Please try again later.");
    }
  };

  const confirmDeleteIssue = (issueId) => {
    Alert.alert(
      "Delete Issue",
      "Are you sure you want to delete this issue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteIssue(issueId),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteIssue = async (issueId) => {
    try {
      const response = await axios.delete(
        `https://mcms-nseo.onrender.com/complaints/issues/${issueId}`
      );
      if (response.data.success) {
        setIssueHistory((prevIssues) =>
          prevIssues.filter((issue) => issue.id !== issueId)
        );
        closeModal();
        Alert.alert("Success", "The issue has been deleted.");
      } else {
        Alert.alert("Error", "Unable to delete the issue. Please try again later.");
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      Alert.alert("Error", "Unable to delete the issue. Please try again later.");
    }
  };

  const renderModalContent = () => {
    if (!selectedIssue) return null;

    return (
      <ScrollView contentContainerStyle={styles.modalScrollContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalCategory}>Category: {selectedIssue.category}</Text>
          {selectedIssue.status !== "resolved" && (
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={openEditModal}>
                <Icon name="edit" size={24} color="grey" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDeleteIssue(selectedIssue.id)}>
                <Icon name="delete" size={24} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={closeModal}>
            <Icon name="close" size={30} color="grey" style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalDescription}>
          Description: {selectedIssue.description}
        </Text>
        {selectedIssue.image && (
          <Image source={{ uri: selectedIssue.image.url }} style={styles.issueImage} />
        )}
      </ScrollView>
    );
  };

  const renderIssueItem = (issue) => {
    return (
      <TouchableOpacity
        style={styles.issueItem}
        onPress={() => openModal(issue)}
      >
        <Text style={styles.issueCategory}>Category: {issue.category}</Text>
        <Text
          style={[
            styles.issueStatus,
            issue.status === "resolved" && styles.resolvedStatus,
            issue.status === "pending" && styles.pendingStatus,
            issue.status === "reraised" && styles.reraisedStatus,
          ]}
        >
          Status: {issue.status}
        </Text>
        <Text style={styles.issueDate}>
          Date:{" "}
          {new Date(issue.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Issue History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : issueHistory.length > 0 ? (
        <ScrollView contentContainerStyle={styles.issueList}>
          {issueHistory.map((item) => renderIssueItem(item))}
        </ScrollView>
      ) : (
        <Text style={styles.noIssuesText}>No issues reported yet.</Text>
      )}

      {/* First Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>{renderModalContent()}</View>
        </View>
      </Modal>

      {/* Second Modal (Edit Issue) */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeicon}
              onPress={closeEditModal}
            >
              <Icon name="close" size={24} color="grey" />
            </TouchableOpacity>
            <Text style={styles.modalHeading}>Edit Issue</Text>
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={editedIssue.category}
              onChangeText={(text) =>
                setEditedIssue((prev) => ({ ...prev, category: text }))
              }
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description"
              multiline
              value={editedIssue.description}
              onChangeText={(text) =>
                setEditedIssue((prev) => ({ ...prev, description: text }))
              }
            />
            <TouchableOpacity style={styles.uploadImageButton}>
              <Text style={styles.uploadImageButtonText}>Update Image (Optional)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleSaveChanges}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RefreshButton onRefresh={fetchIssueHistory} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Container and general styles
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F0F8FF",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  issueList: {
    marginBottom: 20,
  },
  issueItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  issueCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  issueStatus: {
    fontSize: 14,
    marginVertical: 5,
  },
  resolvedStatus: {
    color: "green",
  },
  pendingStatus: {
    color: "orange",
  },
  reraisedStatus: {
    color: "red",
  },
  issueDate: {
    fontSize: 12,
    color: "#888",
  },
  noIssuesText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },

  // Modal and edit modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    width: "90%", // Increased width
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalCategory: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  icon: {
    marginRight: 15,
    top: -3,
  },
  modalDescription: {
    fontSize: 16,
    marginTop: 10,
    color: "#555",
  },
  issueImage: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  closeIcon: {
    position: "absolute",
    top: -19,
    right: -6,
  },
  closeicon: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  // Edit modal styles
  modalHeading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  uploadImageButton: {
    paddingVertical: 10,
    backgroundColor: "#28a745",
    borderRadius: 8,
    alignItems: "center",
  },
  uploadImageButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  confirmButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default IssueHistoryRep;