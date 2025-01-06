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
import RefreshButton from "../../components/RefreshButton";
import {
  getAllIssues,
  getAllUnresolvedIssues,
} from "../../../backend/issuesnew";
import { useSession } from "../../SessionContext";
import { handleVote, getUserVote } from "../../../backend/isvoted";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";

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
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [votingModalVisible, setVotingModalVisible] = useState(false); // Voting modal visibility state

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
    setLoadingModalVisible(true); // Show loading modal
    try {
      const response = await getAllUnresolvedIssues();
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
      setLoadingModalVisible(false); // Hide loading modal
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedMess]);

  const handleVotes = async (id, voteType) => {
    setVotingModalVisible(true); // Show voting modal when voting is triggered
    try {
      const response = await handleVote(id, user.id, voteType);
      if (response?.success) {
        // Alert.alert("Success", response.message);

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
    } finally {
      setVotingModalVisible(false); // Hide voting modal after vote processing
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
          <TouchableOpacity onPress={() => openModal(item)}>
            <View style={styles.issueItem}>
              <View style={styles.issueHeader}>
                <View style={styles.issueTextContainer}>
                  <Text style={styles.issueTitle}>{item.category}</Text>
                  <Text
                    style={[
                      styles.issueStatus,
                      item.status === "resolved" && styles.resolvedStatus,
                      item.status === "pending" && styles.pendingStatus,
                      item.status === "reraised" && styles.reraisedStatus,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                {/* Vote Icons */}
                <View style={styles.voteContainer}>
                  {/* Upvote Button */}
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => handleVotes(item.id, "upvotes")}
                  >
                    <Icon
                      name={
                        votes[item.id]?.upvoted
                          ? "thumb-up"
                          : "thumb-up-off-alt"
                      }
                      size={30}
                      color={
                        votes[item.id]?.upvoted ? colors.secondary : "green"
                      }
                      style={[
                        styles.iconWithBorder,
                        {
                          borderColor: votes[item.id]?.upvoted
                            ? colors.secondary
                            : "green",
                        },
                      ]}
                    />
                    <Text style={styles.voteText}>
                      {votes[item.id]?.upvotes || 0}
                    </Text>
                  </TouchableOpacity>

                  {/* Downvote Button */}
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => handleVotes(item.id, "downvotes")}
                  >
                    <Icon
                      name={
                        votes[item.id]?.downvoted
                          ? "thumb-down"
                          : "thumb-down-off-alt"
                      }
                      size={30}
                      color={votes[item.id]?.downvoted ? colors.danger : "red"}
                      style={[
                        styles.iconWithBorder,
                        {
                          borderColor: votes[item.id]?.downvoted
                            ? colors.danger
                            : "red",
                        },
                      ]}
                    />
                    <Text style={styles.voteText}>
                      {votes[item.id]?.downvotes || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Loading Modal */}
      <Modal
        visible={loadingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLoadingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModalContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingModalText}>Loading Issues...</Text>
          </View>
        </View>
      </Modal>
      {/* Voting Modal */}
      <Modal
        visible={votingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVotingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModalContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingModalText}>Processing Vote...</Text>
          </View>
        </View>
      </Modal>
      {/* Issue Details Modal */}
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
  closeIcon: {
    position: "absolute",
    top: -15,
    left: 240,
  },
  issueItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%", // Ensure there's space for icons
  },
  issueTextContainer: {
    flexDirection: "column",
  },
  issueTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  issueStatus: {
    fontSize: 14,
    color: "#888",
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "20%", // Take up remaining space
  },
  voteButton: {
    padding: 5,
    borderRadius: 5,
    width: 70,
    alignItems: "center",
  },
  voteText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#007bff",
  },
  iconWithBorder: {
    borderWidth: 0,
    borderRadius: 20,
    padding: 5,
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
  resolvedStatus: {
    color: "green",
  },
  pendingStatus: {
    color: "orange",
  },
  reraisedStatus: {
    color: "red",
  },
  loadingModalContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: 250,
  },
  loadingModalText: {
    fontSize: 18,
    marginTop: 10,
    color: "#007bff",
  },
});

export default IssuesWithVote;