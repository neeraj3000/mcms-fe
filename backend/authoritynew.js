// import bcrypt from 'bcrypt'; // For password hashing
import { collection, query, where, orderBy, limit, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { Timestamp } from "firebase/firestore"; // For timestamps
import { firestore } from './firebase'; // Import Firestore configuration from your firebase.js

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

  