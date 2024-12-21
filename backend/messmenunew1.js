import { firestore } from './firebase';
import { Timestamp, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteField, writeBatch } from 'firebase/firestore'; // Modular SDK imports

// Initialize Mess Menu
export async function initializeMessMenu() {
  try {
    const messMenuRef = collection(firestore, 'messmenu');
    const initialDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const batch = writeBatch(firestore);
    initialDays.forEach((day) => {
      const docRef = doc(messMenuRef, day);
      batch.set(docRef, {
        day,
        breakfast: {},
        lunch: {},
        snacks: {},
        dinner: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    });

    await batch.commit();
    return { success: true, message: 'Mess menu initialized successfully.' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Mess Menu
export async function getMessMenu() {
  try {
    const messMenuRef = collection(firestore, 'messmenu');
    const snapshot = await getDocs(messMenuRef);

    if (snapshot.empty) {
      return { success: false, message: 'Mess menu not found.' };
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

// Get Day Menu
export async function getDayMenu(day) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', day);
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: `Menu for ${day} not found.` };
    }

    return { success: true, dayMenu: snapshot.data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Day Menu
export async function updateDayMenu(day, updatedMenu) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', day);
    await updateDoc(messMenuRef, {
      ...updatedMenu,
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `Menu for ${day} updated successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Meal Period
export async function updateMealPeriod(day, period, foodDetails) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', day);
    await updateDoc(messMenuRef, {
      [period]: foodDetails,
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `${period} for ${day} updated successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Meal Period
export async function deleteMealPeriod(day, period) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', day);
    await updateDoc(messMenuRef, {
      [period]: deleteField(),
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `${period} for ${day} deleted successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Meal Period
export async function getMealPeriod(day, period) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', day);
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: `Menu for ${day} not found.` };
    }

    const menu = snapshot.data();
    if (!menu[period]) {
      return { success: false, message: `Menu for ${period} on ${day} not found.` };
    }

    return { success: true, meal: menu[period] };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Day Menu
export async function deleteDayMenu(day) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', day);
    await updateDoc(messMenuRef, {
      breakfast: deleteField(),
      lunch: deleteField(),
      snacks: deleteField(),
      dinner: deleteField(),
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `Menu for ${day} deleted successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
