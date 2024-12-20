import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs 
  } from 'firebase/firestore';
  

import { firestore } from './firebase'; // Import Firestore instance

// Add PushNotification Token
export async function addPushNotificationToken(userId, token, role) {
  try {
    if (!userId || !token || !role) {
      return { success: false, message: 'All fields (userId, token, role) are required.' };
    }

    const notificationRef = doc(firestore, 'PushNotification', userId); // Use userId as the document ID
    const docSnapshot = await getDoc(notificationRef);

    if (docSnapshot.exists()) {
      return { success: false, message: 'Document already exists. Use the update function to modify it.' };
    }

    await setDoc(notificationRef, { userId, token, role });
    return { success: true, message: 'Push notification token added successfully.' };
  } catch (err) {
    console.error('Error adding push notification token:', err);
    return { success: false, error: err.message };
  }
}

// Update Push Notification Token
export async function updatePushNotificationToken(userId, token, role) {
  try {
    if (!userId || !token || !role) {
      return { success: false, message: 'All fields (userId, token, role) are required.' };
    }

    const notificationRef = doc(firestore, 'PushNotification', userId); // Use userId as the document ID
    const docSnapshot = await getDoc(notificationRef);

    if (!docSnapshot.exists()) {
      return { success: false, message: 'Document does not exist. Use the add function to create it.' };
    }

    await updateDoc(notificationRef, { token, role });
    return { success: true, message: 'Push notification token updated successfully.' };
  } catch (err) {
    console.error('Error updating push notification token:', err);
    return { success: false, error: err.message };
  }
}

// Get Push Notification Token By UserId
export async function getPushNotificationTokenByUserId(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required.' };
    }

    const notificationRef = doc(firestore, 'PushNotification', userId);
    const docSnapshot = await getDoc(notificationRef);

    if (!docSnapshot.exists()) {
      return { success: false, message: 'Push notification token not found for the given user ID.' };
    }

    return { success: true, data: docSnapshot.data() };
  } catch (err) {
    console.error('Error fetching push notification token:', err);
    return { success: false, error: err.message };
  }
}

// Delete Push Notification Token By UserId
export async function deletePushNotificationTokenByUserId(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required.' };
    }

    const notificationRef = doc(firestore, 'PushNotification', userId);
    await deleteDoc(notificationRef);

    return { success: true, message: 'Push notification token deleted successfully.' };
  } catch (err) {
    console.error('Error deleting push notification token:', err);
    return { success: false, error: err.message };
  }
}

// Get PushNotification Tokens By Role 
export async function getPushNotificationTokensByRole(role) {
  try {
    if (!role) {
      return { success: false, message: 'Role is required.' };
    }

    const notificationRef = collection(firestore, 'PushNotification');
    const q = query(notificationRef, where('role', '==', role));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: 'No push notification tokens found for the given role.' };
    }

    const tokens = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, tokens };
  } catch (err) {
    console.error('Error fetching push notification tokens by role:', err);
    return { success: false, error: err.message };
  }
}

// Get All PushNotification Tokens
export async function getAllPushNotificationTokens() {
  try {
    const notificationRef = collection(firestore, 'PushNotification');
    const snapshot = await getDocs(notificationRef);

    if (snapshot.empty) {
      return { success: false, message: 'No push notification tokens found.' };
    }

    const tokens = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, tokens };
  } catch (err) {
    console.error('Error fetching all push notification tokens:', err);
    return { success: false, error: err.message };
  }
}
