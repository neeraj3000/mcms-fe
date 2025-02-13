import { firestore } from "./firebase"; // Import Firestore configuration from your firebase.js
// const bcrypt = require('bcrypt');
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
// const SALT_ROUNDS = 10;

// Register Supervisor
export const registerSupervisor = async (name, mobileNo, email, password,mess) => {
  try {
    // Validate required fields
    if (!name || !mobileNo || !email || !password) {
      return { success: false, message: "All fields are required" };
    }

    // Reference to collections
    const usersRef = collection(firestore, "users");
    const supervisorsRef = collection(firestore, "supervisor");

    // Get the last user ID and increment for the new user
    const lastUserQuery = query(usersRef, orderBy("userId", "desc"), limit(1));
    const lastUserSnapshot = await getDocs(lastUserQuery);
    const newUserId = lastUserSnapshot.empty
      ? 1
      : lastUserSnapshot.docs[0].data().userId + 1;

    // Create the user document
    const userDocRef = doc(usersRef, newUserId.toString());
    const userData = {
      userId: newUserId,
      role: "supervisor",
      email,
      password, // Storing plain text password directly
      createdAt: Timestamp.now(),
    };
    await setDoc(userDocRef, userData);

    // Get the last supervisor ID and increment for the new supervisor
    const lastSupervisorQuery = query(
      supervisorsRef,
      orderBy("supervisorId", "desc"),
      limit(1)
    );
    const lastSupervisorSnapshot = await getDocs(lastSupervisorQuery);
    const newSupervisorId = lastSupervisorSnapshot.empty
      ? 1
      : lastSupervisorSnapshot.docs[0].data().supervisorId + 1;

    // Create the supervisor document
    const supervisorDocRef = doc(supervisorsRef, newSupervisorId.toString());
    const supervisorData = {
      supervisorId: newSupervisorId,
      name,
      mobileNo,
      userId: newUserId,
      messNo:mess,
      createdAt: Timestamp.now(),
    };
    await setDoc(supervisorDocRef, supervisorData);

    // Return success response
    return {
      success: true,
      message: "Supervisor registered successfully",
      supervisorId: newSupervisorId,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};
export async function getStudentsByMessId(messId) {
  try {
    if (!messId) {
      throw new Error("Mess ID is required.");
    }

    // Step 1: Fetch "setofmr" from the "mess" collection
    const messDocRef = doc(firestore, "mess", messId);
    const messDoc = await getDoc(messDocRef);

    if (!messDoc.exists()) {
      throw new Error('No mess found with messId: ${messId}');
    }

    const messData = messDoc.data();
    const setofmr = messData.setofmr;

    if (!Array.isArray(setofmr) || setofmr.length === 0) {
      throw new Error("No representative emails found in the mess collection.");
    }

    // Step 2: Fetch "userId" array from the "users" collection based on emails
    const usersRef = collection(firestore, "users");
    const usersQuery = query(usersRef, where("email", "in", setofmr));
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      throw new Error("No users found for the given representative emails.");
    }

    const userIds = usersSnapshot.docs.map((doc) => doc.data().userId);

    if (userIds.length === 0) {
      throw new Error("No userIds found for the given representative emails.");
    }

    // Step 3: Fetch student details from the "Student" collection
    const studentsRef = collection(firestore, "Student");
    const studentsQuery = query(studentsRef, where("userId", "in", userIds));
    const studentsSnapshot = await getDocs(studentsQuery);

    if (studentsSnapshot.empty) {
      throw new Error("No students found for the given userIds.");
    }

    // Map and return student details
    const students = studentsSnapshot.docs.map((doc) => ({
      id: doc.id, // Document ID
      ...doc.data(), // All student details
    }));

    return { success: true, students };
  } catch (err) {
    console.error("Error fetching students by Mess ID:", err.message);
    return { success: false, error: err.message };
  }
}
// Get All Supervisors
export const getAllSupervisors = async () => {
  try {
    const supervisorsRef = collection(firestore, "supervisor");
    const snapshot = await getDocs(supervisorsRef);

    if (snapshot.empty) {
      return { success: false, message: "No supervisors found" };
    }

    const supervisorsList = snapshot.docs.map((doc) => doc.data());
    return { success: true, supervisors: supervisorsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Get All Supervisors by Mess ID
export const getSupervisorsByMessId = async (messId) => {
  try {
    if (!messId) {
      return { success: false, message: "Mess ID is required" };
    }

    const supervisorsRef = collection(firestore, "supervisor");
    const messQuery = query(supervisorsRef, where("messId", "==", messId));
    const snapshot = await getDocs(messQuery);

    if (snapshot.empty) {
      return { success: false, message: "No supervisors found for this mess" };
    }

    const supervisorsList = snapshot.docs.map((doc) => doc.data());
    return { success: true, supervisors: supervisorsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Get Supervisor by ID
export const getSupervisorById = async (supervisorId) => {
  try {
    const supervisorsRef = collection(firestore, "supervisor");
    const idQuery = query(
      supervisorsRef,
      where("supervisorId", "==", parseInt(supervisorId))
    );
    const snapshot = await getDocs(idQuery);

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    return { success: true, supervisor: snapshot.docs[0].data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Update Supervisor Profile
export const updateSupervisorProfile = async (supervisorId, name, mobileNo) => {
  try {
    if (!name && !mobileNo) {
      return {
        success: false,
        message: "At least one field is required to update",
      };
    }

    const supervisorsRef = collection(firestore, "supervisor");
    const idQuery = query(
      supervisorsRef,
      where("supervisorId", "==", parseInt(supervisorId))
    );
    const snapshot = await getDocs(idQuery);

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const updatedData = {};
    if (name) updatedData.name = name;
    if (mobileNo) updatedData.mobileNo = mobileNo;
    updatedData.updatedAt = Timestamp.now();

    await updateDoc(supervisorDoc.ref, updatedData);

    return {
      success: true,
      message: "Supervisor profile updated successfully",
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Delete Supervisor by ID
export const deleteSupervisorById = async (supervisorId) => {
  try {
    const supervisorsRef = collection(firestore, "supervisor");
    const idQuery = query(
      supervisorsRef,
      where("supervisorId", "==", parseInt(supervisorId))
    );
    const snapshot = await getDocs(idQuery);

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const userId = supervisorDoc.data().userId;

    await deleteDoc(supervisorDoc.ref);

    const usersRef = collection(firestore, "users");
    const userQuery = query(usersRef, where("userId", "==", userId));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      await deleteDoc(userSnapshot.docs[0].ref);
    }

    return { success: true, message: "Supervisor deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

/*// Update Supervisor Password(need update)
export const updateSupervisorPassword = async (supervisorId, newPassword) => {
    try {
      if (!newPassword) {
        return { success: false, message: 'New password is required' };
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  
      const supervisorsRef = collection(firestore, 'supervisor');
      const idQuery = query(supervisorsRef, where('supervisorId', '==', parseInt(supervisorId)));
      const snapshot = await getDocs(idQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Supervisor not found' };
      }
  
      const supervisorDoc = snapshot.docs[0];
      const userId = supervisorDoc.data().userId;
  
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        return { success: false, message: 'User not found' };
      }
  
      const userDoc = userSnapshot.docs[0];
      await updateDoc(userDoc.ref, { password: hashedPassword, updatedAt: Timestamp.now() });
  
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };
*/

// Update Supervisor Password
export const updateSupervisorPassword = async (supervisorId, newPassword) => {
  try {
    if (!newPassword) {
      return { success: false, message: "New password is required" };
    }

    const supervisorsRef = collection(firestore, "supervisor");
    const idQuery = query(
      supervisorsRef,
      where("supervisorId", "==", parseInt(supervisorId))
    );
    const snapshot = await getDocs(idQuery);

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const userId = supervisorDoc.data().userId;

    const usersRef = collection(firestore, "users");
    const userQuery = query(usersRef, where("userId", "==", userId));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return { success: false, message: "User not found" };
    }

    const userDoc = userSnapshot.docs[0];
    await updateDoc(userDoc.ref, {
      password: newPassword,
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: "Password updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Get Supervisor by UserId
export const getSupervisorByUserId = async (userId) => {
  try {
    const supervisorsRef = collection(firestore, "supervisor");
    const idQuery = query(
      supervisorsRef,
      where("userId", "==", parseInt(userId))
    );
    const snapshot = await getDocs(idQuery);

    if (snapshot.empty) {
      return { success: false, message: "Supervisor not found" };
    }

    const supervisorDoc = snapshot.docs[0];
    const supervisorData = supervisorDoc.data();

    return { success: true, supervisorData };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Get Mess ID by User ID
export async function getMessIdByUserId(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    // Reference to the 'supervisor' collection
    const supervisorRef = collection(firestore, "supervisor");

    // Query to find the document with the given userId
    const snapshot = await getDocs(
      query(supervisorRef, where("userId", "==", userId))
    );

    if (snapshot.empty) {
      throw new Error("No supervisor found for the given User ID.");
    }

    // Extract the messId from the first matching document
    const messId = snapshot.docs[0].data().messId;

    return { success: true, messId };
  } catch (err) {
    console.error("Error getting messId by userId:", err);
    return { success: false, error: err.message };
  }
}