// import bcrypt from 'bcrypt'; // For password hashing
import { collection, query, where, orderBy, limit, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { Timestamp } from "firebase/firestore"; // For timestamps
import { firestore } from './firebase'; // Import Firestore configuration from your firebase.js
import * as FileSystem from "expo-file-system";

// const SALT_ROUNDS = 10; // Define the number of salt rounds for bcrypt

/*// Register Authority(need update)
export async function registerAuthority({ name, mobileNo, email, password }) {
    try {
      if (!name || !mobileNo || !email || !password) {
        return { success: false, message: 'All fields are required' };
      }
  
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      const usersRef = collection(firestore, 'users');
      const authorityRef = collection(firestore, 'authority');
  
      // Generate auto-incrementing userId
      const lastUserQuery = query(usersRef, orderBy('userId', 'desc'), limit(1));
      const lastUserSnapshot = await getDocs(lastUserQuery);
      const newUserId = lastUserSnapshot.empty ? 1 : lastUserSnapshot.docs[0].data().userId + 1;
  
      // Add user document
      const userData = {
        userId: newUserId,
        role: 'authority',
        email,
        password: hashedPassword,
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(usersRef, newUserId.toString()), userData);
  
      // Generate auto-incrementing authorityId
      const lastAuthorityQuery = query(authorityRef, orderBy('authorityId', 'desc'), limit(1));
      const lastAuthoritySnapshot = await getDocs(lastAuthorityQuery);
      const newAuthorityId = lastAuthoritySnapshot.empty ? 1 : lastAuthoritySnapshot.docs[0].data().authorityId + 1;
  
      // Add authority document
      const authorityData = {
        authorityId: newAuthorityId,
        name,
        mobileNo,
        userId: newUserId,
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(authorityRef, newAuthorityId.toString()), authorityData);
  
      return { success: true, message: 'Authority registered successfully', authorityId: newAuthorityId };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
}*/
 
// Register Authority
export async function registerAuthority({ name, mobileNo, email, password }) {
  try {
    if (!name || !mobileNo || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    const usersRef = collection(firestore, 'users');
    const authorityRef = collection(firestore, 'authority');

    // Generate auto-incrementing userId
    const lastUserQuery = query(usersRef, orderBy('userId', 'desc'), limit(1));
    const lastUserSnapshot = await getDocs(lastUserQuery);
    const newUserId = lastUserSnapshot.empty ? 1 : lastUserSnapshot.docs[0].data().userId + 1;

    // Add user document
    const userData = {
      userId: newUserId,
      role: 'authority',
      email,
      password, // Plain text password
      createdAt: Timestamp.now(),
    };
    await setDoc(doc(usersRef, newUserId.toString()), userData);

    // Generate auto-incrementing authorityId
    const lastAuthorityQuery = query(authorityRef, orderBy('authorityId', 'desc'), limit(1));
    const lastAuthoritySnapshot = await getDocs(lastAuthorityQuery);
    const newAuthorityId = lastAuthoritySnapshot.empty ? 1 : lastAuthoritySnapshot.docs[0].data().authorityId + 1;

    // Add authority document
    const authorityData = {
      authorityId: newAuthorityId,
      name,
      mobileNo,
      userId: newUserId,
      createdAt: Timestamp.now(),
    };
    await setDoc(doc(authorityRef, newAuthorityId.toString()), authorityData);

    return { success: true, message: 'Authority registered successfully', authorityId: newAuthorityId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

  // Get All Authorities
export async function getAllAuthorities() {
    try {
      const authorityRef = collection(firestore, 'authority');
      const snapshot = await getDocs(authorityRef);
  
      if (snapshot.empty) {
        return { success: false, message: 'No authorities found' };
      }
  
      const authorityList = snapshot.docs.map((doc) => doc.data());
  
      return { success: true, authorities: authorityList };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
  
  // Get Authority by ID
export async function getAuthorityById(authorityId) {
    try {
      const authorityRef = collection(firestore, 'authority');
      const authorityQuery = query(authorityRef, where('authorityId', '==', parseInt(authorityId)));
      const snapshot = await getDocs(authorityQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Authority not found' };
      }
  
      return { success: true, authority: snapshot.docs[0].data() };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
  
  // Update Authority Profile
export async function updateAuthorityProfile(authorityId, { name, mobileNo }) {
    try {
      if (!name && !mobileNo) {
        return { success: false, message: 'At least one field is required to update' };
      }
  
      const authorityRef = collection(firestore, 'authority');
      const authorityQuery = query(authorityRef, where('authorityId', '==', parseInt(authorityId)));
      const snapshot = await getDocs(authorityQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Authority not found' };
      }
  
      const authorityDoc = snapshot.docs[0];
      const updatedData = {};
      if (name) updatedData.name = name;
      if (mobileNo) updatedData.mobileNo = mobileNo;
      updatedData.updatedAt = Timestamp.now();
  
      await updateDoc(doc(firestore, 'authority', authorityDoc.id), updatedData);
  
      return { success: true, message: 'Authority profile updated successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
  
 /* // Update Authority Password(need update)
export async function updateAuthorityPassword(authorityId, { newPassword }) {
    try {
      if (!newPassword) {
        return { success: false, message: 'New password is required' };
      }
  
      const authorityRef = collection(firestore, 'authority');
      const authorityQuery = query(authorityRef, where('authorityId', '==', parseInt(authorityId)));
      const snapshot = await getDocs(authorityQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Authority not found' };
      }
  
      const authorityDoc = snapshot.docs[0];
      const userId = authorityDoc.data().userId;
  
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        return { success: false, message: 'User not found' };
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  
      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(firestore, 'users', userDoc.id), { password: hashedPassword, updatedAt: Timestamp.now() });
  
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }*/

// Update Authority Password
export async function updateAuthorityPassword(authorityId, { newPassword }) {
  try {
    if (!newPassword) {
      return { success: false, message: 'New password is required' };
    }

    const authorityRef = collection(firestore, 'authority');
    const authorityQuery = query(
      authorityRef,
      where('authorityId', '==', parseInt(authorityId))
    );
    const snapshot = await getDocs(authorityQuery);

    if (snapshot.empty) {
      return { success: false, message: 'Authority not found' };
    }

    const authorityDoc = snapshot.docs[0];
    const userId = authorityDoc.data().userId;

    const usersRef = collection(firestore, 'users');
    const userQuery = query(usersRef, where('userId', '==', userId));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return { success: false, message: 'User not found' };
    }

    const userDoc = userSnapshot.docs[0];
    const userDocRef = doc(firestore, 'users', userDoc.id);

    await updateDoc(userDocRef, {
      password: newPassword, // Plain text password
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
  
  // Delete Authority by ID
export async function deleteAuthorityById(authorityId) {
    try {
      const authorityRef = collection(firestore, 'authority');
      const authorityQuery = query(authorityRef, where('authorityId', '==', parseInt(authorityId)));
      const snapshot = await getDocs(authorityQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Authority not found' };
      }
  
      const authorityDoc = snapshot.docs[0];
      const userId = authorityDoc.data().userId;
  
      await deleteDoc(doc(firestore, 'authority', authorityDoc.id));
  
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        await deleteDoc(doc(firestore, 'users', userSnapshot.docs[0].id));
      }
  
      return { success: true, message: 'Authority deleted successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }
  
  // Get Authority by UserId
export async function getAuthorityByUserId(userId) {
    try {
      const authorityRef = collection(firestore, 'authority');
      const authorityQuery = query(authorityRef, where('userId', '==', parseInt(userId)));
      const snapshot = await getDocs(authorityQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Authority not found' };
      }
  
      const authorityDoc = snapshot.docs[0];
      const authorityData = authorityDoc.data();
  
      return { success: true, authorityId: authorityData.authorityId };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  }

export async function uploadToCloudinary(image, type) {
  try {
    console.log("Starting Cloudinary upload...");
    console.log("Image path:", image);
    console.log("Image type:", type);

    if (!image || typeof image !== "string") {
      throw new Error("Invalid image path provided.");
    }

    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dwi8fucyt/upload";
    const uploadPreset = "mcms-issue";

    console.log("Reading image as Base64...");
    const blob = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });
    console.log("Base64 string created. Length:", blob.length);

    console.log("Preparing form data...");
    const formData = new FormData();
    formData.append("file", `data:${type}/;base64,${blob}`);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", "dwi8fucyt");

    console.log("Sending request to Cloudinary...");
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    console.log("Response received from Cloudinary.");
    const responseData = await uploadResponse.json();
    console.log("Cloudinary response data:", responseData);

    if (responseData.secure_url) {
      console.log("Image uploaded successfully:", responseData.secure_url);
      return responseData.secure_url;
    } else {
      throw new Error(responseData.error?.message || "Image upload failed");
    }
  } catch (err) {
    console.error("Error during Cloudinary upload:", err);
    throw new Error(err.message);
  }
}

  // Function to create a new messsurvey document with optional image (null if not provided)
export const createMessSurvey = async (messNo, remarks, imageUrl, datetime) => {
  try {
    const messSurveyRef = collection(firestore, "messsurvey");

    // If an imageUrl is provided, upload it to Cloudinary, otherwise set image to null
    let cloudinaryImageUrl = null;
    if (imageUrl) {
      const imageType = imageUrl.split('.').pop(); // Get image type (extension)
      cloudinaryImageUrl = await uploadToCloudinary(imageUrl, imageType); // Upload and get Cloudinary URL
    }

    // Prepare the document data
    const surveyData = {
      messNo,
      remarks,
      datetime,
      image: cloudinaryImageUrl || null, // Set image to null if no imageUrl is provided
    };

    // Add the document to the messsurvey collection
    const docRef = await addDoc(messSurveyRef, surveyData);
    console.log("Document created with ID: ", docRef.id);
    return { success: true, message: "Survey created successfully", id: docRef.id };
  } catch (err) {
    console.error("Error adding document: ", err);
    return { success: false, message: err.message };
  }
};