import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { addPushNotificationToken } from "../../backend/PushNotificationnew";

// Function to register for push notifications
export async function registerForPushNotificationsAsync(userId, category) {
  try {
    console.log("Initializing push notification registration...");

    if (!userId || !category) {
      throw new Error("Both `userId` and `category` are required.");
    }

    // Configure Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Request permissions for notifications
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error(
        "Permission for push notifications not granted. Please enable permissions in device settings."
      );
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;
    console.log("Expo Push Token:", expoPushToken);

    // Send token to the backend
    const response = await addPushNotificationToken(
      userId,
      expoPushToken,
      category
    );
    if (response.success) {
      console.log("Push token successfully registered:", response.message);
    } else {
      console.error("Error registering push token:", response.message);
    }

    return expoPushToken; // Return token for further use
  } catch (error) {
    console.error("Push notification registration error:", error.message);
    alert(`Error: ${error.message}`);
    return null;
  }
}

// Optional: Set up notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
