import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import RefreshButton from '../../components/RefreshButton';  // Import RefreshButton

const IssueItem = React.memo(({ id, title, status, onResolve, onForward, onPress }) => {
  return (
    <View style={styles.issueItem}>
      <TouchableOpacity onPress={onPress} style={styles.issueContent}>
        <Text style={styles.issueTitle}>{title}</Text>
        <Text style={styles.issueStatus}>{status}</Text>
      </TouchableOpacity>

      {status !== "Resolved" && status!== "resolved" && status !== "Forwarded" && (
        <View style={styles.resolveContainer}>
          <TouchableOpacity onPress={onResolve} style={styles.resolveButton}>
            <Icon name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.resolveText}>Resolve</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onForward} style={styles.forwardButton}>
            <Icon name="arrow-forward-circle" size={20} color="#fff" />
            <Text style={styles.resolveText}>Forward</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const AllComplaints = () => {
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch issues with pagination
  const fetchIssues = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://mcms-nseo.onrender.com/complaints/issues`
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
        setHasMore(newIssues.length > 0);
      } else {
        console.error("Unexpected response format:", response.data);
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

  const handleResolve = async (id, index) => {
    Alert.alert(
      "Confirm Resolution",
      "Are you sure you want to resolve this issue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const res = await axios.put(
                `https://mcms-nseo.onrender.com/complaints/issues/status/${id}`,
                { status: "resolved" }
              );

              if (res.data.success) {
                setIssues((prevIssues) => {
                  const updatedIssues = [...prevIssues];
                  updatedIssues[index] = {
                    ...updatedIssues[index],
                    status: "Resolved",
                  };
                  return updatedIssues;
                });

                Alert.alert("Success", "Issue marked as resolved.");
              } else {
                Alert.alert("Error", "Failed to resolve the issue. Please try again.");
              }
            } catch (error) {
              console.error("Error updating issue status:", error);
              Alert.alert("Error", "Failed to update the issue status.");
            }
          },
        },
      ]
    );
  };

  const handleForward = async (id, index) => {
    Alert.alert(
      "Confirm Forwarding",
      "Are you sure you want to forward this issue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const res = await axios.put(
                `https://mcms-nseo.onrender.com/complaints/issues/status/${id}`,
                { status: "forwarded" }
              );

              if (res.data.success) {
                setIssues((prevIssues) => {
                  const updatedIssues = [...prevIssues];
                  updatedIssues[index] = {
                    ...updatedIssues[index],
                    status: "Forwarded",
                  };
                  return updatedIssues;
                });

                Alert.alert("Success", "Issue forwarded successfully.");
              } else {
                Alert.alert("Error", "Failed to forward the issue. Please try again.");
              }
            } catch (error) {
              console.error("Error forwarding issue:", error);
              Alert.alert("Error", "Failed to forward the issue.");
            }
          },
        },
      ]
    );
  };

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedIssue(null);
  };

  const handleRefresh = () => {
    setPage(1);  // Reset pagination
    setIssues([]);  // Clear the issues list
    fetchIssues();  // Fetch issues again
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Complaints</Text>

      <FlatList
        data={issues}
        renderItem={({ item, index }) => (
          <IssueItem
            key={item.issueId}
            id={item.issueId}
            title={item.description}
            status={item.status}
            onResolve={() => handleResolve(item.issueId, index)}
            onForward={() => handleForward(item.issueId, index)}
            onPress={() => openIssueModal(item)}
          />
        )}
        keyExtractor={(item) => item.issueId.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#007bff" /> : null
        }
      />

      <Modal
        visible={modalVisible}
        onRequestClose={closeModal}
        animationType="slide"
        transparent={true}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {selectedIssue && (
                <>
                  <Text style={styles.modalTitle}>Issue Details</Text>
                  <Text style={styles.modalContent}>
                    <Text style={styles.modalSubTitle}>Description: </Text>
                    {selectedIssue.description}
                  </Text>
                  <Text style={styles.modalContent}>
                    <Text style={styles.modalSubTitle}>Status: </Text>
                    {selectedIssue.status}
                  </Text>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {hasMore && !loading && (
        <TouchableOpacity
          onPress={handleLoadMore}
          style={styles.loadMoreButton}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}

      <RefreshButton onRefresh={handleRefresh} /> 
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  issueStatus: {
    fontSize: 14,
    color: "#888",
  },
  resolveContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resolveButton: {
    flexDirection: "row",
    backgroundColor: "#28a745",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  forwardButton: {
    flexDirection: "row",
    backgroundColor: "#ffc107",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  resolveText: {
    color: "#fff",
    marginLeft: 5,
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
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalSubTitle: {
    fontWeight: "bold",
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadMoreButton: {
    marginVertical: 20,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AllComplaints;