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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getIssuesByMessNo } from "../../../backend/issuesnew";
import { getMessIdByUserId } from "../../../backend/supervisornew"; // Import the function to get mess number
import { useSession } from "../../SessionContext";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "forwarded":
      return "#ff9800";
    case "reraised":
      return "#f44336";
    case "new":
      return "#2196f3";
    case "resolved":
      return "#228B22";
    default:
      return "#888";
  }
};

const IssueItem = ({ id, title, status, onPress }) => {
  const statusColor = getStatusColor(status);

  return (
    <View style={styles.issueItem}>
      <TouchableOpacity onPress={onPress} style={styles.issueContent}>
        <Text style={styles.issueTitle}>{title}</Text>
        <Text style={[styles.issueStatus, { color: statusColor }]}>
          {status}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ViewIssues = () => {
  const { user } = useSession();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [messNo, setMessNo] = useState(null);

  const fetchMessNumber = async () => {
    try {
      const response = await getMessIdByUserId(user.id);
      if (response.success) {
        setMessNo(response.messId);
      } else {
        Alert.alert("Error", "Failed to fetch mess number.");
      }
    } catch (error) {
      console.error("Error fetching mess number:", error);
      Alert.alert("Error", "Failed to fetch mess number.");
    }
  };

  const fetchIssues = async () => {
    if (!messNo) {
      Alert.alert("Error", "Mess number is required.");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching issues for mess number:", messNo);
      const response = await getIssuesByMessNo(messNo);
      if (response.success) {
        setIssues(response.issues);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      Alert.alert("Error", "Failed to fetch issues from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchMessNumber();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (messNo) {
      fetchIssues();
    }
  }, [messNo]);

  const openIssueModal = (issue) => {
    setSelectedIssue(issue);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedIssue(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Complaints</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={issues}
          renderItem={({ item }) => (
            <IssueItem
              key={item.id}
              id={item.id}
              title={item.category}
              status={item.status}
              onPress={() => openIssueModal(item)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

      <Modal
        visible={modalVisible}
        onRequestClose={closeModal}
        transparent
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={closeModal}>
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
                  <View style={styles.modalContentContainer}>
                    <Text style={styles.modalContent}>
                      <Text style={styles.modalSubTitle}>Issue Title: </Text>
                      {selectedIssue.category}
                    </Text>
                    <Text style={styles.modalContent}>
                      <Text style={styles.modalSubTitle}>Description: </Text>
                      {selectedIssue.description}
                    </Text>

                    <Text style={styles.modalContent}>
                      <Text style={styles.modalSubTitle}>Mess No: </Text>
                      {selectedIssue.messNo}
                    </Text>
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
                  </View>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  issueItem: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },
  issueContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  issueStatus: {
    fontSize: 16,
    flex: 0.4,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  closeIcon: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContentContainer: {
    marginBottom: 20,
  },
  modalContent: {
    fontSize: 18,
    marginBottom: 8,
  },
  modalSubTitle: {
    fontWeight: "bold",
    color: "#333",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  noImageText: {
    fontStyle: "italic",
    color: "#888",
  },
});

export default ViewIssues;
