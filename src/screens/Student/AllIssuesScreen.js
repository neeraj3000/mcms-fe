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
import { Picker } from "@react-native-picker/picker";
import RefreshButton from "../../components/RefreshButton"; // Import the RefreshButton component
import { getAllIssues } from "../../../backend/issuesnew";
import { useSession } from "../../SessionContext";
import { handleVote, getUserVote } from "../../../backend/isvoted";

const IssuesWithVote = () => {
  const { user } = useSession();
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [votes, setVotes] = useState({});
  const [selectedMess, setSelectedMess] = useState("all");

  const colors = {
    primary: "#007bff", // Blue
    secondary: "#28a745", // Green
    danger: "#dc3545", // Red
    lightGray: "#f2f2f2", // Light Gray
    white: "#fff",
  };

  const fetchIssues = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await getAllIssues();
      if (response.success) {
        const issuesData = response.issues;

        if (Array.isArray(issuesData)) {
          const filteredIssues =
            selectedMess === "all"
              ? issuesData
              : issuesData.filter((issue) => issue.messNo === selectedMess);

          const newVotes = {};
          for (const issue of filteredIssues) {
            const userVote = await getUserVote(issue.id, user.id);
            newVotes[issue.id] = {
              upvotes: issue.upvotes || 0,
              downvotes: issue.downvotes || 0,
              upvoted: userVote === "upvotes",
              downvoted: userVote === "downvotes",
            };
          }

          filteredIssues.sort((a, b) => {
            const votesA =
              (votes[a.id]?.upvotes || a.upvotes || 0) +
              (votes[a.id]?.downvotes || a.downvotes || 0);
            const votesB =
              (votes[b.id]?.upvotes || b.upvotes || 0) +
              (votes[b.id]?.downvotes || b.downvotes || 0);
            return votesB - votesA; // Descending order
          });

          setIssues(filteredIssues);
          setVotes((prevVotes) => ({ ...prevVotes, ...newVotes }));
          setHasMore(filteredIssues.length > 0);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedMess]);

  const handleVotes = async (id, voteType) => {
    try {
      const response = await handleVote(id, user.id, voteType);
      if (response?.success) {
        Alert.alert("Success", response.message);

        setVotes((prevVotes) => {
          const currentVote = prevVotes[id] || {
            upvotes: 0,
            downvotes: 0,
            upvoted: false,
            downvoted: false,
          };
          const isUpvote = voteType === "upvotes";
          const isDownvote = voteType === "downvotes";

          return {
            ...prevVotes,
            [id]: {
              upvotes: isUpvote
                ? currentVote.upvotes + (currentVote.upvoted ? -1 : 1)
                : currentVote.upvotes - (currentVote.upvoted ? 1 : 0),
              downvotes: isDownvote
                ? currentVote.downvotes + (currentVote.downvotes ? -1 : 1)
                : currentVote.downvotes - (currentVote.downvotes ? 1 : 0),
              upvoted: isUpvote ? !currentVote.upvoted : false,
              downvoted: isDownvote ? !currentVote.downvoted : false,
            },
          };
        });
      } else {
        Alert.alert(
          "Error",
          response?.message || "Failed to process the vote."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process the vote.");
    }
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
          <View style={styles.issueItem}>
            <TouchableOpacity onPress={() => openModal(item)}>
              <Text style={styles.issueTitle}>{item.description}</Text>
              <Text style={styles.issueStatus}>{item.status}</Text>
            </TouchableOpacity>

            <View style={styles.voteContainer}>
              <TouchableOpacity
                style={[
                  styles.voteButton,
                  votes[item.id]?.upvoted
                    ? { backgroundColor: colors.secondary }
                    : { backgroundColor: colors.lightGray },
                ]}
                onPress={() => handleVotes(item.id, "upvotes")}
              >
                <Text
                  style={[
                    styles.voteText,
                    votes[item.id]?.upvoted && { color: colors.white },
                  ]}
                >
                  🚀 {votes[item.id]?.upvotes || 0}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.voteButton,
                  votes[item.id]?.downvoted
                    ? { backgroundColor: colors.danger }
                    : { backgroundColor: colors.lightGray },
                ]}
                onPress={() => handleVotes(item.id, "downvotes")}
              >
                <Text
                  style={[
                    styles.voteText,
                    votes[item.id]?.downvoted && { color: colors.white },
                  ]}
                >
                  💥 {votes[item.id]?.downvotes || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007bff" />
              <Text style={styles.loadingText}> Loading...</Text>
            </View>
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
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Created At:</Text>{" "}
                  {selectedIssue.createdAt
                    ? new Date(
                        selectedIssue.createdAt.seconds * 1000
                      ).toLocaleString()
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
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // Dark gray for title
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
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  voteButton: {
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: "center",
  },
  voteText: {
    fontSize: 14,
    fontWeight: "bold",
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
  voteContainerNone: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  voteTextRight: {
    fontSize: 14,
    color: "#007bff",
  },
  noImageText: {
    color: "#888",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#cccccc",
  },
});

export default IssuesWithVote;
