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
} from "react-native";
import axios from "axios";
import { useSession } from "../../SessionContext";
import RefreshButton from "../../components/RefreshButton"; // Import the RefreshButton component

const IssueHistory = () => {
  const [issueHistory, setIssueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const reraisedIssue = async (issueId) => {
    try {
      const response = await axios.put(
        `https://mcms-nseo.onrender.com/complaints/issues/status/${issueId}`,
        { status: "reraised" }
      );

      if (response.data.success) {
        setIssueHistory((prevIssues) =>
          prevIssues.map((issue) =>
            issue.id === issueId ? { ...issue, status: "reraised" } : issue
          )
        );
        Alert.alert("Success", "The issue has been reraised.");
      } else {
        Alert.alert("Error", "Unable to reraised the issue. Please try again later.");
      }
    } catch (error) {
      console.error("Error reraising issue:", error);
      Alert.alert("Error", "Unable to reraised the issue. Please try again later.");
    }
  };

  const renderModalContent = () => {
    if (!selectedIssue) return null;

    const isResolved = selectedIssue.status === "resolved";

    return (
      <ScrollView style={styles.modalContent}>
        <Text style={styles.modalCategory}>Category: {selectedIssue.category}</Text>
        <Text style={styles.modalDescription}>Description: {selectedIssue.description}</Text>
        {selectedIssue.image && (
          <Image source={{ uri: selectedIssue.image.url }} style={styles.issueImage} />
        )}
        {isResolved && (
          <View style={styles.reraisedContainer}>
            <Text style={styles.reraisedText}>
              This issue has been resolved. Would you like to reraised it?
            </Text>
            <View style={styles.reraisedButtons}>
              <TouchableOpacity
                style={styles.reraisedButton}
                onPress={() => reraisedIssue(selectedIssue.id)}
              >
                <Text style={styles.reraisedButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reraisedButton}
                onPress={closeModal}
              >
                <Text style={styles.reraisedButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Issue History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : issueHistory.length > 0 ? (
        issueHistory.map((item) => (
          <TouchableOpacity
            style={styles.issueItem}
            key={item.id} // Ensure the key is unique
            onPress={() => openModal(item)}
          >
            <Text style={styles.issueCategory}>Category: {item.category}</Text>
            <Text
              style={[
                styles.issueStatus,
                item.status === "resolved" && styles.resolvedStatus,
                item.status === "pending" && styles.pendingStatus,
                item.status === "reraised" && styles.reraisedStatus,
              ]}
            >
              Status: {item.status}
            </Text>
            <Text style={styles.issueDate}>
              Date:{" "}
              {new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noIssuesText}>No issues reported yet.</Text>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {renderModalContent()}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RefreshButton onRefresh={fetchIssueHistory} />
    </View>
  );
};

const styles = StyleSheet.create({
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
  issueItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  issueCategory: {
    fontSize: 16,
    fontWeight: "bold",
  },
  issueStatus: {
    fontSize: 14,
    marginTop: 5,
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
    marginTop: 5,
    color: "#888",
  },
  noIssuesText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
  },
  modalCategory: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  issueImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  reraisedContainer: {
    marginTop: 20,
  },
  reraisedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc3545",
  },
  reraisedButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  reraisedButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  reraisedButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default IssueHistory;
