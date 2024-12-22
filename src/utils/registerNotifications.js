import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { addPushNotificationToken } from "../../backend/PushNotificationnew";

// Register Push Notifications
export async function registerForPushNotificationsAsync(userId, category) {
  try {
    console.log("Token registration initiated...");

    if (!userId || !category) {
      throw new Error("Both `userId` and `category` are required parameters.");
    }

    // Configure Android-specific notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error(
        "Push notification permissions not granted. Please enable permissions in your device settings."
      );
    }

    // Retrieve Expo Push Token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);

    // Save the token to Firestore
    const res = await addPushNotificationToken(userId, token, category);
    if (res.success) {
      console.log("Push Token Added Successfully:", res.message);
    } else {
      console.error("Failed to Add Push Token:", res.message);
    }

    return token; // Return the token for potential further use
  } catch (err) {
    console.error("Error during push notification registration:", err.message);
    alert(`Error: ${err.message}`);
    return null;
  }
}
