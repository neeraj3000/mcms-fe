import { firestore } from "./firebase"; // Import Firestore instance
import {
  Timestamp,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore"; // Import Firestore methods
import bcrypt from "bcryptjs"; // Import bcrypt

// Register Student and User
export const registerStudent = async (
  name = "ram",
  collegeId = "r200000",
  mobileNo = 6303030303,
  gender = "male",
  batch = "r20",
  email = "ram@gmail.com",
  password = "1234567890"
) => {
  try {
    // Check for missing fields
    if (
      !name ||
      !collegeId ||
      !mobileNo ||
      !gender ||
      !batch ||
      !email ||
      !password
    ) {
      throw new Error("All fields are required");
    }

    // Firestore collection references
    const usersRef = collection(firestore, "users");
    const studentsRef = collection(firestore, "student");

    const lastUser = await usersRef.orderBy("userId", "desc").limit(1).get();
    const newUserId = lastUser.empty ? 1 : lastUser.docs[0].data().userId + 1;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // User data
    const userData = {
      userId: newUserId,
      role: "student",
      email,
      password: hashedPassword,
      createdAt: Timestamp.now(),
    };
    console.log(userData);
    // Add the user document with a specific ID
    const userDocRef = doc(usersRef, newUserId.toString());
    await setDoc(userDocRef, userData);

    // Student data
    const studentData = {
      userId: newUserId,
      name,
      collegeId,
      mobileNo,
      gender,
      batch,
      messId: null,
      createdAt: Timestamp.now(),
    };

    // Add student document (auto-generated ID)
    await addDoc(studentsRef, studentData);

    return {
      success: true,
      message: "Student registered successfully",
      userId: newUserId,
    };
  } catch (err) {
    console.error("Error registering student:", err);
    throw new Error(err.message);
  }
};

export const getUserByCollegeId = async (collegeId) => {
  try {
    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef
      .where("collegeId", "==", collegeId)
      .get();

    if (snapshot.empty) {
      throw new Error("Student not found");
    }

    const studentData = snapshot.docs[0].data();
    return { success: true, user: studentData };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Retrieve All Users
export const getAllUsers = async () => {
  try {
    const usersRef = collection(firestore, "users");
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      throw new Error("No users found");
    }

    const usersList = snapshot.docs.map((doc) => doc.data());
    return { success: true, users: usersList };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Retrieve User by ID
export const getUserById = async (userId) => {
  try {
    const usersRef = collection(firestore, "users");
    const snapshot = await usersRef
      .where("userId", "==", parseInt(userId))
      .get();

    if (snapshot.empty) {
      throw new Error("No user found with this userId");
    }

    const userDoc = snapshot.docs[0].data();
    return { success: true, user: userDoc };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Delete User by ID
export const deleteUserById = async (userId) => {
  try {
    const usersRef = collection(firestore, "users");
    const snapshot = await usersRef
      .where("userId", "==", parseInt(userId))
      .get();

    if (snapshot.empty) {
      throw new Error("No user found with this userId");
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.delete();

    const studentsRef = collection(firestore, "Student");
    const studentSnapshot = await studentsRef
      .where("userId", "==", parseInt(userId))
      .get();

    studentSnapshot.forEach(async (doc) => {
      await doc.ref.delete();
    });

    return { success: true, message: "User deleted successfully" };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Update Student Profile
export const updateStudentProfile = async (userId, profileData) => {
  try {
    const { name, mobileNo, gender, batch, messId } = profileData;

    if (!name && !mobileNo && !gender && !batch && !messId) {
      throw new Error("At least one field is required to update");
    }

    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef
      .where("userId", "==", parseInt(userId))
      .get();

    if (snapshot.empty) {
      throw new Error("No student found with this userId");
    }

    const studentDoc = snapshot.docs[0];
    const updatedData = {
      name: name || studentDoc.data().name,
      mobileNo: mobileNo || studentDoc.data().mobileNo,
      gender: gender || studentDoc.data().gender,
      batch: batch || studentDoc.data().batch,
      messId: messId || studentDoc.data().messId,
      updatedAt: Timestamp.now(),
    };

    await studentDoc.ref.update(updatedData);

    return { success: true, message: "Student profile updated successfully" };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Update Mess ID by CollegeId
export const updateMessByCollegeId = async (collegeId, messId) => {
  try {
    if (!collegeId || !messId) {
      throw new Error("CollegeId and MessId are required");
    }

    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef
      .where("collegeId", "==", collegeId)
      .get();

    if (snapshot.empty) {
      throw new Error("No student found with this collegeId");
    }

    const studentDoc = snapshot.docs[0];
    await studentDoc.ref.update({ messId, updatedAt: Timestamp.now() });

    return {
      success: true,
      message: `MessId updated successfully for collegeId ${collegeId}`,
    };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Update Student Password
export const updateStudentPassword = async (userId, newPassword) => {
  try {
    if (!newPassword) {
      throw new Error("New password is required");
    }

    const usersRef = collection(firestore, "users");
    const snapshot = await usersRef
      .where("userId", "==", parseInt(userId))
      .get();

    if (snapshot.empty) {
      throw new Error("No user found with this userId");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      password: hashedPassword,
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: "Password updated successfully" };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Delete User by CollegeId
export async function deleteUserByCollegeId(collegeId) {
  try {
    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef
      .where("collegeId", "==", collegeId)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No student found with this collegeId",
      };
    }

    const studentDoc = snapshot.docs[0];
    const userId = studentDoc.data().userId;

    // Delete associated user data
    const usersRef = collection(firestore, "users");
    const userSnapshot = await usersRef.where("userId", "==", userId).get();
    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.delete();
    }

    // Delete the student document
    await studentDoc.ref.delete();

    return { success: true, message: "User deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Student Profile by CollegeId
export async function updateStudentProfileByCollegeId(
  collegeId,
  { name, mobileNo, gender, batch, messId }
) {
  try {
    if (!name && !mobileNo && !gender && !batch && !messId) {
      return {
        success: false,
        message: "At least one field is required to update",
      };
    }

    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef
      .where("collegeId", "==", collegeId)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No student found with this collegeId",
      };
    }

    const studentDoc = snapshot.docs[0];
    const updatedData = {
      name: name || studentDoc.data().name,
      mobileNo: mobileNo || studentDoc.data().mobileNo,
      gender: gender || studentDoc.data().gender,
      batch: batch || studentDoc.data().batch,
      messId: messId || studentDoc.data().messId,
      updatedAt: Timestamp.now(),
    };

    await studentDoc.ref.update(updatedData);

    return { success: true, message: "Student profile updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Mess ID by User ID
export async function updateMessByUserId(userId, { messId }) {
  try {
    if (!messId) {
      return { success: false, message: "MessId is required" };
    }

    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef
      .where("userId", "==", parseInt(userId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "No student found with this userId" };
    }

    const studentDoc = snapshot.docs[0];
    await studentDoc.ref.update({ messId, updatedAt: Timestamp.now() });

    return {
      success: true,
      message: `MessId updated successfully for userId ${userId}`,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Mess ID by Batch
export async function updateMessByBatch({ batch, messId }) {
  try {
    if (!batch || !messId) {
      return { success: false, message: "Batch and MessId are required" };
    }

    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef.where("batch", "==", batch).get();

    if (snapshot.empty) {
      return { success: false, message: "No students found for this batch" };
    }

    const batchUpdate = [];
    snapshot.forEach((doc) => {
      batchUpdate.push(doc.ref.update({ messId, updatedAt: Timestamp.now() }));
    });

    await Promise.all(batchUpdate);

    return {
      success: true,
      message: `MessId updated successfully for batch ${batch}`,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Student Password by CollegeId
export async function updateStudentPasswordByCollegeId(
  collegeId,
  { newPassword }
) {
  try {
    if (!newPassword) {
      return { success: false, message: "New password is required" };
    }

    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef
      .where("collegeId", "==", collegeId)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No student found with this collegeId",
      };
    }

    const studentDoc = snapshot.docs[0];
    const userId = studentDoc.data().userId;

    const usersRef = collection(firestore, "users");
    const userSnapshot = await usersRef.where("userId", "==", userId).get();

    if (userSnapshot.empty) {
      return { success: false, message: "No user found with this userId" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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

// Retrieve Students by Batch and Gender
export async function getStudentsByBatchAndGender({ batch, gender }) {
  try {
    const studentsRef = collection(firestore, "Student");
    let query = studentsRef;

    // If batch is provided, filter by batch
    if (batch) {
      query = query.where("batch", "==", batch);
    }

    // If gender is provided, filter by gender
    if (gender) {
      query = query.where("gender", "==", gender);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No students found with the provided criteria",
      };
    }

    const studentsList = [];
    snapshot.forEach((doc) => {
      studentsList.push(doc.data());
    });

    return { success: true, students: studentsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Retrieve Students by Gender
export async function getStudentsByGender(gender) {
  try {
    if (!gender) {
      return { success: false, message: "Gender is required" };
    }

    const studentsRef = collection(firestore, "Student");
    const snapshot = await studentsRef.where("gender", "==", gender).get();

    if (snapshot.empty) {
      return { success: false, message: "No students found with this gender" };
    }

    const studentsList = [];
    snapshot.forEach((doc) => {
      studentsList.push(doc.data());
    });

    return { success: true, students: studentsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
