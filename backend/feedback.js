import { firestore } from './firebase';

// Initialize FeedbackOptions Collection
export async function initializeFeedbackOptions() {
  try {
    const optionsRef = firestore.collection('FeedbackOptions').doc('optionsDoc');
    const doc = await optionsRef.get();

    if (!doc.exists) {
      const defaultOptions = [
        'TimelinessOfService',
        'CleanlinessOfDiningHall',
        'FoodQuality',
        'QuantityOfFood',
        'CourtesyOfStaff',
        'StaffHygiene',
        'MenuAdherence',
        'WashAreaCleanliness',
        'Comments',
      ];
      await optionsRef.set({ options: defaultOptions });
      return { success: true, message: 'FeedbackOptions initialized with default options.' };
    } else {
      return { success: true, message: 'FeedbackOptions already exists.' };
    }
  } catch (err) {
    console.error('Error initializing FeedbackOptions:', err);
    return { success: false, error: err.message };
  }
}

// Get Feedback Options
export async function getFeedbackOptions() {
  try {
    const optionsRef = firestore.collection('FeedbackOptions').doc('optionsDoc');
    const doc = await optionsRef.get();

    if (doc.exists) {
      return { success: true, options: doc.data().options };
    } else {
      return { success: false, message: 'No FeedbackOptions found. Please initialize first.' };
    }
  } catch (err) {
    console.error('Error fetching FeedbackOptions:', err);
    return { success: false, error: err.message };
  }
}

// Add Feedback Option
export async function addFeedbackOption(newOption) {
  try {
    if (!newOption) {
      return { success: false, message: 'Option is required.' };
    }

    const optionsRef = firestore.collection('FeedbackOptions').doc('optionsDoc');
    const doc = await optionsRef.get();

    if (doc.exists) {
      const currentOptions = doc.data().options;

      if (currentOptions.includes(newOption)) {
        return { success: false, message: 'Option already exists.' };
      }

      currentOptions.push(newOption);
      await optionsRef.update({ options: currentOptions });

      return { success: true, message: 'Option added successfully.' };
    } else {
      return { success: false, message: 'No FeedbackOptions found. Please initialize first.' };
    }
  } catch (err) {
    console.error('Error adding FeedbackOption:', err);
    return { success: false, error: err.message };
  }
}

// Remove Feedback Option
export async function removeFeedbackOption(optionToRemove) {
  try {
    if (!optionToRemove) {
      return { success: false, message: 'Option is required.' };
    }

    const optionsRef = firestore.collection('FeedbackOptions').doc('optionsDoc');
    const doc = await optionsRef.get();

    if (doc.exists) {
      const currentOptions = doc.data().options;

      if (!currentOptions.includes(optionToRemove)) {
        return { success: false, message: 'Option not found.' };
      }

      const updatedOptions = currentOptions.filter(option => option !== optionToRemove);
      await optionsRef.update({ options: updatedOptions });

      return { success: true, message: 'Option removed successfully.' };
    } else {
      return { success: false, message: 'No FeedbackOptions found. Please initialize first.' };
    }
  } catch (err) {
    console.error('Error removing FeedbackOption:', err);
    return { success: false, error: err.message };
  }
}

// Verify Feedback Option
export async function verifyFeedbackOptions(options) {
  try {
    const optionsRef = firestore.collection('FeedbackOptions').doc('optionsDoc');
    const doc = await optionsRef.get();

    if (!doc.exists) {
      return { success: false, message: 'FeedbackOptions collection is not initialized.' };
    }

    const validOptions = doc.data().options;
    const invalidOptions = options.filter(option => !validOptions.includes(option));

    if (invalidOptions.length > 0) {
      return { success: false, invalidOptions };
    }

    return { success: true };
  } catch (err) {
    console.error('Error verifying FeedbackOptions:', err);
    return { success: false, error: err.message };
  }
}

// Get Next Feedback Id 
async function getNextFeedbackId() {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.orderBy('feedbackId', 'desc').limit(1).get();

    if (snapshot.empty) {
      return 1; // First feedback ID
    }

    const lastFeedback = snapshot.docs[0].data();
    return lastFeedback.feedbackId + 1;
  } catch (err) {
    console.error('Error getting next Feedback ID:', err);
    throw new Error('Failed to generate Feedback ID.');
  }
}

// Create Feedback Report
export async function createFeedbackReport(userId, messNo, feedbackOptions, feedbackDuration) {
  try {
    // Validate if feedbackOptions keys exist in FeedbackOptions collection
    const verifyResult = await verifyFeedbackOptions(Object.keys(feedbackOptions));
    if (!verifyResult.success) {
      return {
        success: false,
        message: 'Invalid feedback options provided.',
        invalidOptions: verifyResult.invalidOptions,
      };
    }

    const feedbackId = await getNextFeedbackId();
    const feedbackRef = firestore.collection('FeedbackReport');

    const newFeedbackReport = {
      feedbackId,
      userId,
      messNo,
      feedbackOptions,
      feedbackDuration,
      submittedAt: new Date(),
    };

    await feedbackRef.add(newFeedbackReport);

    return {
      success: true,
      message: 'Feedback report created successfully.',
      feedbackId,
    };
  } catch (err) {
    console.error('Error creating feedback report:', err);
    return { success: false, error: err.message };
  }
}

// Get Feedback Report By Id
export async function getFeedbackReportById(feedbackId) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.where('feedbackId', '==', feedbackId).get();

    if (snapshot.empty) {
      return { success: false, message: 'Feedback report not found.' };
    }

    return {
      success: true,
      feedbackReport: snapshot.docs[0].data(),
    };
  } catch (err) {
    console.error('Error fetching feedback report:', err);
    return { success: false, error: err.message };
  }
}

// Get All Feedback Report
export async function getAllFeedbackReports() {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.get();

    const reports = snapshot.docs.map(doc => ({
      feedbackId: doc.id,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error('Error fetching all feedback reports:', err);
    return { success: false, error: err.message };
  }
}

// Is User Feedback Report Exists
export async function hasUserSubmittedFeedback(userId, feedbackDuration) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef
      .where('userId', '==', userId)
      .where('feedbackDuration', '==', feedbackDuration)
      .get();

    if (!snapshot.empty) {
      return {
        success: true,
        message: 'User has already submitted feedback for this duration.',
        feedbackId: snapshot.docs[0].data().feedbackId,
      };
    }

    return {
      success: false,
      message: 'User has not submitted feedback for this duration.',
    };
  } catch (err) {
    console.error('Error checking user feedback:', err);
    return { success: false, error: err.message };
  }
}

// Update Feed Back Report
export async function updateFeedbackReport(feedbackId, updatedData) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.where('feedbackId', '==', feedbackId).get();

    if (snapshot.empty) {
      return { success: false, message: 'Feedback report not found.' };
    }

    const docId = snapshot.docs[0].id;

    if (updatedData.feedbackOptions) {
      // Validate updated feedback options
      const verifyResult = await verifyFeedbackOptions(Object.keys(updatedData.feedbackOptions));
      if (!verifyResult.success) {
        return {
          success: false,
          message: 'Invalid feedback options provided.',
          invalidOptions: verifyResult.invalidOptions,
        };
      }
    }

    await feedbackRef.doc(docId).update({
      ...updatedData,
      updatedAt: new Date(),
    });

    return { success: true, message: 'Feedback report updated successfully.' };
  } catch (err) {
    console.error('Error updating feedback report:', err);
    return { success: false, error: err.message };
  }
}

// Delete Feed Back Report
export async function deleteFeedbackReport(feedbackId) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.where('feedbackId', '==', feedbackId).get();

    if (snapshot.empty) {
      return { success: false, message: 'Feedback report not found.' };
    }

    const docId = snapshot.docs[0].id;
    await feedbackRef.doc(docId).delete();

    return { success: true, message: 'Feedback report deleted successfully.' };
  } catch (err) {
    console.error('Error deleting feedback report:', err);
    return { success: false, error: err.message };
  }
}

// Get Feed Back Reports By Duration
export async function getFeedbackReportsByDuration(feedbackDuration) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.where('feedbackDuration', '==', feedbackDuration).get();

    if (snapshot.empty) {
      return { success: false, message: 'No feedback reports found for the given duration.' };
    }

    const reports = snapshot.docs.map(doc => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error('Error fetching feedback reports by duration:', err);
    return { success: false, error: err.message };
  }
}

// Get Feed Back Reports By MessNo
export async function getFeedbackReportsByMessNo(messNo) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.where('messNo', '==', messNo).get();

    if (snapshot.empty) {
      return { success: false, message: 'No feedback reports found for the given mess number.' };
    }

    const reports = snapshot.docs.map(doc => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error('Error fetching feedback reports by mess number:', err);
    return { success: false, error: err.message };
  }
}

// Ger Feed Back Reports By ID
export async function getFeedbackReportsByUserId(userId) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef.where('userId', '==', userId).get();

    if (snapshot.empty) {
      return { success: false, message: 'No feedback reports found for the given user ID.' };
    }

    const reports = snapshot.docs.map(doc => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error('Error fetching feedback reports by user ID:', err);
    return { success: false, error: err.message };
  }
}

// Get Feed Back Reports By Duration and MessNo
export async function getFeedbackReportsByMessNoAndDuration(messNo, feedbackDuration) {
  try {
    const feedbackRef = firestore.collection('FeedbackReport');
    const snapshot = await feedbackRef
      .where('messNo', '==', messNo)
      .where('feedbackDuration', '==', feedbackDuration)
      .get();

    if (snapshot.empty) {
      return { success: false, message: 'No feedback reports found for the given mess number and duration.' };
    }

    const reports = snapshot.docs.map(doc => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error('Error fetching feedback reports by mess number and duration:', err);
    return { success: false, error: err.message };
  }
}
