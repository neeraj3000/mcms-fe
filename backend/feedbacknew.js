import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "./firebase";

// Initialize FeedbackOptions Collection
export async function initializeFeedbackOptions() {
  try {
    const optionsRef = doc(firestore, "FeedbackOptions", "optionsDoc");
    const docSnapshot = await getDoc(optionsRef);

    if (!docSnapshot.exists()) {
      const defaultOptions = [
        "TimelinessOfService",
        "CleanlinessOfDiningHall",
        "FoodQuality",
        "QuantityOfFood",
        "CourtesyOfStaff",
        "StaffHygiene",
        "MenuAdherence",
        "WashAreaCleanliness",
        "Comments",
      ];
      await setDoc(optionsRef, { options: defaultOptions });
      return {
        success: true,
        message: "FeedbackOptions initialized with default options.",
      };
    } else {
      return { success: true, message: "FeedbackOptions already exists." };
    }
  } catch (err) {
    console.error("Error initializing FeedbackOptions:", err);
    return { success: false, error: err.message };
  }
}

// Get Feedback Options
export async function getFeedbackOptions() {
  try {
    const optionsRef = doc(firestore, "FeedbackOptions", "optionsDoc");
    const docSnapshot = await getDoc(optionsRef);

    if (docSnapshot.exists()) {
      return { success: true, options: docSnapshot.data().options };
    } else {
      return {
        success: false,
        message: "No FeedbackOptions found. Please initialize first.",
      };
    }
  } catch (err) {
    console.error("Error fetching FeedbackOptions:", err);
    return { success: false, error: err.message };
  }
}

// Add Feedback Option
export async function addFeedbackOption(newOption) {
  try {
    if (!newOption) {
      return { success: false, message: "Option is required." };
    }

    const optionsRef = doc(firestore, "FeedbackOptions", "optionsDoc");
    const docSnapshot = await getDoc(optionsRef);

    if (docSnapshot.exists()) {
      const currentOptions = docSnapshot.data().options;

      if (currentOptions.includes(newOption)) {
        return { success: false, message: "Option already exists." };
      }

      currentOptions.push(newOption);
      await updateDoc(optionsRef, { options: currentOptions });

      return { success: true, message: "Option added successfully." };
    } else {
      return {
        success: false,
        message: "No FeedbackOptions found. Please initialize first.",
      };
    }
  } catch (err) {
    console.error("Error adding FeedbackOption:", err);
    return { success: false, error: err.message };
  }
}

// Remove Feedback Option
export async function removeFeedbackOption(optionToRemove) {
  try {
    if (!optionToRemove) {
      return { success: false, message: "Option is required." };
    }

    const optionsRef = doc(firestore, "FeedbackOptions", "optionsDoc");
    const docSnapshot = await getDoc(optionsRef);

    if (docSnapshot.exists()) {
      const currentOptions = docSnapshot.data().options;

      if (!currentOptions.includes(optionToRemove)) {
        return { success: false, message: "Option not found." };
      }

      const updatedOptions = currentOptions.filter(
        (option) => option !== optionToRemove
      );
      await updateDoc(optionsRef, { options: updatedOptions });

      return { success: true, message: "Option removed successfully." };
    } else {
      return {
        success: false,
        message: "No FeedbackOptions found. Please initialize first.",
      };
    }
  } catch (err) {
    console.error("Error removing FeedbackOption:", err);
    return { success: false, error: err.message };
  }
}

// Verify Feedback Option
export async function verifyFeedbackOptions(options) {
  try {
    const optionsRef = doc(firestore, "FeedbackOptions", "optionsDoc");
    const docSnapshot = await getDoc(optionsRef);

    if (!docSnapshot.exists()) {
      return {
        success: false,
        message: "FeedbackOptions collection is not initialized.",
      };
    }

    const validOptions = docSnapshot.data().options;
    const invalidOptions = options.filter(
      (option) => !validOptions.includes(option)
    );

    if (invalidOptions.length > 0) {
      return { success: false, invalidOptions };
    }

    return { success: true };
  } catch (err) {
    console.error("Error verifying FeedbackOptions:", err);
    return { success: false, error: err.message };
  }
}

// Get Next Feedback Id
async function getNextFeedbackId() {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const snapshot = await getDocs(
      query(feedbackRef, orderBy("feedbackId", "desc"), limit(1))
    );

    if (snapshot.empty) {
      return 1; // First feedback ID
    }

    const lastFeedback = snapshot.docs[0].data();
    return lastFeedback.feedbackId + 1;
  } catch (err) {
    console.error("Error getting next Feedback ID:", err);
    throw new Error("Failed to generate Feedback ID.");
  }
}

// Create Feedback Report
// export async function createFeedbackReport(
//   userId,
//   messNo,
//   feedbackOptions,
//   feedbackDuration
// ) {
//   try {
//     // const verifyResult = await verifyFeedbackOptions(Object.keys(feedbackOptions));
//     // if (!verifyResult.success) {
//     //   return {
//     //     success: false,
//     //     message: 'Invalid feedback options provided.',
//     //     invalidOptions: verifyResult.invalidOptions,
//     //   };
//     // }

//     const feedbackId = await getNextFeedbackId();
//     const feedbackRef = collection(firestore, "FeedbackReport");

//     const newFeedbackReport = {
//       feedbackId,
//       userId,
//       messNo,
//       feedbackOptions,
//       feedbackDuration,
//       submittedAt: new Date(),
//     };

//     await setDoc(
//       doc(firestore, "FeedbackReport", feedbackId.toString()),
//       newFeedbackReport
//     );

//     return {
//       success: true,
//       message: "Feedback report created successfully.",
//       feedbackId,
//     };
//   } catch (err) {
//     console.error("Error creating feedback report:", err);
//     return { success: false, error: err.message };
//   }
// }

// Get Feedback Report By Id
export async function getFeedbackReportById(feedbackId) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const snapshot = await getDocs(
      query(feedbackRef, where("feedbackId", "==", feedbackId))
    );

    if (snapshot.empty) {
      return { success: false, message: "Feedback report not found." };
    }

    return {
      success: true,
      feedbackReport: snapshot.docs[0].data(),
    };
  } catch (err) {
    console.error("Error fetching feedback report:", err);
    return { success: false, error: err.message };
  }
}

// Get All Feedback Report
export async function getAllFeedbackReports() {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const snapshot = await getDocs(feedbackRef);

    const reports = snapshot.docs.map((doc) => ({
      feedbackId: doc.id,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error("Error fetching all feedback reports:", err);
    return { success: false, error: err.message };
  }
}

// Is User Feedback Report Exists
export async function hasUserSubmittedFeedback(userId, feedbackDuration) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const snapshot = await getDocs(
      query(
        feedbackRef,
        where("userId", "==", userId),
        where("feedbackDuration", "==", feedbackDuration)
      )
    );

    if (!snapshot.empty) {
      return {
        success: true,
        message: "User has already submitted feedback for this duration.",
        feedbackId: snapshot.docs[0].data().feedbackId,
      };
    }

    return {
      success: false,
      message: "User has not submitted feedback for this duration.",
    };
  } catch (err) {
    console.error("Error checking user feedback:", err);
    return { success: false, error: err.message };
  }
}

// Update Feedback Report
export async function updateFeedbackReport(feedbackId, updatedData) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const snapshot = await getDocs(
      query(feedbackRef, where("feedbackId", "==", feedbackId))
    );

    if (snapshot.empty) {
      return { success: false, message: "Feedback report not found." };
    }

    const docId = snapshot.docs[0].id;

    if (updatedData.feedbackOptions) {
      const verifyResult = await verifyFeedbackOptions(
        Object.keys(updatedData.feedbackOptions)
      );
      if (!verifyResult.success) {
        return {
          success: false,
          message: "Invalid feedback options provided.",
          invalidOptions: verifyResult.invalidOptions,
        };
      }
    }

    await updateDoc(doc(firestore, "FeedbackReport", docId), {
      ...updatedData,
      updatedAt: new Date(),
    });

    return { success: true, message: "Feedback report updated successfully." };
  } catch (err) {
    console.error("Error updating feedback report:", err);
    return { success: false, error: err.message };
  }
}

// Delete Feedback Report
export async function deleteFeedbackReport(feedbackId) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const snapshot = await getDocs(
      query(feedbackRef, where("feedbackId", "==", feedbackId))
    );

    if (snapshot.empty) {
      return { success: false, message: "Feedback report not found." };
    }

    const docId = snapshot.docs[0].id;
    await deleteDoc(doc(firestore, "FeedbackReport", docId));

    return { success: true, message: "Feedback report deleted successfully." };
  } catch (err) {
    console.error("Error deleting feedback report:", err);
    return { success: false, error: err.message };
  }
}

// Get Feed Back Reports By Duration
export async function getFeedbackReportsByDuration(feedbackDuration) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const q = query(
      feedbackRef,
      where("feedbackDuration", "==", feedbackDuration)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No feedback reports found for the given duration.",
      };
    }

    const reports = snapshot.docs.map((doc) => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error("Error fetching feedback reports by duration:", err);
    return { success: false, error: err.message };
  }
}

// Get Feed Back Reports By MessNo
export async function getFeedbackReportsByMessNo(messNo) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const q = query(feedbackRef, where("messNo", "==", messNo));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No feedback reports found for the given mess number.",
      };
    }

    const reports = snapshot.docs.map((doc) => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error("Error fetching feedback reports by mess number:", err);
    return { success: false, error: err.message };
  }
}

// Get Feed Back Reports By ID
export async function getFeedbackReportsByUserId(userId) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const q = query(feedbackRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No feedback reports found for the given user ID.",
      };
    }

    const reports = snapshot.docs.map((doc) => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error("Error fetching feedback reports by user ID:", err);
    return { success: false, error: err.message };
  }
}

// Get Feed Back Reports By Duration and MessNo
export async function getFeedbackReportsByMessNoAndDuration(
  messNo,
  feedbackDuration
) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const q = query(
      feedbackRef,
      where("messNo", "==", messNo),
      where("feedbackDuration", "==", feedbackDuration)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message:
          "No feedback reports found for the given mess number and duration.",
      };
    }

    const reports = snapshot.docs.map((doc) => ({
      feedbackId: doc.data().feedbackId,
      ...doc.data(),
    }));

    return { success: true, feedbackReports: reports };
  } catch (err) {
    console.error(
      "Error fetching feedback reports by mess number and duration:",
      err
    );
    return { success: false, error: err.message };
  }
}

// Add or Replace Feedback Options
export async function addOrReplaceFeedbackOptions(newOptions) {
  try {
    if (!newOptions || !Array.isArray(newOptions) || newOptions.length === 0) {
      return {
        success: false,
        message: "Options array is required and cannot be empty.",
      };
    }

    const optionsRef = doc(firestore, "FeedbackOptions", "optionsDoc");

    // Overwrite the document with new options regardless of its existence
    await setDoc(optionsRef, { options: newOptions });

    return {
      success: true,
      message:
        "FeedbackOptions updated successfully (existing options replaced).",
      replacedOptions: newOptions,
    };
  } catch (err) {
    console.error("Error adding or replacing FeedbackOptions:", err);
    return { success: false, error: err.message };
  }
}

// Update isFeedback in Student Collection
export async function updateIsFeedbackInStudents() {
  try {
    const studentsRef = collection(firestore, "Student");
    const studentSnapshot = await getDocs(studentsRef);

    if (studentSnapshot.empty) {
      return {
        success: false,
        message: "No students found in the collection.",
      };
    }

    const updatePromises = studentSnapshot.docs.map(async (doc) => {
      const studentData = doc.data();
      const isFeedback = studentData.isFeedback;

      // Update only if isFeedback is not true
      if (isFeedback !== true) {
        const studentDocRef = doc.ref;
        await updateDoc(studentDocRef, { isFeedback: true });
      }
    });

    await Promise.all(updatePromises);

    return {
      success: true,
      message: "isFeedback field updated successfully for all students.",
    };
  } catch (err) {
    console.error("Error updating isFeedback:", err);
    return { success: false, error: err.message };
  }
}

// Retrieve All Feedback Options
export async function getAllFeedbackOptions() {
  try {
    const optionsRef = doc(firestore, "FeedbackOptions", "optionsDoc");
    const docSnapshot = await getDoc(optionsRef);

    if (docSnapshot.exists()) {
      const options = docSnapshot.data().options || [];
      return { success: true, options };
    } else {
      return {
        success: false,
        message: "No FeedbackOptions found. Please initialize first.",
      };
    }
  } catch (err) {
    console.error("Error fetching FeedbackOptions:", err);
    return { success: false, error: err.message };
  }
}

// Create Feedback Report
export async function createFeedbackReport(userId, messId, feedbackOptions) {
  try {
    const feedbackId = await getNextFeedbackId();
    const feedbackRef = collection(firestore, "FeedbackReport");

    // Fetch collegeId from the Student collection using userId
    const studentsRef = collection(firestore, "Student");
    const studentQuery = query(
      studentsRef,
      where("userId", "==", parseInt(userId))
    );
    const snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No student record found for the provided userId.",
      };
    }

    // Assume only one document matches since userId should be unique
    const studentData = snapshot.docs[0].data();
    console.log(studentData)
    const collegeId = studentData.collegeId;
    console.log("clg"+collegeId)

    if (!collegeId) {
      return {
        success: false,
        message: "collegeId is missing for the given userId.",
      };
    }

    // Create new feedback report with collegeId
    const newFeedbackReport = {
      feedbackId,
      collegeId,
      messId,
      feedbackOptions,
      submittedAt: new Date(),
    };

    await setDoc(doc(feedbackRef, feedbackId.toString()), newFeedbackReport);

    // Update isFeedback field in Student collection
    const batch = writeBatch(firestore);
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isFeedback: false });
    });

    await batch.commit();

    return {
      success: true,
      message: "Feedback report created successfully, and isFeedback updated.",
      feedbackId,
    };
  } catch (err) {
    console.error("Error creating feedback report:", err);
    return { success: false, error: err.message };
  }
}

// Get all Feedback Reports by messId
export async function getFeedbackReportsByMessId(messId) {
  try {
    const feedbackRef = collection(firestore, "FeedbackReport");
    const feedbackQuery = query(feedbackRef, where("messId", "==", messId));
    const snapshot = await getDocs(feedbackQuery);

    if (snapshot.empty) {
      return {
        success: false,
        message: `No feedback reports found for messId: ${messId}`,
      };
    }

    const feedbackReports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      feedbackReports,
    };
  } catch (err) {
    console.error("Error fetching feedback reports:", err);
    return { success: false, error: err.message };
  }
}