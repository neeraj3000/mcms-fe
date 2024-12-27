import { collection, addDoc, Timestamp } from "firebase/firestore";
import { firestore } from "./firebase"; // Import your Firestore instance

// Create a Menu Change Request
export async function createMenuChangeRequest(
  date,
  currentMenu,
  proposedMenu,
  reason
) {
  try {
    if (!date || !currentMenu || !proposedMenu || !reason) {
      throw new Error("All fields are required");
    }

    const menuChangeRequestsRef = collection(firestore, "menuChangeRequests");
    const requestData = {
      date, // Store the date as a string in YYYY-MM-DD format
      currentMenu,
      proposedMenu,
      reason,
      createdAt: Timestamp.now(), // Optional, for tracking request creation
    };

    const docRef = await addDoc(menuChangeRequestsRef, requestData);
    return {
      success: true,
      message: "Menu change request created successfully",
      id: docRef.id,
    };
  } catch (err) {
    console.error("Error creating menu change request:", err);
    return { success: false, error: err.message };
  }
}

// Get All Menu Change Requests
export async function getMenuChangeRequests() {
  try {
    const menuChangeRequestsRef = collection(firestore, "menuChangeRequests");
    const snapshot = await getDocs(menuChangeRequestsRef);

    if (snapshot.empty) {
      return { success: true, requests: [] }; // Return an empty array if no requests are found
    }

    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, requests };
  } catch (err) {
    console.error("Error fetching menu change requests:", err);
    return { success: false, error: err.message };
  }
}

// Delete a Menu Change Request
export async function deleteMenuChangeRequest(requestId) {
  try {
    if (!requestId) {
      throw new Error('Request ID is required');
    }

    const requestRef = doc(firestore, 'menuChangeRequests', requestId);
    await deleteDoc(requestRef);

    return { success: true, message: 'Menu change request deleted successfully' };
  } catch (err) {
    console.error('Error deleting menu change request:', err);
    return { success: false, error: err.message };
  }
}
