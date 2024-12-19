import { firestore } from './firebase'; // Import Firestore configuration from your firebase.js
const bcrypt = require('bcrypt');
import { collection, query, where, getDocs, orderBy, limit, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
const SALT_ROUNDS = 10;

// Register Supervisor
export const registerSupervisor = async ({ name, mobileNo, email, password }) => {
  try {
    if (!name || !mobileNo || !email || !password) {
      return { success: false, message: 'All fields are required' };
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const usersRef = collection(firestore, 'users');
    const supervisorsRef = collection(firestore, 'supervisor');

    const lastUserQuery = query(usersRef, orderBy('userId', 'desc'), limit(1));
    const lastUserSnapshot = await getDocs(lastUserQuery);
    const newUserId = lastUserSnapshot.empty ? 1 : lastUserSnapshot.docs[0].data().userId + 1;

    const userDocRef = doc(usersRef, newUserId.toString());
    const userData = {
      userId: newUserId,
      role: 'supervisor',
      email,
      password: hashedPassword,
      createdAt: Timestamp.now(),
    };
    await setDoc(userDocRef, userData);

    const lastSupervisorQuery = query(supervisorsRef, orderBy('supervisorId', 'desc'), limit(1));
    const lastSupervisorSnapshot = await getDocs(lastSupervisorQuery);
    const newSupervisorId = lastSupervisorSnapshot.empty ? 1 : lastSupervisorSnapshot.docs[0].data().supervisorId + 1;

    const supervisorDocRef = doc(supervisorsRef, newSupervisorId.toString());
    const supervisorData = {
      supervisorId: newSupervisorId,
      name,
      mobileNo,
      userId: newUserId,
      createdAt: Timestamp.now(),
    };
    await setDoc(supervisorDocRef, supervisorData);

    return { success: true, message: 'Supervisor registered successfully', supervisorId: newSupervisorId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Get All Supervisors
export const getAllSupervisors = async () => {
    try {
      const supervisorsRef = collection(firestore, 'supervisor');
      const snapshot = await getDocs(supervisorsRef);
  
      if (snapshot.empty) {
        return { success: false, message: 'No supervisors found' };
      }
  
      const supervisorsList = snapshot.docs.map((doc) => doc.data());
      return { success: true, supervisors: supervisorsList };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Get All Supervisors by Mess ID
export const getSupervisorsByMessId = async (messId) => {
    try {
      if (!messId) {
        return { success: false, message: 'Mess ID is required' };
      }
  
      const supervisorsRef = collection(firestore, 'supervisor');
      const messQuery = query(supervisorsRef, where('messId', '==', parseInt(messId)));
      const snapshot = await getDocs(messQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'No supervisors found for this mess' };
      }
  
      const supervisorsList = snapshot.docs.map((doc) => doc.data());
      return { success: true, supervisors: supervisorsList };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Get Supervisor by ID
export const getSupervisorById = async (supervisorId) => {
    try {
      const supervisorsRef = collection(firestore, 'supervisor');
      const idQuery = query(supervisorsRef, where('supervisorId', '==', parseInt(supervisorId)));
      const snapshot = await getDocs(idQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Supervisor not found' };
      }
  
      return { success: true, supervisor: snapshot.docs[0].data() };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Update Supervisor Profile
export const updateSupervisorProfile = async (supervisorId, name, mobileNo ) => {
    try {
      if (!name && !mobileNo) {
        return { success: false, message: 'At least one field is required to update' };
      }
  
      const supervisorsRef = collection(firestore, 'supervisor');
      const idQuery = query(supervisorsRef, where('supervisorId', '==', parseInt(supervisorId)));
      const snapshot = await getDocs(idQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Supervisor not found' };
      }
  
      const supervisorDoc = snapshot.docs[0];
      const updatedData = {};
      if (name) updatedData.name = name;
      if (mobileNo) updatedData.mobileNo = mobileNo;
      updatedData.updatedAt = Timestamp.now();
  
      await updateDoc(supervisorDoc.ref, updatedData);
  
      return { success: true, message: 'Supervisor profile updated successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Delete Supervisor by ID
export const deleteSupervisorById = async (supervisorId) => {
    try {
      const supervisorsRef = collection(firestore, 'supervisor');
      const idQuery = query(supervisorsRef, where('supervisorId', '==', parseInt(supervisorId)));
      const snapshot = await getDocs(idQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Supervisor not found' };
      }
  
      const supervisorDoc = snapshot.docs[0];
      const userId = supervisorDoc.data().userId;
  
      await deleteDoc(supervisorDoc.ref);
  
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        await deleteDoc(userSnapshot.docs[0].ref);
      }
  
      return { success: true, message: 'Supervisor deleted successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Update Supervisor Password
export const updateSupervisorPassword = async (supervisorId, newPassword) => {
    try {
      if (!newPassword) {
        return { success: false, message: 'New password is required' };
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  
      const supervisorsRef = collection(firestore, 'supervisor');
      const idQuery = query(supervisorsRef, where('supervisorId', '==', parseInt(supervisorId)));
      const snapshot = await getDocs(idQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Supervisor not found' };
      }
  
      const supervisorDoc = snapshot.docs[0];
      const userId = supervisorDoc.data().userId;
  
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        return { success: false, message: 'User not found' };
      }
  
      const userDoc = userSnapshot.docs[0];
      await updateDoc(userDoc.ref, { password: hashedPassword, updatedAt: Timestamp.now() });
  
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Get Supervisor by UserId
export const getSupervisorByUserId = async (userId) => {
    try {
      const supervisorsRef = collection(firestore, 'supervisor');
      const idQuery = query(supervisorsRef, where('userId', '==', parseInt(userId)));
      const snapshot = await getDocs(idQuery);
  
      if (snapshot.empty) {
        return { success: false, message: 'Supervisor not found' };
      }
  
      const supervisorDoc = snapshot.docs[0];
      const supervisorData = supervisorDoc.data();
  
      return { success: true, supervisorId: supervisorData.supervisorId };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };
  
