const bcrypt = require("bcryptjs");// For password hashing
import { firestore } from "./firebase"; // Import Firestore and Timestamp from firebase.js
import { Timestamp } from "firebase/firestore"; // Import Timestamp for timestamps

const SALT_ROUNDS = 10; // Define the number of salt rounds for bcrypt

// Register Authority
async function registerAuthority({ name, mobileNo, email, password }) {
  try {
    // Input validation
    if (!name || !mobileNo || !email || !password) {
      return { success: false, message: "All fields are required" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Firestore references
    const usersRef = firestore.collection("users");
    const authorityRef = firestore.collection("authority");

    // Generate auto-incrementing userId
    const lastUser = await usersRef.orderBy("userId", "desc").limit(1).get();
    const newUserId = lastUser.empty ? 1 : lastUser.docs[0].data().userId + 1;

    // Add user document
    const userData = {
      userId: newUserId,
      role: "authority", // Static role
      email,
      password: hashedPassword, // Save hashed password
      createdAt: Timestamp.now(),
    };
    await usersRef.doc(newUserId.toString()).set(userData);

    // Generate auto-incrementing authorityId
    const lastAuthority = await authorityRef
      .orderBy("authorityId", "desc")
      .limit(1)
      .get();
    const newAuthorityId = lastAuthority.empty
      ? 1
      : lastAuthority.docs[0].data().authorityId + 1;

    // Add authority document
    const authorityData = {
      authorityId: newAuthorityId,
      name,
      mobileNo,
      userId: newUserId,
      createdAt: Timestamp.now(),
    };
    await authorityRef.doc(newAuthorityId.toString()).set(authorityData);

    return {
      success: true,
      message: "Authority registered successfully",
      authorityId: newAuthorityId,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Authorities
async function getAllAuthorities() {
  try {
    const authorityRef = firestore.collection("authority");
    const snapshot = await authorityRef.get();

    if (snapshot.empty) {
      return { success: false, message: "No authorities found" };
    }

    const authorityList = [];
    snapshot.forEach((doc) => authorityList.push(doc.data()));

    return { success: true, authorities: authorityList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Authority by ID
async function getAuthorityById(authorityId) {
  try {
    const authorityRef = firestore.collection("authority");
    const snapshot = await authorityRef
      .where("authorityId", "==", parseInt(authorityId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Authority not found" };
    }

    return { success: true, authority: snapshot.docs[0].data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Authority Profile
async function updateAuthorityProfile(authorityId, { name, mobileNo }) {
  try {
    if (!name && !mobileNo) {
      return {
        success: false,
        message: "At least one field is required to update",
      };
    }

    const authorityRef = firestore.collection("authority");
    const snapshot = await authorityRef
      .where("authorityId", "==", parseInt(authorityId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Authority not found" };
    }

    const authorityDoc = snapshot.docs[0];
    const updatedData = {};
    if (name) updatedData.name = name;
    if (mobileNo) updatedData.mobileNo = mobileNo;
    updatedData.updatedAt = Timestamp.now();

    await authorityDoc.ref.update(updatedData);

    return { success: true, message: "Authority profile updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Authority Password
async function updateAuthorityPassword(authorityId, { newPassword }) {
  try {
    if (!newPassword) {
      return { success: false, message: "New password is required" };
    }

    const authorityRef = firestore.collection("authority");
    const snapshot = await authorityRef
      .where("authorityId", "==", parseInt(authorityId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Authority not found" };
    }

    const authorityDoc = snapshot.docs[0];
    const userId = authorityDoc.data().userId;

    // Update password in users collection
    const usersRef = firestore.collection("users");
    const userSnapshot = await usersRef.where("userId", "==", userId).get();

    if (userSnapshot.empty) {
      return { success: false, message: "User not found" };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

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

// Delete Authority by ID
async function deleteAuthorityById(authorityId) {
  try {
    const authorityRef = firestore.collection("authority");
    const snapshot = await authorityRef
      .where("authorityId", "==", parseInt(authorityId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Authority not found" };
    }

    const authorityDoc = snapshot.docs[0];
    const userId = authorityDoc.data().userId;

    // Delete from authority collection
    await authorityDoc.ref.delete();

    // Delete corresponding user document
    const usersRef = firestore.collection("users");
    const userSnapshot = await usersRef.where("userId", "==", userId).get();
    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.delete();
    }

    return { success: true, message: "Authority deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Authority by UserId
async function getAuthorityByUserId(userId) {
  try {
    // Firestore reference to authority collection
    const authorityRef = firestore.collection("authority");

    // Query the authority collection to find the authority by userId
    const snapshot = await authorityRef
      .where("userId", "==", parseInt(userId))
      .get();

    if (snapshot.empty) {
      return { success: false, message: "Authority not found" };
    }

    // Retrieve authority data
    const authorityDoc = snapshot.docs[0];
    const authorityData = authorityDoc.data();

    // Return the authority's ID
    return { success: true, authorityId: authorityData.authorityId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  registerAuthority,
  getAllAuthorities,
  getAuthorityById,
  updateAuthorityProfile,
  updateAuthorityPassword,
  deleteAuthorityById,
  getAuthorityByUserId,
};
