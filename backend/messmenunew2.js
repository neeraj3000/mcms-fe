import { firestore } from './firebase';
import { Timestamp, collection, doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore'; // Modular SDK imports

const initialMenu = {
  Monday: { breakfast: {}, lunch: {}, snacks: {}, dinner: {} },
  Tuesday: { breakfast: {}, lunch: {}, snacks: {}, dinner: {} },
  Wednesday: { breakfast: {}, lunch: {}, snacks: {}, dinner: {} },
  Thursday: { breakfast: {}, lunch: {}, snacks: {}, dinner: {} },
  Friday: { breakfast: {}, lunch: {}, snacks: {}, dinner: {} },
  Saturday: { breakfast: {}, lunch: {}, snacks: {}, dinner: {} },
  Sunday: { breakfast: {}, lunch: {}, snacks: {}, dinner: {} },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

// Initialize Mess Menu
export async function initializeMessMenu() {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (snapshot.exists()) {
      return { success: false, message: 'Mess menu is already initialized.' };
    }

    await setDoc(messMenuRef, initialMenu);
    return { success: true, message: 'Mess menu initialized successfully.' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Mess Menu
export async function getMessMenu() {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'Mess menu not found. Please initialize the menu first.' };
    }

    return { success: true, menu: snapshot.data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Day Menu
export async function getDayMenu(day) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'Mess menu not found. Please initialize the menu first.' };
    }

    const menu = snapshot.data();
    if (!menu[day]) {
      return { success: false, message: `No menu found for ${day}.` };
    }

    return { success: true, dayMenu: menu[day] };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Day Menu
export async function updateDayMenu(day, updatedMenu) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'Mess menu not found. Please initialize the menu first.' };
    }

    const menu = snapshot.data();
    menu[day] = { ...menu[day], ...updatedMenu };
    menu.updatedAt = Timestamp.now();

    await updateDoc(messMenuRef, menu);
    return { success: true, message: `Menu for ${day} updated successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Menu Meal Period
export async function updateMealPeriod(day, period, foodDetails) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'Mess menu not found. Please initialize the menu first.' };
    }

    const menu = snapshot.data();
    if (!menu[day]) {
      return { success: false, message: `No menu found for ${day}.` };
    }

    menu[day][period] = foodDetails;
    menu.updatedAt = Timestamp.now();

    await updateDoc(messMenuRef, menu);
    return { success: true, message: `${period} for ${day} updated successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Menu by Meal Period
export async function deleteMealPeriod(day, period) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'Mess menu not found. Please initialize the menu first.' };
    }

    const menu = snapshot.data();
    if (!menu[day]) {
      return { success: false, message: `No menu found for ${day}.` };
    }

    menu[day][period] = {};
    menu.updatedAt = Timestamp.now();

    await updateDoc(messMenuRef, menu);
    return { success: true, message: `${period} for ${day} deleted successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Menu by Day
export async function deleteDayMenu(day) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'Mess menu not found. Please initialize the menu first.' };
    }

    const menu = snapshot.data();
    menu[day] = { breakfast: {}, lunch: {}, snacks: {}, dinner: {} };
    menu.updatedAt = Timestamp.now();

    await updateDoc(messMenuRef, menu);
    return { success: true, message: `Menu for ${day} deleted successfully.` };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Meal Period Menu
export async function getMealPeriodMenu(day, period) {
  try {
    const messMenuRef = doc(firestore, 'messmenu', 'menu');
    const snapshot = await getDoc(messMenuRef);

    if (!snapshot.exists()) {
      return { success: false, message: 'Mess menu not found. Please initialize the menu first.' };
    }

    const menu = snapshot.data();

    if (!menu[day]) {
      return { success: false, message: `No menu found for ${day}.` };
    }
    if (!menu[day][period]) {
      return { success: false, message: `No menu found for ${period} on ${day}.` };
    }

    return { success: true, mealPeriodMenu: menu[day][period] };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
