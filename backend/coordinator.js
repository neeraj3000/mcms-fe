import { firestore} from './firebase'; // Import firestore and Timestamp
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for timestamps
const bcrypt = require("bcryptjs");


// Salt rounds for bcrypt
const saltRounds = 10;

// Register Coordinator
export async function registerCoordinator(name, mobileNo, email, password) {
  try {
    if (!name || !mobileNo || !email || !password) {
      throw new Error('All fields are required');
    }

    const usersRef = firestore.collection('users');
    const coordinatorsRef = firestore.collection('coordinator');

    const lastUser = await usersRef.orderBy('userId', 'desc').limit(1).get();
    const newUserId = lastUser.empty ? 1 : lastUser.docs[0].data().userId + 1;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      userId: newUserId,
      role: 'coordinator',
      email,
      password: hashedPassword,
      createdAt: Timestamp.now(),
    };
    await usersRef.doc(newUserId.toString()).set(userData);

    const lastCoordinator = await coordinatorsRef.orderBy('coordinatorId', 'desc').limit(1).get();
    const newCoordinatorId = lastCoordinator.empty ? 1 : lastCoordinator.docs[0].data().coordinatorId + 1;

    const coordinatorData = {
      coordinatorId: newCoordinatorId,
      name,
      mobileNo,
      userId: newUserId,
      createdAt: Timestamp.now(),
    };
    await coordinatorsRef.doc(newCoordinatorId.toString()).set(coordinatorData);

    return { success: true, message: 'Coordinator registered successfully', coordinatorId: newCoordinatorId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Coordinators
export async function getAllCoordinators() {
  try {
    const coordinatorsRef = firestore.collection('coordinator');
    const snapshot = await coordinatorsRef.get();

    if (snapshot.empty) {
      return { success: false, message: 'No coordinators found' };
    }

    const coordinatorsList = [];
    snapshot.forEach((doc) => coordinatorsList.push(doc.data()));

    return { success: true, coordinators: coordinatorsList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Coordinator by ID
export async function getCoordinatorById(coordinatorId) {
  try {
    const coordinatorsRef = firestore.collection('coordinator');
    const snapshot = await coordinatorsRef.where('coordinatorId', '==', parseInt(coordinatorId)).get();

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

    const coordinatorsRef = firestore.collection('coordinator');
    const snapshot = await coordinatorsRef.where('coordinatorId', '==', parseInt(coordinatorId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Coordinator not found' };
    }

    const coordinatorDoc = snapshot.docs[0];
    const updatedData = {};
    if (name) updatedData.name = name;
    if (mobileNo) updatedData.mobileNo = mobileNo;
    updatedData.updatedAt = Timestamp.now();

    await coordinatorDoc.ref.update(updatedData);

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

    const coordinatorsRef = firestore.collection('coordinator');
    const snapshot = await coordinatorsRef.where('coordinatorId', '==', parseInt(coordinatorId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Coordinator not found' };
    }

    const coordinatorDoc = snapshot.docs[0];
    const userId = coordinatorDoc.data().userId;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const usersRef = firestore.collection('users');
    const userSnapshot = await usersRef.where('userId', '==', userId).get();

    if (userSnapshot.empty) {
      return { success: false, message: 'User not found' };
    }

    const userDoc = userSnapshot.docs[0];
    await userDoc.ref.update({ password: hashedPassword, updatedAt: Timestamp.now() });

    return { success: true, message: 'Password updated successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Coordinator by ID
export async function deleteCoordinatorById(coordinatorId) {
  try {
    const coordinatorsRef = firestore.collection('coordinator');
    const snapshot = await coordinatorsRef.where('coordinatorId', '==', parseInt(coordinatorId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Coordinator not found' };
    }

    const coordinatorDoc = snapshot.docs[0];
    const userId = coordinatorDoc.data().userId;

    await coordinatorDoc.ref.delete();

    const usersRef = firestore.collection('users');
    const userSnapshot = await usersRef.where('userId', '==', userId).get();
    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.delete();
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
    const supervisorsRef = firestore.collection('supervisor');
    const snapshot = await supervisorsRef.where('userId', '==', userId).get();

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

