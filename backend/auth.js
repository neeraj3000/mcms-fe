const bcrypt = require("bcryptjs");// For password hashing and comparison
import { firestore } from "./firebase"; // Import Firestore

// Login function
export async function login({ email, password }) {
  try {
    // Check if both email and password are provided
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    // Fetch user document from Firestore using email
    const usersRef = firestore.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    // If user not found, return error message
    if (snapshot.empty) {
      return { success: false, message: "User not found." };
    }

    // Get user document data
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Compare provided password with the hashed password stored in Firestore
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    // If password is invalid, return error message
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
