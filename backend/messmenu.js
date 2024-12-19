import { firestore } from './firebase';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for timestamps

export async function initializeMessMenu() {
  try {
    const messMenuRef = firestore.collection('messmenu');
    const initialDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const batch = firestore.batch();
    initialDays.forEach((day) => {
      const docRef = messMenuRef.doc(day);
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

export async function getMessMenu() {
  try {
    const messMenuRef = firestore.collection('messmenu');
    const snapshot = await messMenuRef.get();

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

export async function getDayMenu(day) {
  try {
    const messMenuRef = firestore.collection('messmenu').doc(day);
    const snapshot = await messMenuRef.get();

    if (!snapshot.exists) {
      return { success: false, message: `Menu for ${day} not found.` };
    }

    return { success: true, dayMenu: snapshot.data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function updateDayMenu(day, updatedMenu) {
  try {
    const messMenuRef = firestore.collection('messmenu').doc(day);
    await messMenuRef.update({
      ...updatedMenu,
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `Menu for ${day} updated successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function updateMealPeriod(day, period, foodDetails) {
  try {
    const messMenuRef = firestore.collection('messmenu').doc(day);
    await messMenuRef.update({
      [period]: foodDetails,
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `${period} for ${day} updated successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export async function deleteMealPeriod(day, period) {
  try {
    const messMenuRef = firestore.collection('messmenu').doc(day);
    await messMenuRef.update({
      [period]: {},
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `${period} for ${day} deleted successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
export async function getMealPeriod(day, period) {
  try {
    const messMenuRef = firestore.collection('messmenu').doc(day);
    const snapshot = await messMenuRef.get();

    if (!snapshot.exists) {
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

export async function deleteDayMenu(day) {
  try {
    const messMenuRef = firestore.collection('messmenu').doc(day);
    await messMenuRef.update({
      breakfast: {},
      lunch: {},
      snacks: {},
      dinner: {},
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `Menu for ${day} deleted successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

