import bcrypt from "bcryptjs"; // For password hashing
import { firestore } from "./firebase"; // Import Firestore and Timestamp from firebase.js
import { Timestamp } from "firebase/firestore"; // Import Timestamp for timestamps
const SALT_ROUNDS = 10;

// Register Supervisor
export async function registerSupervisor({ name, mobileNo, email, password }) {
  try {
    // Input validation
    if (!name || !mobileNo || !email || !password) {
      return { success: false, message: "All fields are required" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Firestore references
    const usersRef = firestore.collection("users");
    const supervisorsRef = firestore.collection("supervisor");

    // Generate auto-incrementing userId
    const lastUser = await usersRef.orderBy("userId", "desc").limit(1).get();
    const newUserId = lastUser.empty ? 1 : lastUser.docs[0].data().userId + 1;

    // Add user document
    const userData = {
      userId: newUserId,
      role: "supervisor", // Static role
      email,
      password: hashedPassword, // Store hashed password
      createdAt: Timestamp.now(),
    };
    await usersRef.doc(newUserId.toString()).set(userData);

    // Generate auto-incrementing supervisorId
    const lastSupervisor = await supervisorsRef
      .orderBy("supervisorId", "desc")
      .limit(1)
      .get();
    const newSupervisorId = lastSupervisor.empty
      ? 1
      : lastSupervisor.docs[0].data().supervisorId + 1;

    // Add supervisor document
    const supervisorData = {
      supervisorId: newSupervisorId,
      name,
      mobileNo,
      userId: newUserId,
      createdAt: Timestamp.now(),
    };
    await supervisorsRef.doc(newSupervisorId.toString()).set(supervisorData);

    return {
      success: true,
      message: "Supervisor registered successfully",
      supervisorId: newSupervisorId,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Supervisors
export async function getAllSupervisors() {
  try {
    const supervisorsRef = firestore.collection("supervisor");
    const snapshot = await supervisorsRef.get();

    if (snapshot.empty) {
      return { success: false, message: "No supervisors found" };
    }

    const supervisorsList = [];
    snapshot.forEach((doc) => supervisorsList.push(doc.data()));

    return { success: true, supervisors: supervisorsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Supervisors by Mess ID
export async function getSupervisorsByMessId(messId) {
  try {
    if (!messId) {
      return { success: false, message: "Mess ID is required" };
    }

    const supervisorsRef = firestore.collection("supervisor");
    const snapshot = await supervisorsRef
      .where("messId", "==", parseInt(messId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "No supervisors found for this mess" };
    }

    const supervisorsList = [];
    snapshot.forEach((doc) => supervisorsList.push(doc.data()));

    return { success: true, supervisors: supervisorsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Supervisor by ID
export async function getSupervisorById(supervisorId) {
  try {
    const supervisorsRef = firestore.collection("supervisor");
    const snapshot = await supervisorsRef
      .where("supervisorId", "==", parseInt(supervisorId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    return { success: true, supervisor: snapshot.docs[0].data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Supervisor Profile
export async function updateSupervisorProfile(
  supervisorId,
  { name, mobileNo }
) {
  try {
    if (!name && !mobileNo) {
      return {
        success: false,
        message: "At least one field is required to update",
      };
    }

    const supervisorsRef = firestore.collection("supervisor");
    const snapshot = await supervisorsRef
      .where("supervisorId", "==", parseInt(supervisorId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const updatedData = {};
    if (name) updatedData.name = name;
    if (mobileNo) updatedData.mobileNo = mobileNo;
    updatedData.updatedAt = Timestamp.now();

    await supervisorDoc.ref.update(updatedData);

    return {
      success: true,
      message: "Supervisor profile updated successfully",
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Supervisor by ID
export async function deleteSupervisorById(supervisorId) {
  try {
    const supervisorsRef = firestore.collection("supervisor");
    const snapshot = await supervisorsRef
      .where("supervisorId", "==", parseInt(supervisorId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const userId = supervisorDoc.data().userId;

    // Delete from Supervisor collection
    await supervisorDoc.ref.delete();

    // Delete the corresponding user document
    const usersRef = firestore.collection("users");
    const userSnapshot = await usersRef.where("userId", "==", userId).get();
    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.delete();
    }

    return { success: true, message: "Supervisor deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Supervisor Password
export async function updateSupervisorPassword(supervisorId, newPassword) {
  try {
    if (!newPassword) {
      return { success: false, message: "New password is required" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const supervisorsRef = firestore.collection("supervisor");
    const snapshot = await supervisorsRef
      .where("supervisorId", "==", parseInt(supervisorId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const userId = supervisorDoc.data().userId;

    // Update password in users collection
    const usersRef = firestore.collection("users");
    const userSnapshot = await usersRef.where("userId", "==", userId).get();

    if (userSnapshot.empty) {
      return { success: false, message: "User not found" };
    }

    const userDoc = userSnapshot.docs[0];
    await userDoc.ref.update({
      password: hashedPassword,
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: "Password updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Supervisor by UserId
export async function getSupervisorByUserId(userId) {
  try {
    const supervisorRef = firestore.collection("supervisor");
    const snapshot = await supervisorRef
      .where("userId", "==", parseInt(userId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const supervisorData = supervisorDoc.data();

    return { success: true, supervisorId: supervisorData.supervisorId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
