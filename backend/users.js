import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  setDoc,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore"; //
import { firestore } from "./firebase";
export const getUserIdsByMessId = async (messId) => {
  try {
    if (!messId) {
      return { success: false, message: "Mess ID is required" };
    }

    const studentsRef = collection(firestore, "Student");
    const studentQuery = query(studentsRef, where("messId", "==", messId));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      return { success: false, message: "No students found with this Mess ID" };
    }

    const userIds = studentSnapshot.docs.map((doc) => doc.data().userId);

    return { success: true, userIds };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

export const getUserIdsByBatch = async (batch) => {
  try {
    if (!batch) {
      return { success: false, message: "Batch is required" };
    }

    const studentsRef = collection(firestore, "Student");
    const studentQuery = query(studentsRef, where("batch", "==", batch));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      return { success: false, message: "No students found with this Batch" };
    }

    const userIds = studentSnapshot.docs.map((doc) => doc.data().userId);

    return { success: true, userIds };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

export const getUserIdsByGender = async (gender) => {
  try {
    if (!gender) {
      return { success: false, message: "Gender is required" };
    }

    const studentsRef = collection(firestore, "Student");
    const studentQuery = query(studentsRef, where("gender", "==", gender));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      return { success: false, message: "No students found with this Gender" };
    }

    const userIds = studentSnapshot.docs.map((doc) => doc.data().userId);

    return { success: true, userIds };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Retrieve User IDs by Batch and Gender
export const getUserIdsByBatchAndGender = async (batch, gender) => {
  try {
    const studentsRef = collection(firestore, "Student");
    let studentQuery = studentsRef;

    // Add batch condition if provided
    if (batch) {
      studentQuery = query(studentQuery, where("batch", "==", batch));
    }

    // Add gender condition if provided
    if (gender) {
      studentQuery = query(studentQuery, where("gender", "==", gender));
    }

    // Execute query
    const studentSnapshot = await getDocs(studentQuery);

    // Check if no documents match the query
    if (studentSnapshot.empty) {
      return { success: false, message: "No students found with the provided criteria" };
    }

    // Extract and return only userIds
    const userIds = studentSnapshot.docs.map((doc) => doc.data().userId);

    return { success: true, userIds };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};