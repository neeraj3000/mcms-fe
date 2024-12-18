import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import RefreshButton from "./RefreshButton"; // Import the RefreshButton component

const IssuesComponent = ({ mode = "none" }) => {
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // To manage upvotes and downvotes per issue
  const [votes, setVotes] = useState({});

  const fetchIssues = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://mcms-nseo.onrender.com/complaints/issues?page=${page}&limit=3`
      );

      const issuesData = response.data.issues;

      if (Array.isArray(issuesData)) {
        const newIssues = issuesData.filter(
          (newIssue) =>
            !issues.some(
              (existingIssue) => existingIssue.issueId === newIssue.issueId
            )
        );

        setIssues((prevIssues) => [...prevIssues, ...newIssues]);

        const newVotes = {};
        newIssues.forEach((issue) => {
          newVotes[issue.issueId] = { upvoted: false, downvoted: false };
        });
        setVotes((prevVotes) => ({ ...prevVotes, ...newVotes }));

        setHasMore(newIssues.length > 0);
      } else {
        console.error("Unexpected response format:", response.data);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      Alert.alert("Error", "Failed to fetch issues from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleVote = (issueId, voteType) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [issueId]: {
        upvoted: voteType === "upvote" ? !prevVotes[issueId]?.upvoted : false,
        downvoted: voteType === "downvote" ? !prevVotes[issueId]?.downvoted : false,
      },
    }));
  };

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

      <RefreshButton onRefresh={refreshIssues} />

      <FlatList
        data={issues}
        renderItem={({ item }) => (
          <View style={styles.issueItem}>
            <TouchableOpacity onPress={() => openModal(item)}>
              <Text style={styles.issueTitle}>{item.description}</Text>
              <Text style={styles.issueStatus}>{item.status}</Text>
            </TouchableOpacity>

            {mode === "vote" && (
              <View style={styles.voteContainer}>
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    votes[item.issueId]?.upvoted ? styles.upvoteActive : styles.voteButtonDefault,
                  ]}
                  onPress={() => handleVote(item.issueId, "upvote")}
                >
                  <Text style={[styles.voteText, votes[item.issueId]?.upvoted && styles.activeText]}>
                    🚀 {votes[item.issueId]?.upvoted ? "Upvoted" : "Upvote"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    votes[item.issueId]?.downvoted ? styles.downvoteActive : styles.voteButtonDefault,
                  ]}
                  onPress={() => handleVote(item.issueId, "downvote")}
                >
                  <Text style={[styles.voteText, votes[item.issueId]?.downvoted && styles.activeText]}>
                    💥 {votes[item.issueId]?.downvoted ? "Downvoted" : "Downvote"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.issueId.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#007bff" /> : null
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
                {selectedIssue.imageUrl ? (
                  <Image
                    source={{ uri: selectedIssue.imageUrl }}
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
  },
  issueStatus: {
    fontSize: 14,
    color: "#888",
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  voteButton: {
    padding: 10,
    borderRadius: 5,
  },
  voteButtonDefault: {
    backgroundColor: "#f2f2f2",
  },
  upvoteActive: {
    backgroundColor: "#28a745",
  },
  downvoteActive: {
    backgroundColor: "#dc3545",
  },
  voteText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007bff",
  },
  activeText: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  modalLabel: {
    fontWeight: "bold",
  },
  modalImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  noImageText: {
    fontSize: 14,
    color: "#888",
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default IssuesComponent;
