import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { db } from "../backend/firebase"; // Import your firebase setup
import { doc, setDoc } from "firebase/firestore";

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

  // Save token to Firestore
  const userRef = doc(db, "pushnotifications", userId);
  await setDoc(userRef, { token, category }, { merge: true });

  return token;
}
