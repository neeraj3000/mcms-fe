const { Expo } = require("expo-server-sdk");
const { firestore } = require("./firebase");
const {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} = require("firebase/firestore");

// Initialize Expo SDK
const expo = new Expo();

// Save Push Token to Firebase
async function savePushToken(userId, token, category) {
  if (!Expo.isExpoPushToken(token)) {
    throw new Error("Invalid Expo Push Token");
  }

  const userRef = doc(firestore, "PushNotification", userId);
  await setDoc(userRef, { token, category }, { merge: true });
  console.log(`Token saved for user: ${userId}`);
}

// Send Notifications by Category
async function sendNotificationsByCategory(category, message) {
  const userQuery = query(
    collection(firestore, "PushNotification"),
    where("role", "==", category)
  );
  const querySnapshot = await getDocs(userQuery);

  if (querySnapshot.empty) {
    console.log(`No users found in category: ${category}`);
    return;
  }

  const pushTokens = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (Expo.isExpoPushToken(data.token)) {
      pushTokens.push(data.token);
    }
  });

  const messages = pushTokens.map((token) => ({
    to: token,
    sound: "default",
    body: message,
    data: { category },
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error(error);
    }
  }
  console.log("Notifications sent successfully!");
}

// Send Notifications to All Users
async function sendNotificationsToAll(message) {
  const snapshot = await getDocs(collection(firestore, "PushNotification"));

  if (snapshot.empty) {
    console.log("No users found");
    return;
  }

  const pushTokens = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (Expo.isExpoPushToken(data.token)) {
      pushTokens.push(data.token);
    }
  });

  const messages = pushTokens.map((token) => ({
    to: token,
    sound: "default",
    body: message,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error(error);
    }
  }
  console.log("Notifications sent to all users!");
}

// Send Notification to a Specific User
async function sendNotificationToUser(userId, message) {
  try {
    const userRef = doc(firestore, "PushNotification", userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      console.log(`User with ID: ${userId} not found.`);
      return;
    }

    const data = userSnapshot.data();
    const token = data.token;

    if (!Expo.isExpoPushToken(token)) {
      console.log(`Invalid Expo push token for user: ${userId}`);
      return;
    }

    const messages = [
      {
        to: token,
        sound: "default",
        body: message,
        data: { userId },
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error(error);
      }
    }

    console.log(`Notification sent to user: ${userId}`);
  } catch (error) {
    console.error(`Error sending notification to user: ${userId}`, error);
  }
}

module.exports = {
  savePushToken,
  sendNotificationsByCategory,
  sendNotificationsToAll,
  sendNotificationToUser, // Export the new function
};
