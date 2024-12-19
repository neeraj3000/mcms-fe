import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { compare } from "bcryptjs"; // For password hashing and comparison
import { app } from "./firebase"; // Import initialized Firebase app

// Initialize Firestore
const firestore = getFirestore(app);

// Login function
export async function loginUser({ email, password }) {
  try {
    // Check if both email and password are provided
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    // Create a reference to the 'users' collection
    const usersRef = collection(firestore, "users");

    // Create a query to find the user document with the matching email
    const userQuery = query(usersRef, where("email", "==", email), limit(1));

    // Execute the query
    const snapshot = await getDocs(userQuery);

    // If user not found, return an error message
    if (snapshot.empty) {
      return { success: false, message: "User not found." };
    }

    // Get user document data
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Compare provided password with the hashed password stored in Firestore
    const isPasswordValid = await compare(password, userData.password);

    // If password is invalid, return an error message
    if (!isPasswordValid) {
      return { success: false, message: "Invalid password." };
    }

    // Remove sensitive fields (like password) before returning the user object
    const user = {
      userId: userData.userId,
      role: userData.role,
      email: userData.email,
      createdAt: userData.createdAt,
    };

    // Return success response with user object
    return {
      success: true,
      message: "Login successful.",
      user,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
