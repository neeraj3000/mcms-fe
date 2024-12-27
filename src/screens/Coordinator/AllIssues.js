import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import RefreshButton from "../../components/RefreshButton"; // Import RefreshButton component
import { getAllIssues } from "../../../backend/issuesnew";

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedMess, setSelectedMess] = useState("all");

  const colors = {
    primary: "#007bff",
    lightGray: "#f2f2f2",
    darkGray: "#888",
    white: "#fff",
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await getAllIssues();
      if (response.success) {
        const issuesData = response.issues;
        const filteredIssues =
          selectedMess === "all"
            ? issuesData
            : issuesData.filter((issue) => issue.messNo === selectedMess);
        setIssues(filteredIssues);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedMess]);

  const openModal = (issue) => {
    setSelectedIssue(issue);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setModalVisible(false);
  };

  const refreshIssues = () => {
    setPage(1);
    setHasMore(true);
    setIssues([]);
    fetchIssues();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Issues</Text>

      <Picker
        selectedValue={selectedMess}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedMess(itemValue)}
      >
        <Picker.Item label="All Messes" value="all" />
        {[...Array(8).keys()].map((i) => (
          <Picker.Item
            key={i + 1}
            label={`Mess ${i + 1}`}
            value={(i + 1).toString()}
          />
        ))}
      </Picker>

      <RefreshButton onRefresh={refreshIssues} />

      <FlatList
        data={issues}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.issueItem}
            onPress={() => openModal(item)}
          >
            <Text style={styles.issueTitle}>{item.description}</Text>
            <Text style={styles.issueStatus}>{item.status}</Text>
            <View style={styles.voteContainerNone}>
              <Text style={styles.voteTextRight}>
                🚀 {item.upvotes || 0} 💥 {item.downvotes || 0}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : null
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedIssue && (
              <>
                <Text style={styles.modalTitle}>Issue Details</Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Category:</Text>{" "}
                  {selectedIssue.category || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Description:</Text>{" "}
                  {selectedIssue.description}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Mess No:</Text>{" "}
                  {selectedIssue.messNo}
                </Text>
                {selectedIssue.image ? (
                  <Image
                    source={{ uri: selectedIssue.image }}
                    style={styles.modalImage}
                  />
                ) : (
                  <Text style={styles.noImageText}>No Image Available</Text>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  issueItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  issueStatus: {
    fontSize: 14,
    color: "#888",
  },
  voteContainerNone: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  voteTextRight: {
    fontSize: 14,
    color: "#007bff",
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
    borderRadius: 8,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalLabel: {
    fontWeight: "bold",
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  noImageText: {
    color: "#888",
    fontStyle: "italic",
  },
});

export default IssuesList;
