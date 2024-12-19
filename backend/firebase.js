import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCTOyHAH6WxyTXZwTS85TExt5QIVB15DdQ",
  authDomain: "mcms-dbc71.firebaseapp.com",
  databaseURL: "https://mcms-dbc71-default-rtdb.firebaseio.com",
  projectId: "mcms-dbc71",
  storageBucket: "mcms-dbc71.firebasestorage.app",
  messagingSenderId: "781096173961",
  appId: "1:781096173961:web:cd3a183c422e72aa8b2158",
  measurementId: "G-6R67B48PVF",
};

const app = initializeApp(firebaseConfig);
if (app) {
  console.log("Firebase connected succeffsully");
}
export const firestore = getFirestore(app);
export const storage = getStorage(app);
