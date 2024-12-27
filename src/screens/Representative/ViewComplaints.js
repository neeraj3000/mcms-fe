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
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import RefreshButton from "../../components/RefreshButton";
import {
  getMessNoByUserId,
  getIssuesByMessNo,
  updateIssue,
} from "@/backend/issuesnew";
import { useSession } from "@/src/SessionContext";
import { getStudentById } from "../../../backend/studentnew";

const IssueItem = React.memo(
  ({ id, title, status, onResolve, onForward, onPress }) => (
    <View style={styles.issueItem}>
      <TouchableOpacity onPress={onPress} style={styles.issueContent}>
        <Text style={styles.issueTitle}>{title}</Text>
        <Text style={styles.issueStatus}>{status}</Text>
      </TouchableOpacity>
      {status !== "resolved" && status !== "forwarded" && (
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
  )
);

const AllComplaints = () => {
  const { user } = useSession();
  const [issues, setIssues] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchIssues = async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;

    if (reset) {
      setPage(1);
      setIssues([]);
      setHasMore(true);
    }

    setLoading(true);
    try {
      if (!user || !user.id) {
        console.error("User or user ID is missing");
        Alert.alert("Error", "Failed to fetch user information.");
        return;
      }

      const res = await getMessNoByUserId(user.id);
      const response = await getIssuesByMessNo(res.messNo.toString());
      const result = await getStudentById(user.id);
      if (
        response.success === false &&
        response.message &&
        result.success === false
      ) {
        console.warn("Unexpected response format:", response.message);
        Alert.alert("Info", response.message); // Display the message
        setIssues([]); // Clear any existing issues
        setHasMore(false); // No more data to fetch
        return;
      }

      const issuesData = response.issues;
      const data = result.studentData;
      if (Array.isArray(issuesData)) {
        const newIssues = issuesData.filter(
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

  // Initial data fetch
  useEffect(() => {
    fetchIssues();
  }, [page, user]);


  const handleResolve = async (id, index) => {
    Alert.alert(
      "Confirm Resolution",
      "Are you sure you want to resolve this issue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const res = await updateIssue(id, { status: "resolved" });
              if (res.success) {
                const updatedIssues = [...issues];
                updatedIssues[index].status = "resolved";
                setIssues(updatedIssues);
                Alert.alert("Success", "Issue resolved successfully.");
              } else {
                Alert.alert("Error", "Failed to resolve the issue.");
              }
            } catch (error) {
              console.error("Error resolving issue:", error);
              Alert.alert("Error", "Unable to resolve the issue.");
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
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const res = await updateIssue(id, { status: "forwarded" });
              if (res.success) {
                const updatedIssues = [...issues];
                updatedIssues[index].status = "forwarded";
                setIssues(updatedIssues);
                Alert.alert("Success", "Issue forwarded successfully.");
              } else {
                Alert.alert("Error", "Failed to forward the issue.");
              }
            } catch (error) {
              console.error("Error forwarding issue:", error);
              Alert.alert("Error", "Unable to forward the issue.");
            }
          },
        },
      ]
    );
  };

  const openIssueModal = async (issue) => {
    setModalVisible(true);
    setModalLoading(true);

    try {
      // Fetch the student data for the college ID
      const student = await getStudentById(issue.userId);
      console.log(student)
      console.log(student.success)
      if (student.success) {
        // If successful, add the collegeId to the issue object
        console.log(student)
        console.log(student.studentData)
        setSelectedIssue({
          ...issue,
          collegeId: student.student.collegeId,
        });
      } else {
        console.warn("Failed to fetch college ID:", student.message);
        // Set the issue without the collegeId if fetching failed
        setSelectedIssue(issue);
      }
    } catch (error) {
      console.error("Error fetching college ID:", error);
      // Set the issue without the collegeId in case of an error
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
    fetchIssues(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Complaints</Text>
      <FlatList
        data={issues}
        renderItem={({ item, index }) => (
          <IssueItem
            id={item.id}
            title={item.description}
            status={item.status}
            onResolve={() => handleResolve(item.id, index)}
            onForward={() => handleForward(item.id, index)}
            onPress={() => openIssueModal(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={() => setPage((prev) => prev + 1)}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007bff" />
              <Text style={styles.loadingText}> Loading...</Text>
            </View>
          )
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
                  <Text style={styles.modalTitle}>Issue Details</Text>
                  <Text style={styles.modalContent}>
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
                  <Text style={styles.modalContent}>
                    <Text style={styles.modalSubTitle}>Created At: </Text>
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
                    onPress={closeModal}
                    style={styles.modalCloseButton}
                  >
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
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
  noImageText: {
    color: "#888",
    fontStyle: "italic",
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 15,
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


export default AllComplaints;
