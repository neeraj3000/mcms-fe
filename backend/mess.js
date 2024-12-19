import { firestore} from './firebase'; // Import Firestore and Timestamp from firebase.js
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for timestamps
// Add Mess Representatives (MRs) by Emails
async function addMessRepresentativesByEmails(messId, representativeEmails) {
  try {
    if (!representativeEmails || representativeEmails.length === 0) {
      return { success: false, message: 'List of representative emails is required' };
    }

    const usersRef = firestore.collection('users');
    const validEmails = [];

    for (const email of representativeEmails) {
      const userSnapshot = await usersRef.where('email', '==', email).get();
      if (userSnapshot.empty) {
        return { success: false, message: `User with email ${email} not found` };
      }

      const userDoc = userSnapshot.docs[0];
      const userId = userDoc.data().userId;

      const representativeRef = firestore.collection('representative');
      const repSnapshot = await representativeRef.where('userId', '==', userId).get();

      if (!repSnapshot.empty) {
        validEmails.push(email);
      } else {
        return { success: false, message: `User with email ${email} is not a representative` };
      }
    }

    const messRef = firestore.collection('mess');
    const messSnapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (messSnapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = messSnapshot.docs[0];
    const messData = messDoc.data();
    const updatedSetofMrEmails = messData.setofmr || [];

    for (const email of validEmails) {
      if (!updatedSetofMrEmails.includes(email)) {
        updatedSetofMrEmails.push(email);
      }
    }

    await messDoc.ref.update({ setofmr: updatedSetofMrEmails, updatedAt: Timestamp.now() });

    return { success: true, message: 'Representatives added to mess successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Batches by Mess ID
async function getBatchesByMessId(messId) {
  try {
    if (!messId) {
      return { success: false, message: 'Mess ID is required' };
    }

    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = snapshot.docs[0];
    const messData = messDoc.data();

    return { success: true, batches: messData.batches };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Gender by Mess ID
async function getGenderByMessId(messId) {
  try {
    if (!messId) {
      return { success: false, message: 'Mess ID is required' };
    }

    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = snapshot.docs[0];
    const messData = messDoc.data();

    return { success: true, gender: messData.gender };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Supervisors in a Mess
async function getSupervisorsByMessId(messId) {
  try {
    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = snapshot.docs[0];
    const messData = messDoc.data();
    return { success: true, supervisors: messData.supervisorEmails || [] };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Mess Representatives in a Mess
async function getMessRepresentativesByMessId(messId) {
  try {
    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = snapshot.docs[0];
    const messData = messDoc.data();
    return { success: true, messRepresentatives: messData.setofmr || [] };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Create Mess Document
async function createMess({ name, capacity, batches = [], gender = null }) {
  try {
    if (!name || !capacity) {
      return { success: false, message: 'Name and capacity are required.' };
    }

    const messRef = firestore.collection('mess');
    const lastMess = await messRef.orderBy('messId', 'desc').limit(1).get();
    const newMessId = lastMess.empty ? 1 : lastMess.docs[0].data().messId + 1;

    const messData = {
      messId: newMessId,
      name,
      capacity: parseInt(capacity),
      setofmr: [],
      supervisorEmails: [],
      batches,
      gender,
      createdAt: Timestamp.now(),
    };

    await messRef.doc(newMessId.toString()).set(messData);
    return { success: true, message: 'Mess created successfully', messId: newMessId };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Mess Documents
async function getAllMess() {
  try {
    const messRef = firestore.collection('mess');
    const snapshot = await messRef.get();

    if (snapshot.empty) {
      return { success: false, message: 'No mess records found' };
    }

    const messList = [];
    snapshot.forEach((doc) => messList.push(doc.data()));

    return { success: true, messList };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Mess Document by ID
async function getMessById(messId) {
  try {
    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    return { success: true, mess: snapshot.docs[0].data() };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Mess Details
async function updateMessDetails(messId, { name, capacity, batches, gender }) {
  try {
    if (!name && !capacity && !batches && !gender) {
      return { success: false, message: 'No details provided to update.' };
    }

    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = snapshot.docs[0];
    const updatedData = {};

    if (name) updatedData.name = name;
    if (capacity) updatedData.capacity = parseInt(capacity);
    if (batches) updatedData.batches = batches;
    if (gender) updatedData.gender = gender;

    updatedData.updatedAt = Timestamp.now();

    await messDoc.ref.update(updatedData);
    return { success: true, message: 'Mess details updated successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Mess Document
async function deleteMess(messId) {
  try {
    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = snapshot.docs[0];
    await messDoc.ref.delete();

    return { success: true, message: 'Mess deleted successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Add Supervisor to Mess
async function addSupervisorToMess(messId, email) {
  try {
    if (!email) {
      return { success: false, message: 'Supervisor email is required' };
    }

    const usersRef = firestore.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).where('role', '==', 'supervisor').get();

    if (userSnapshot.empty) {
      return { success: false, message: 'Supervisor not found or invalid role.' };
    }

    const messRef = firestore.collection('mess');
    const messSnapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (messSnapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = messSnapshot.docs[0];
    const messData = messDoc.data();

    if (messData.supervisorEmails.includes(email)) {
      return { success: false, message: 'Supervisor already added to this mess.' };
    }

    const supervisorEmails = [...messData.supervisorEmails, email];
    await messDoc.ref.update({ supervisorEmails, updatedAt: Timestamp.now() });

    return { success: true, message: 'Supervisor added successfully', supervisorEmails };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Batches and Gender by Mess ID
async function getBatchesAndGenderByMessId(messId) {
  try {
    if (!messId) {
      return { success: false, message: 'Mess ID is required' };
    }

    const messRef = firestore.collection('mess');
    const snapshot = await messRef.where('messId', '==', parseInt(messId)).get();

    if (snapshot.empty) {
      return { success: false, message: 'Mess not found' };
    }

    const messDoc = snapshot.docs[0];
    const messData = messDoc.data();

    return {
      success: true,
      batches: messData.batches || [],
      gender: messData.gender || null,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  createMess,
  getAllMess,
  getMessById,
  updateMessDetails,
  deleteMess,
  addSupervisorToMess,
  addMessRepresentativesByEmails,
  getBatchesByMessId,
  getGenderByMessId,
  getSupervisorsByMessId,
  getMessRepresentativesByMessId,
  getBatchesAndGenderByMessId
};
