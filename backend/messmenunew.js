import { firestore } from "./firebase";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteField,
  writeBatch,
} from "firebase/firestore"; // Modular SDK imports

// Initialize Mess Menu
export async function initializeMessMenu() {
  try {
    const messMenuRef = collection(firestore, "messmenu");
    const initialDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const batch = writeBatch(firestore);
    initialDays.forEach((day) => {
      const docRef = doc(messMenuRef, day);
      batch.set(docRef, {
        day,
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    return { success: true, message: "Mess menu initialized successfully." };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Mess Menu
export async function getMessMenu() {
  try {
    const messMenuRef = collection(firestore, "messmenu");
    const snapshot = await getDocs(messMenuRef);

    if (snapshot.empty) {
      return { success: false, message: "Mess menu not found." };
    }

    const menu = {};
    snapshot.forEach((doc) => {
      menu[doc.id] = doc.data();
    });

    return { success: true, menu };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Day Menu
export async function updateDayMenu(day, updatedMenu) {
  try {
    const messMenuRef = doc(firestore, "messmenu", day);
    await updateDoc(messMenuRef, {
      ...updatedMenu,
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: `Menu for ${day} updated successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
