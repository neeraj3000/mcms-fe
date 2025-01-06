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
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import RefreshButton from "../../components/RefreshButton";
import { getAllUnresolvedIssues, getUserVote } from "../../../backend/issuesnew";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "green";
    case "pending":
      return "orange";
    case "reraised":
      return "red";
    default:
      return "#888"; // Default color for unknown statuses
  }
};

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [votes, setVotes] = useState({});
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
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await getAllUnresolvedIssues();
      if (response.success) {
        const issuesData = response.issues;

        if (Array.isArray(issuesData)) {
          const filteredIssues =
            selectedMess === "all"
              ? issuesData
              : issuesData.filter(
                  (issue) => issue.messNo.toString() === selectedMess
                );

          // Calculate total votes and sort by total votes in descending order
          const sortedIssues = filteredIssues.sort((a, b) => {
            const totalVotesA = (a.upvotes || 0) + (a.downvotes || 0);
            const totalVotesB = (b.upvotes || 0) + (b.downvotes || 0);
            return totalVotesB - totalVotesA; // Sort in descending order
          });

          setIssues(sortedIssues);
          setHasMore(sortedIssues.length > 0);
        } else {
          setHasMore(false);
        }
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
    setModalVisible(false);
    setSelectedIssue(null);
  };

  const refreshIssues = () => {
    setIssues([]);
    setHasMore(true);
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
          <Picker.Item key={i} label={`Mess ${i + 1}`} value={`${i + 1}`} />
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
            <Text style={styles.issueTitle}>{item.category}</Text>
            <Text
              style={[
                styles.issueStatus,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
            <View style={styles.voteContainer}>
              <Text style={styles.voteText}>
                🚀 {votes[item.id]?.upvotes || item.upvotes || 0} | 💥{" "}
                {votes[item.id]?.downvotes || item.downvotes || 0}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          loading && <ActivityIndicator size="large" color={colors.primary} />
        }
      />

      {modalVisible && selectedIssue && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons
                  name="close"
                  size={30}
                  color="grey"
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Issue Details</Text>
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Issue Title:</Text>{" "}
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
              <Text style={styles.modalText}>
                <Text style={styles.modalLabel}>Created At:</Text>{" "}
                {selectedIssue.createdAt
                  ? new Date(selectedIssue.createdAt.seconds * 1000)
                      .toLocaleString()
                      .split(",")[0]
                  : "N/A"}
              </Text>
              {selectedIssue.image ? (
                <Image
                  source={{ uri: selectedIssue.image }}
                  style={styles.modalImage}
                />
              ) : (
                <Text style={styles.noImageText}>No Image Available</Text>
              )}
            </View>
          </View>
        </Modal>
      )}
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
    elevation: 3,
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
  voteContainer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  voteText: {
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
    borderRadius: 8,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  noImageText: {
    fontStyle: "italic",
    color: "#888",
  },
  closeIcon: {
    position: "absolute",
    top: -15,
    left: 240,
  },
});

export default IssuesList;
