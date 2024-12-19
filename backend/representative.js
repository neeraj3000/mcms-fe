import { firestore} from './firebase'; // Import Firestore and Timestamp
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for timestamps

// Create Representative
export async function createRepresentative(email, messNo) {
  try {
    if (!email || !messNo) {
      throw new Error('Email and messNo are required.');
    }

    const usersRef = firestore.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).where('role', '==', 'student').get();

    if (userSnapshot.empty) {
      throw new Error('User not found or not a student.');
    }

    const userData = userSnapshot.docs[0].data();
    const userId = userData.userId;

    const messRef = firestore.collection('mess');
    const messSnapshot = await messRef.where('messId', '==', parseInt(messNo)).get();

    if (messSnapshot.empty) {
      throw new Error('Mess not found.');
    }

    const representativeRef = firestore.collection('representative');
    const lastMr = await representativeRef.orderBy('mrId', 'desc').limit(1).get();
    const newMrId = lastMr.empty ? 1 : lastMr.docs[0].data().mrId + 1;

    const representativeData = {
      mrId: newMrId,
      userId,
      messNo: parseInt(messNo),
      createdAt: Timestamp.now(),
    };

    await representativeRef.doc(newMrId.toString()).set(representativeData);

    await messRef.doc(messSnapshot.docs[0].id).update({
      setofmr: firestore.FieldValue.arrayUnion(email),
      updatedAt: Timestamp.now(),
    });

    await usersRef.doc(userSnapshot.docs[0].id).update({
      role: 'representative',
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: 'Representative created successfully', mrId: newMrId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get All Representatives
export async function getAllRepresentatives() {
  try {
    const representativeRef = firestore.collection('representative');
    const snapshot = await representativeRef.get();

    if (snapshot.empty) {
      throw new Error('No representatives found.');
    }

    const representatives = [];
    snapshot.forEach((doc) => representatives.push(doc.data()));

    return { success: true, representatives };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get Representative by ID
export async function getRepresentativeById(mrId) {
  try {
    const representativeRef = firestore.collection('representative');
    const snapshot = await representativeRef.where('mrId', '==', parseInt(mrId)).get();

    if (snapshot.empty) {
      throw new Error('Representative not found.');
    }

    return { success: true, representative: snapshot.docs[0].data() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Delete Representative by ID
export async function deleteRepresentativeById(mrId) {
  try {
    const representativeRef = firestore.collection('representative');
    const snapshot = await representativeRef.where('mrId', '==', parseInt(mrId)).get();

    if (snapshot.empty) {
      throw new Error('Representative not found.');
    }

    const representativeDoc = snapshot.docs[0];
    const messNo = representativeDoc.data().messNo;
    const userId = representativeDoc.data().userId;

    const usersRef = firestore.collection('users');
    const userSnapshot = await usersRef.where('userId', '==', userId).get();
    const userEmail = userSnapshot.docs[0]?.data()?.email;

    const messRef = firestore.collection('mess');
    const messSnapshot = await messRef.where('messId', '==', messNo).get();
    if (!messSnapshot.empty) {
      await messSnapshot.docs[0].ref.update({
        setofmr: firestore.FieldValue.arrayRemove(userEmail),
        updatedAt: Timestamp.now(),
      });
    }

    await representativeDoc.ref.delete();

    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.update({
        role: 'student',
        updatedAt: Timestamp.now(),
      });
    }

    return { success: true, message: 'Representative deleted successfully.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get Representatives by Mess Number
export async function getRepresentativesByMessNo(messNo) {
  try {
    if (!messNo) {
      throw new Error('Mess Number is required.');
    }

    const representativeRef = firestore.collection('representative');
    const snapshot = await representativeRef.where('messNo', '==', parseInt(messNo)).get();

    if (snapshot.empty) {
      throw new Error('No representatives found for the given Mess Number.');
    }

    const representatives = [];
    snapshot.forEach((doc) => representatives.push(doc.data()));

    return { success: true, representatives };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get Representative by User ID
export async function getRepresentativeByUserId(userId) {
  try {
    const representativeRef = firestore.collection('representative');
    const snapshot = await representativeRef.where('userId', '==', userId).get();

    if (snapshot.empty) {
      throw new Error('Representative not found.');
    }

    return { success: true, representative: snapshot.docs[0].data() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get MR ID by User ID
export async function getMrIdByUserId(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    const representativeRef = firestore.collection('representative');
    const snapshot = await representativeRef.where('userId', '==', parseInt(userId)).get();

    if (snapshot.empty) {
      throw new Error('Representative not found for the given User ID.');
    }

    return { success: true, mrId: snapshot.docs[0].data().mrId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Update Mess Number for Representative
export async function updateMessNumberForRepresentative(mrId, newMessNo) {
  try {
    if (!newMessNo) {
      throw new Error('New Mess Number is required.');
    }

    const representativeRef = firestore.collection('representative');
    const representativeSnapshot = await representativeRef.where('mrId', '==', parseInt(mrId)).get();

    if (representativeSnapshot.empty) {
      throw new Error('Representative not found.');
    }

    const representativeDoc = representativeSnapshot.docs[0];
    const currentMessNo = representativeDoc.data().messNo;

    const messRef = firestore.collection('mess');
    const messSnapshot = await messRef.where('messId', '==', parseInt(newMessNo)).get();

    if (messSnapshot.empty) {
      throw new Error('Mess with the provided Mess Number not found.');
    }

    const userEmail = representativeDoc.data().userId; // Assuming userId is the email

    if (currentMessNo !== newMessNo) {
      const oldMessSnapshot = await messRef.where('messId', '==', parseInt(currentMessNo)).get();
      if (!oldMessSnapshot.empty) {
        await oldMessSnapshot.docs[0].ref.update({
          setofmr: firestore.FieldValue.arrayRemove(userEmail),
          updatedAt: Timestamp.now(),
        });
      }

      await messSnapshot.docs[0].ref.update({
        setofmr: firestore.FieldValue.arrayUnion(userEmail),
        updatedAt: Timestamp.now(),
      });
    }

    await representativeDoc.ref.update({
      messNo: parseInt(newMessNo),
      updatedAt: Timestamp.now(),
    });

    return { success: true, message: 'Mess Number updated successfully for the Representative.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Delete Representative by UserId
export const deleteRepresentativeByUserId = async (userId) => {
  try {
    // Reference to the representative collection
    const representativeRef = firestore.collection('representative');
    const snapshot = await representativeRef.where('userId', '==', userId).get();

    if (snapshot.empty) {
      return { success: false, message: 'Representative not found' };
    }

    const representativeDoc = snapshot.docs[0];
    const messNo = representativeDoc.data().messNo;

    // Get the email of the representative
    const userEmail = representativeDoc.data().userId; // Assuming userId is the email of the representative

    // Reference to the mess collection
    const messRef = firestore.collection('mess');
    const messSnapshot = await messRef.where('messId', '==', messNo).get();

    if (!messSnapshot.empty) {
      await messSnapshot.docs[0].ref.update({
        setofmr: firestore.FieldValue.arrayRemove(userEmail), // Remove email
        updatedAt: Timestamp.now(),
      });
    }

    // Delete the representative document
    await representativeDoc.ref.delete();

    // Change the role of the user back to 'student' in the users collection
    const usersRef = firestore.collection('users');
    const userSnapshot = await usersRef.where('userId', '==', userId).get();

    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.update({
        role: 'student',
        updatedAt: Timestamp.now(),
      });
    }

    return { success: true, message: 'Representative deleted successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};
