import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { firestore } from "../../backend/firebase"; // Import your firebase setup
import { doc, setDoc } from "firebase/firestore";
import { addPushNotificationToken } from "../../backend/PushNotificationnew";

// Register Push Notifications
export async function registerForPushNotificationsAsync(userId, category) {
  let token;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    alert("Failed to get push token for push notifications!");
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo Push Token:", token);

  let res = await addPushNotificationToken(userId, token, category);
  console.log("Push Token Added:", res.success);

  return token;
}
