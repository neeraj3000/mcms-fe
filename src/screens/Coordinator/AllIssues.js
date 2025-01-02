import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import RefreshButton from "../../components/RefreshButton";
import { getAllIssues } from "../../../backend/issuesnew";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "green";
    case "pending":
      return "orange";
    case "reraised":
      return "red";
    default:
      return "#888";
  }
};

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMess, setSelectedMess] = useState("all");

  const fetchIssues = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    try {
      const response = await getAllIssues(10, reset); // Fetch 10 issues per batch
      if (response.success) {
        const issuesData = response.issues;

        if (Array.isArray(issuesData) && issuesData.length > 0) {
          const filteredIssues =
            selectedMess === "all"
              ? issuesData
              : issuesData.filter(
                  (issue) => issue.messNo.toString() === selectedMess
                );

          const sortedIssues = filteredIssues.sort((a, b) => {
            const totalVotesA = (a.upvotes || 0) + (a.downvotes || 0);
            const totalVotesB = (b.upvotes || 0) + (b.downvotes || 0);
            return totalVotesB - totalVotesA;
          });

          setIssues((prevIssues) =>
            reset ? sortedIssues : [...prevIssues, ...sortedIssues]
          );
          setHasMore(response.hasMore);
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
    fetchIssues(true);
  }, [selectedMess]);

  const handleLoadMore = () => {
    if (hasMore) {
      fetchIssues(false);
    }
  };

  const refreshIssues = () => {
    fetchIssues(true);
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
          <TouchableOpacity style={styles.issueItem}>
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
                🚀 {item.upvotes || 0} | 💥 {item.downvotes || 0}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && <ActivityIndicator size="large" color="#007bff" />
        }
      />
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
});

export default IssuesList;
