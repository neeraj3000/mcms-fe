import { collection, getDocs, query, where, orderBy, limit, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import bcrypt from 'bcrypt';

// Salt rounds for bcrypt
const saltRounds = 10;

// Register Coordinator
export async function registerCoordinator(name, mobileNo, email, password) {
  try {
    if (!name || !mobileNo || !email || !password) {
      throw new Error('All fields are required');
    }

    const usersRef = collection(firestore, 'users');
    const coordinatorsRef = collection(firestore, 'coordinator');

    const lastUserQuery = query(usersRef, orderBy('userId', 'desc'), limit(1));
    const lastUserSnapshot = await getDocs(lastUserQuery);
    const newUserId = lastUserSnapshot.empty ? 1 : lastUserSnapshot.docs[0].data().userId + 1;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      userId: newUserId,
      role: 'coordinator',
      email,
      password: hashedPassword,
      createdAt: serverTimestamp(),
    };
    await addDoc(usersRef, userData);

    const lastCoordinatorQuery = query(coordinatorsRef, orderBy('coordinatorId', 'desc'), limit(1));
    const lastCoordinatorSnapshot = await getDocs(lastCoordinatorQuery);
    const newCoordinatorId = lastCoordinatorSnapshot.empty ? 1 : lastCoordinatorSnapshot.docs[0].data().coordinatorId + 1;

    const coordinatorData = {
      coordinatorId: newCoordinatorId,
      name,
      mobileNo,
      userId: newUserId,
      createdAt: serverTimestamp(),
    };
    await addDoc(coordinatorsRef, coordinatorData);

    return { success: true, message: 'Coordinator registered successfully', coordinatorId: newCoordinatorId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Coordinators
export async function getAllCoordinators() {
  try {
    const coordinatorsRef = collection(firestore, 'coordinator');
    const snapshot = await getDocs(coordinatorsRef);

    if (snapshot.empty) {
      return { success: false, message: 'No coordinators found' };
    }

    const coordinatorsList = snapshot.docs.map(doc => doc.data());
    return { success: true, coordinators: coordinatorsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Coordinator by ID
export async function getCoordinatorById(coordinatorId) {
  try {
    const coordinatorsRef = collection(firestore, 'coordinator');
    const coordinatorQuery = query(coordinatorsRef, where('coordinatorId', '==', parseInt(coordinatorId)));
    const snapshot = await getDocs(coordinatorQuery);

    if (snapshot.empty) {
      return { success: false, message: 'Coordinator not found' };
    }

    return { success: true, coordinator: snapshot.docs[0].data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Coordinator Profile
export async function updateCoordinatorProfile(coordinatorId, name, mobileNo) {
  try {
    if (!name && !mobileNo) {
      throw new Error('At least one field is required to update');
    }

    const coordinatorsRef = collection(firestore, 'coordinator');
    const coordinatorQuery = query(coordinatorsRef, where('coordinatorId', '==', parseInt(coordinatorId)));
    const snapshot = await getDocs(coordinatorQuery);

    if (snapshot.empty) {
      return { success: false, message: 'Coordinator not found' };
    }

    const coordinatorDoc = snapshot.docs[0];
    const coordinatorDocRef = doc(firestore, 'coordinator', coordinatorDoc.id);

    const updatedData = {};
    if (name) updatedData.name = name;
    if (mobileNo) updatedData.mobileNo = mobileNo;
    updatedData.updatedAt = serverTimestamp();

    await updateDoc(coordinatorDocRef, updatedData);

    return { success: true, message: 'Coordinator profile updated successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Coordinator Password
export async function updateCoordinatorPassword(coordinatorId, newPassword) {
  try {
    if (!newPassword) {
      throw new Error('New password is required');
    }

    const coordinatorsRef = collection(firestore, 'coordinator');
    const coordinatorQuery = query(coordinatorsRef, where('coordinatorId', '==', parseInt(coordinatorId)));
    const snapshot = await getDocs(coordinatorQuery);

    if (snapshot.empty) {
      return { success: false, message: 'Coordinator not found' };
    }

    const coordinatorDoc = snapshot.docs[0];
    const userId = coordinatorDoc.data().userId;

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const usersRef = collection(firestore, 'users');
    const userQuery = query(usersRef, where('userId', '==', userId));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return { success: false, message: 'User not found' };
    }

    const userDoc = userSnapshot.docs[0];
    const userDocRef = doc(firestore, 'users', userDoc.id);

    await updateDoc(userDocRef, { password: hashedPassword, updatedAt: serverTimestamp() });

    return { success: true, message: 'Password updated successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Coordinator by ID
export async function deleteCoordinatorById(coordinatorId) {
  try {
    const coordinatorsRef = collection(firestore, 'coordinator');
    const coordinatorQuery = query(coordinatorsRef, where('coordinatorId', '==', parseInt(coordinatorId)));
    const snapshot = await getDocs(coordinatorQuery);

    if (snapshot.empty) {
      return { success: false, message: 'Coordinator not found' };
    }

    const coordinatorDoc = snapshot.docs[0];
    const userId = coordinatorDoc.data().userId;

    const coordinatorDocRef = doc(firestore, 'coordinator', coordinatorDoc.id);
    await deleteDoc(coordinatorDocRef);

    const usersRef = collection(firestore, 'users');
    const userQuery = query(usersRef, where('userId', '==', userId));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userDocRef = doc(firestore, 'users', userSnapshot.docs[0].id);
      await deleteDoc(userDocRef);
    }

    return { success: true, message: 'Coordinator deleted successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Supervisor by UserId
export async function getSupervisorByUserId(userId) {
  try {
    const supervisorsRef = collection(firestore, 'supervisor');
    const supervisorQuery = query(supervisorsRef, where('userId', '==', userId));
    const snapshot = await getDocs(supervisorQuery);

    if (snapshot.empty) {
      return { success: false, message: 'Supervisor not found' };
    }

    const supervisorData = snapshot.docs[0].data();
    return { success: true, supervisorId: supervisorData.supervisorId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
