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
  Image,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RefreshButton from "../../components/RefreshButton";
import { getAllIssues, getAllUnresolvedIssues } from "@/backend/issuesnew";
import { getStudentById } from "../../../backend/studentnew";
import { updateIssue } from "@/backend/issuesnew";

// Function to assign colors based on issue status
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "forwarded":
      return "#ff9800"; // Orange
    case "reraised":
      return "#f44336"; // Red
    case "new":
      return "#2196f3"; // Blue
    case "resolved":
      return "#228B22"; // Green
    default:
      return "#888"; // Default grey
  }
};

const IssueItem = React.memo(({ id, title, status, onResolve, onPress }) => {
  const statusColor = getStatusColor(status);

  return (
    <View style={styles.issueItem}>
      <TouchableOpacity onPress={onPress} style={styles.issueContent}>
        <Text style={styles.issueTitle}>{title}</Text>
        <Text style={[styles.issueStatus, { color: statusColor }]}>
          {status}
        </Text>
      </TouchableOpacity>
      {status !== "resolved" && (
        <View style={styles.resolveContainer}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Confirm Resolve",
                "Are you sure you want to mark this issue as resolved?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Confirm",
                    onPress: onResolve,
                  },
                ]
              );
            }}
            style={styles.resolveButton}
          >
            <Text style={styles.resolveButtonText}>Resolve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const ViewComplaints = () => {
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchIssues = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await getAllUnresolvedIssues();
      const issuesData = response.issues;

      if (Array.isArray(issuesData)) {
        const filteredIssues = issuesData.filter(
          (issue) => issue.status !== "resolved" && issue.status !== "pending"
        );

        const newIssues = filteredIssues.filter(
          (newIssue) =>
            !issues.some((existingIssue) => existingIssue.id === newIssue.id)
        );

        setIssues((prevIssues) => [...prevIssues, ...newIssues]);
        setHasMore(newIssues.length > 0);
      } else {
        console.error("Unexpected response format:", response);
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
    try {
      const res = await updateIssue(id, { status: "resolved" });
      if (res.success) {
        setIssues((prevIssues) => {
          const updatedIssues = [...prevIssues];
          updatedIssues[index] = {
            ...updatedIssues[index],
            status: "resolved",
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
  };

  const openIssueModal = async (issue) => {
    setModalVisible(true);
    setModalLoading(true);

    try {
      const student = await getStudentById(issue.userId);
      if (student.success) {
        setSelectedIssue({
          ...issue,
          collegeId: student.student.collegeId,
          mobileNo: student.student.mobileNo,
        });
      } else {
        setSelectedIssue(issue);
      }
    } catch (error) {
      setSelectedIssue(issue);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedIssue(null);
  };

  const handleRefresh = () => {
    setPage(1);
    setIssues([]);
    setHasMore(true);
    fetchIssues();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Complaints</Text>

      <FlatList
        data={issues}
        renderItem={({ item, index }) => (
          <IssueItem
            key={item.id}
            id={item.id}
            title={item.category}
            status={item.status}
            onResolve={() => handleResolve(item.id, index)}
            onPress={() => openIssueModal(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#007bff" /> : null
        }
      />

      <Modal
        visible={modalVisible}
        onRequestClose={closeModal}
        transparent
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {modalLoading ? (
                <ActivityIndicator size="large" color="#007bff" />
              ) : selectedIssue ? (
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
                  <Text style={[styles.modalContent, styles.highlight]}>
                    <Text style={styles.modalSubTitle}>Issue Title: </Text>
                    {selectedIssue.category}
                  </Text>
                  <Text style={[styles.modalContent, styles.highlight]}>
                    <Text style={styles.modalSubTitle}>Description: </Text>
                    {selectedIssue.description}
                  </Text>
                  <Text style={styles.modalContent}>
                    <Text style={styles.modalSubTitle}>Status: </Text>
                    {selectedIssue.status}
                  </Text>
                  <Text style={styles.modalContent}>
                    <Text style={styles.modalSubTitle}>Mess No: </Text>
                    {selectedIssue.messNo}
                  </Text>
                  <Text style={styles.modalContent}>
                    <Text style={styles.modalSubTitle}>Student ID: </Text>
                    {selectedIssue.collegeId}
                  </Text>
                  <View style={styles.mobileContainer}>
                    <Text style={styles.modalsubTitle}>Mobile No: </Text>
                    <Text style={styles.clickableText}>
                      {selectedIssue.mobileNo || "N/A"}
                    </Text>
                    {selectedIssue.mobileNo && (
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() =>
                          Linking.openURL(`tel:${selectedIssue.mobileNo}`)
                        }
                      >
                        <Text style={styles.callButtonText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.modalContent}>
                    <Text style={styles.modalSubTitle}>Created At: </Text>
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
              ) : null}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
    elevation: 5,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  issueStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  resolveContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  resolveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 5,
  },
  resolveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  closeIcon: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalsubTitle: {
    fontSize: 16,
    marginBottom: 3,
    fontWeight: "bold",
  },
  modalSubTitle: {
    fontWeight: "bold",
  },
  mobileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  clickableText: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
  },
  callButton: {
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  callButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  highlight: {
    fontWeight: "bold",
    fontSize: 17,
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginTop: 10,
  },
  noImageText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
});

export default ViewComplaints;
