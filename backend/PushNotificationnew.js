import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { firestore } from "./firebase"; // Import Firestore instance

// Add PushNotification Token
// import { doc, getDoc, setDoc } from "firebase/firestore";

export async function addPushNotificationToken(userId, token, role) {
  try {
    // Convert all inputs to strings
    userId = String(userId);
    token = String(token);
    role = String(role);

    console.log("Called here with:", { userId, token, role });

    // Check for missing fields
    if (!userId || !token || !role) {
      return {
        success: false,
        message: "All fields (userId, token, role) are required.",
      };
    }

    const notificationRef = doc(firestore, "PushNotification", userId);
    const docSnapshot = await getDoc(notificationRef);

    if (docSnapshot.exists()) {
      console.log("Document already exists:", docSnapshot.data());
      return {
        success: true,
        message: "Document already exists.",
        data: docSnapshot.data(),
        reference: notificationRef,
      };
    }

    console.log("Creating new document...");
    await setDoc(notificationRef, { userId, token, role });
    return {
      success: true,
      message: "Push notification token added successfully.",
      reference: notificationRef,
    };
  } catch (err) {
    console.error("Detailed error:", err);

    if (err.message.includes("indexOf is not a function")) {
      return {
        success: false,
        message:
          "An internal error occurred while processing the data. Check the input fields.",
        error: err.message,
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      error: err.message,
    };
  }
}

// Update Push Notification Token
export async function updatePushNotificationToken(userId, token, role) {
  try {
    if (!userId || !token || !role) {
      return {
        success: false,
        message: "All fields (userId, token, role) are required.",
      };
    }

    const notificationRef = doc(firestore, "PushNotification", userId); // Use userId as the document ID
    const docSnapshot = await getDoc(notificationRef);

    if (!docSnapshot.exists()) {
      return {
        success: false,
        message: "Document does not exist. Use the add function to create it.",
      };
    }

    await updateDoc(notificationRef, { token, role });
    return {
      success: true,
      message: "Push notification token updated successfully.",
    };
  } catch (err) {
    console.error("Error updating push notification token:", err);
    return { success: false, error: err.message };
  }
}

// Get Push Notification Token By UserId
export async function getPushNotificationTokenByUserId(userId) {
  try {
    if (!userId) {
      return { success: false, message: "User ID is required." };
    }

    const notificationRef = doc(firestore, "PushNotification", userId);
    const docSnapshot = await getDoc(notificationRef);

    if (!docSnapshot.exists()) {
      return {
        success: false,
        message: "Push notification token not found for the given user ID.",
      };
    }

    return { success: true, data: docSnapshot.data() };
  } catch (err) {
    console.error("Error fetching push notification token:", err);
    return { success: false, error: err.message };
  }
}

// Delete Push Notification Token By UserId
export async function deletePushNotificationTokenByUserId(userId) {
  try {
    if (!userId) {
      return { success: false, message: "User ID is required." };
    }

    const notificationRef = doc(firestore, "PushNotification", userId);
    await deleteDoc(notificationRef);

    return {
      success: true,
      message: "Push notification token deleted successfully.",
    };
  } catch (err) {
    console.error("Error deleting push notification token:", err);
    return { success: false, error: err.message };
  }
}

// Get PushNotification Tokens By Role
export async function getPushNotificationTokensByRole(role) {
  try {
    if (!role) {
      return { success: false, message: "Role is required." };
    }

    const notificationRef = collection(firestore, "PushNotification");
    const q = query(notificationRef, where("role", "==", role));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No push notification tokens found for the given role.",
      };
    }

    const tokens = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, tokens };
  } catch (err) {
    console.error("Error fetching push notification tokens by role:", err);
    return { success: false, error: err.message };
  }
}

// Get All PushNotification Tokens
export async function getAllPushNotificationTokens() {
  try {
    const notificationRef = collection(firestore, "PushNotification");
    const snapshot = await getDocs(notificationRef);

    if (snapshot.empty) {
      return { success: false, message: "No push notification tokens found." };
    }

    const tokens = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, tokens };
  } catch (err) {
    console.error("Error fetching all push notification tokens:", err);
    return { success: false, error: err.message };
  }
}
import * as Notifications from "expo-notifications";
// import { firestore } from "../../backend/firebase"; // Firebase setup
// import { collection, getDocs } from "firebase/firestore"; // Firebase Firestore functions

// Function to send a push notification to a single token
async function sendPushNotification(token, message) {
  const messagePayload = {
    to: token,
    sound: "default",
    title: "New Notification",
    body: message,
    data: { extraData: "Some extra data" },
  };

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: messagePayload.title,
        body: messagePayload.body,
      },
      trigger: null, // To send immediately
    });
    console.log(`Notification sent to ${token}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Function to send notifications to all users from the Firestore collection
export async function sendNotificationsToAll() {
  try {
    // Fetch all documents from the PushNotification collection
    const querySnapshot = await getDocs(
      collection(firestore, "PushNotification")
    );

    // Loop through all documents and send notifications
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const token = data.token; // The token of the user

      if (token) {
        // Send push notification to this token
        sendPushNotification(token, "This is a notification for all users!");
      } else {
        console.warn("No token found for user:", doc.id);
      }
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
  }
}
