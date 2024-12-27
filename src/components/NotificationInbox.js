import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getNotificationInbox } from "native-notify";

export default function NotificationInbox() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await getNotificationInbox(
          25679, // Replace with your App ID
          "XWq6oWFv6eHddwmOo9m6Mv", // Replace with your App Token
          10, // Number of notifications to take
          0 // Number of notifications to skip
        );
        console.log("notifications: ", notifications);
        setData(notifications);
      } catch (error) {
        console.error("Error fetching notifications: ", error);
        Alert.alert("Error", "Unable to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationClick(item)}
    >
      <Text style={styles.title}>{item.title || "No Title"}</Text>
      <Text style={styles.message}>{item.message || "No Message"}</Text>
      {item.link && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openURL(item.link)}
        >
          <Text style={styles.linkText}>Open Link</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const handleNotificationClick = (notification) => {
    Alert.alert("Notification Clicked", `${notification.message}`);
    // Additional logic for handling notification click can go here
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notification Inbox</Text>
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderNotification}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No notifications available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#555",
  },
  linkButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
});
