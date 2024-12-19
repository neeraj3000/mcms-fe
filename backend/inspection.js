import { firestore } from './firebase';

// Initialize InspectOptions Collection
export async function initializeInspectOptions() {
  try {
    const optionsRef = firestore.collection('InspectOptions').doc('optionsDoc');
    const doc = await optionsRef.get();

    if (!doc.exists) {
      const defaultOptions = [
        'QualityAndExpiry',
        'StandardsOfMaterials',
        'StaffAndFoodAdequacy',
        'MenuDiscrepancies',
        'SupervisorUpdates',
        'FoodTasteAndQuality',
        'KitchenHygiene',
        'UtensilCleanliness',
        'ServiceTimingsAdherence',
        'Comments',
      ];
      await optionsRef.set({ options: defaultOptions });
      return { success: true, message: 'InspectOptions initialized with default options.' };
    } else {
      return { success: true, message: 'InspectOptions already exists.' };
    }
  } catch (err) {
    console.error('Error initializing InspectOptions:', err);
    return { success: false, error: err.message };
  }
}

// Get InspectOptions
export async function getInspectOptions() {
  try {
    const optionsRef = firestore.collection('InspectOptions').doc('optionsDoc');
    const doc = await optionsRef.get();

    if (doc.exists) {
      return { success: true, options: doc.data().options };
    } else {
      return { success: false, message: 'No InspectOptions found. Please initialize first.' };
    }
  } catch (err) {
    console.error('Error fetching InspectOptions:', err);
    return { success: false, error: err.message };
  }
}

// Add Option to InspectOptions
export async function addInspectOption(newOption) {
  try {
    if (!newOption) {
      return { success: false, message: 'Option is required.' };
    }

    const optionsRef = firestore.collection('InspectOptions').doc('optionsDoc');
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
      return { success: false, message: 'No InspectOptions found. Please initialize first.' };
    }
  } catch (err) {
    console.error('Error adding InspectOption:', err);
    return { success: false, error: err.message };
  }
}

// Remove Option from InspectOptions
export async function removeInspectOption(optionToRemove) {
  try {
    if (!optionToRemove) {
      return { success: false, message: 'Option is required.' };
    }

    const optionsRef = firestore.collection('InspectOptions').doc('optionsDoc');
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
      return { success: false, message: 'No InspectOptions found. Please initialize first.' };
    }
  } catch (err) {
    console.error('Error removing InspectOption:', err);
    return { success: false, error: err.message };
  }
}

// Auto genereate Inspection Id
async function getNextInspectionId() {
  const countersRef = firestore.collection('Counters').doc('inspectionIdCounter');

  try {
    const doc = await countersRef.get();

    if (doc.exists) {
      const currentId = doc.data().lastId || 1;
      const nextId = currentId + 1;

      await countersRef.update({ lastId: nextId });

      return nextId;
    } else {
      // Initialize counter if it doesn't exist
      const firstId = 1;
      await countersRef.set({ lastId: firstId });
      return firstId;
    }
  } catch (err) {
    console.error('Error generating next inspection ID:', err);
    throw new Error('Failed to generate a unique inspection ID');
  }
}

// Create Inspection Reports 
export async function createInspectionReport(mrId, messNo, inspectionDate, options) {
  try {
    // Get the next auto-incremented inspectionId
    const inspectionId = await getNextInspectionId();

    // Verify the options against InspectOptions collection
    const verifyResult = await verifyOptions(options);
    if (!verifyResult.success) {
      return {
        success: false,
        message: "Failed to create inspection report: invalid options",
        invalidOptions: verifyResult.invalidOptions,
      };
    }

    const currentDate = inspectionDate || getCurrentDate();

    const inspectionRef = firestore.collection("InspectionReport");
    const newInspectionData = {
      inspectionId, // Auto-incremented ID
      mrId,
      messNo,
      inspectionDate: currentDate,
      options, // Validated options
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    const inspectionDoc = await inspectionRef.add(newInspectionData);
    return {
      success: true,
      message: "Inspection report created successfully",
      inspectionDocId: inspectionDoc.id,
      inspectionId,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Inspection Report By ID
export async function getInspectionReportById(inspectionId) {
  try {
    const inspectionRef = firestore
      .collection("InspectionReport")
      .where("inspectionId", "==", inspectionId);
    const snapshot = await inspectionRef.get();

    if (snapshot.empty) {
      return { success: false, message: "Inspection report not found" };
    }

    const inspectionData = snapshot.docs[0].data();
    return {
      success: true,
      inspectionData: {
        ...inspectionData,
        documentId: snapshot.docs[0].id,
      },
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get All Inspection Reports 
export async function getAllInspectionReports() {
  try {
    const inspectionRef = firestore.collection("InspectionReport");
    const snapshot = await inspectionRef.get();

    const reports = snapshot.docs.map((doc) => ({
      documentId: doc.id,
      ...doc.data(),
    }));

    return { success: true, inspectionReports: reports };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Update Inspection Report
export async function updateInspectionReport(inspectionId, updatedData) {
  try {
    const inspectionRef = firestore
      .collection("InspectionReport")
      .where("inspectionId", "==", inspectionId);
    const snapshot = await inspectionRef.get();

    if (snapshot.empty) {
      return { success: false, message: "Inspection report not found" };
    }

    const docId = snapshot.docs[0].id;

    if (updatedData.options) {
      // Verify the options
      const verifyResult = await verifyOptions(updatedData.options);
      if (!verifyResult.success) {
        return {
          success: false,
          message: "Failed to update inspection report: invalid options",
          invalidOptions: verifyResult.invalidOptions,
        };
      }
    }

    await firestore.collection("InspectionReport").doc(docId).update({
      ...updatedData,
      updatedAt: getCurrentDate(),
    });

    return { success: true, message: "Inspection report updated successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Delete Inspection Report
export async function deleteInspectionReport(inspectionId) {
  try {
    const inspectionRef = firestore
      .collection("InspectionReport")
      .where("inspectionId", "==", inspectionId);
    const snapshot = await inspectionRef.get();

    if (snapshot.empty) {
      return { success: false, message: "Inspection report not found" };
    }

    const docId = snapshot.docs[0].id;

    await firestore.collection("InspectionReport").doc(docId).delete();

    return { success: true, message: "Inspection report deleted successfully" };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Validate Inspection Report Options
export async function validateInspectionReportOptions(inspectionId) {
  try {
    const inspectionReport = await getInspectionReportById(inspectionId);
    if (!inspectionReport.success) {
      return inspectionReport; // Report not found
    }

    const options = inspectionReport.inspectionData.options;
    const verifyResult = await verifyOptions(options);

    return {
      success: verifyResult.success,
      message: verifyResult.success
        ? "Options are valid"
        : "Invalid options found in the inspection report",
      invalidOptions: verifyResult.invalidOptions,
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Inspection Report by MRID
export async function getInspectionReportsByMrId(mrId) {
  try {
    const inspectionRef = firestore
      .collection("InspectionReport")
      .where("mrId", "==", mrId);
    const snapshot = await inspectionRef.get();

    if (snapshot.empty) {
      return { success: false, message: "No inspection reports found for the given MR ID." };
    }

    const reports = snapshot.docs.map((doc) => ({
      documentId: doc.id,
      ...doc.data(),
    }));

    return { success: true, inspectionReports: reports };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Inspection Report by MessNo
export async function getInspectionReportsByMessNo(messNo) {
  try {
    const inspectionRef = firestore
      .collection("InspectionReport")
      .where("messNo", "==", messNo);
    const snapshot = await inspectionRef.get();

    if (snapshot.empty) {
      return { success: false, message: "No inspection reports found for the given Mess Number." };
    }

    const reports = snapshot.docs.map((doc) => ({
      documentId: doc.id,
      ...doc.data(),
    }));

    return { success: true, inspectionReports: reports };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get Inspection Report By Date Range
export async function getInspectionReportsByDateRange(startDate, endDate) {
  try {
    const inspectionRef = firestore.collection("InspectionReport");
    const snapshot = await inspectionRef
      .where("inspectionDate", ">=", startDate)
      .where("inspectionDate", "<=", endDate)
      .get();

    if (snapshot.empty) {
      return { success: false, message: "No inspection reports found in the given date range." };
    }

    const reports = snapshot.docs.map((doc) => ({
      documentId: doc.id,
      ...doc.data(),
    }));

    return { success: true, inspectionReports: reports };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Validate All Inspection Reports 
export async function validateAllInspectionReports() {
  try {
    const inspectionRef = firestore.collection("InspectionReport");
    const snapshot = await inspectionRef.get();

    if (snapshot.empty) {
      return { success: false, message: "No inspection reports found to validate." };
    }

    const validationResults = [];

    for (const doc of snapshot.docs) {
      const inspectionData = doc.data();
      const verifyResult = await verifyOptions(inspectionData.options);

      validationResults.push({
        inspectionId: inspectionData.inspectionId,
        isValid: verifyResult.success,
        invalidOptions: verifyResult.invalidOptions || [],
      });
    }

    return { success: true, results: validationResults };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Verify Options 
export async function verifyOptions(options) {
  try {
    const optionsRef = firestore.collection("InspectOptions").doc("optionsDoc");
    const doc = await optionsRef.get();

    if (!doc.exists) {
      return {
        success: false,
        message: "InspectOptions collection is not initialized.",
      };
    }

    const validOptions = doc.data().options;
    const invalidOptions = options.filter((option) => !validOptions.includes(option));

    if (invalidOptions.length > 0) {
      return { success: false, invalidOptions };
    }

    return { success: true };
  } catch (err) {
    console.error("Error verifying options:", err);
    return { success: false, error: err.message };
  }
}

// Utility function to get the current date and time
function getCurrentDate() {
  const date = new Date();
  return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}
