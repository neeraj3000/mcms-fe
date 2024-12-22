import { firestore } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import * as FileSystem from "expo-file-system";

// Initialize InspectOptions Collection
export async function initializeInspectOptions() {
  try {
    const optionsRef = doc(firestore, "InspectOptions", "optionsDoc");
    const docSnap = await getDoc(optionsRef);

    if (!docSnap.exists()) {
      const defaultOptions = [
        "QualityAndExpiry",
        "StandardsOfMaterials",
        "StaffAndFoodAdequacy",
        "MenuDiscrepancies",
        "SupervisorUpdates",
        "FoodTasteAndQuality",
        "KitchenHygiene",
        "UtensilCleanliness",
        "ServiceTimingsAdherence",
        "Comments",
      ];
      await setDoc(optionsRef, { options: defaultOptions });
      return {
        success: true,
        message: "InspectOptions initialized with default options.",
      };
    } else {
      return { success: true, message: "InspectOptions already exists." };
    }
  } catch (err) {
    console.error("Error initializing InspectOptions:", err);
    return { success: false, error: err.message };
  }
}

// Get InspectOptions
// export async function getInspectOptions() {
//   try {
//     const optionsRef = doc(firestore, "InspectOptions", "optionsDoc");
//     const docSnap = await getDoc(optionsRef);

//     if (docSnap.exists()) {
//       return { success: true, options: docSnap.data().options };
//     } else {
//       return {
//         success: false,
//         message: "No InspectOptions found. Please initialize first.",
//       };
//     }
//   } catch (err) {
//     console.error("Error fetching InspectOptions:", err);
//     return { success: false, error: err.message };
//   }
// }

// Add Option to InspectOptions
export async function addInspectOption(newOption) {
  try {
    if (!newOption) {
      return { success: false, message: "Option is required." };
    }

    const optionsRef = doc(firestore, "InspectOptions", "optionsDoc");
    const docSnap = await getDoc(optionsRef);

    if (docSnap.exists()) {
      const currentOptions = docSnap.data().options;

      if (currentOptions.includes(newOption)) {
        return { success: false, message: "Option already exists." };
      }

      currentOptions.push(newOption);
      await updateDoc(optionsRef, { options: currentOptions });

      return { success: true, message: "Option added successfully." };
    } else {
      return {
        success: false,
        message: "No InspectOptions found. Please initialize first.",
      };
    }
  } catch (err) {
    console.error("Error adding InspectOption:", err);
    return { success: false, error: err.message };
  }
}

// Remove Option from InspectOptions
export async function removeInspectOption(optionToRemove) {
  try {
    if (!optionToRemove) {
      return { success: false, message: "Option is required." };
    }

    const optionsRef = doc(firestore, "InspectOptions", "optionsDoc");
    const docSnap = await getDoc(optionsRef);

    if (docSnap.exists()) {
      const currentOptions = docSnap.data().options;

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
        message: "No InspectOptions found. Please initialize first.",
      };
    }
  } catch (err) {
    console.error("Error removing InspectOption:", err);
    return { success: false, error: err.message };
  }
}

// Auto generate Inspection Id
async function getNextInspectionId() {
  const countersRef = doc(firestore, "Counters", "inspectionIdCounter");

  try {
    const docSnap = await getDoc(countersRef);

    if (docSnap.exists()) {
      const currentId = docSnap.data().lastId || 1;
      const nextId = currentId + 1;

      await updateDoc(countersRef, { lastId: nextId });

      return nextId;
    } else {
      // Initialize counter if it doesn't exist
      const firstId = 1;
      await setDoc(countersRef, { lastId: firstId });
      return firstId;
    }
  } catch (err) {
    console.error("Error generating next inspection ID:", err);
    throw new Error("Failed to generate a unique inspection ID");
  }
}

// Create Inspection Reports
// Create Inspection Reports
// Create Inspection Reports
// Create Inspection Reports
// Create Inspection Reports
export async function createInspectionReport(mrId, messNo, image, options) {
  try {
    const inspectionId = await getNextInspectionId();
    console.log(typeof (mrId));
    let imageUrl = null;
    if (image) {
      try {
        const imageType = image.type || "image/jpeg"; // Extract type from the image or fallback to jpeg
        console.log("Uploading image to Cloudinary...");
        imageUrl = await uploadToCloudinary(image, imageType);
        console.log("Image uploaded successfully, URL: ", imageUrl);
      } catch (uploadErr) {
        console.error("Error uploading image to Cloudinary:", uploadErr);
        return {
          success: false,
          message: "Failed to upload image to Cloudinary",
          error: uploadErr.message,
        };
      }
    }

    const currentDate = getCurrentDate(); // Use the current date as the inspection date

    // Add inspection report to the Firestore
    const inspectionRef = collection(firestore, "InspectionReport");
    const newInspectionData = {
      inspectionId,
      mrId,
      messNo,
      image: imageUrl, // If no image is uploaded, this will be null
      inspectionDate: currentDate,
      options,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    console.log("Adding inspection report to Firestore...");
    const inspectionDoc = await addDoc(inspectionRef, newInspectionData);

    console.log("Inspection report created successfully:", inspectionDoc.id);

    // Update the inspectionStatus field in the representative collection
    const representativesRef = collection(firestore, "representative"); // Ensure the collection name is representative
    const representativeQuery = query(
      representativesRef,
      where("mrId", "==", parseInt(mrId))
    );
    const representativeSnapshot = await getDocs(representativeQuery);

    if (!representativeSnapshot.empty) {
      console.log("Representatives found, preparing to update...");
      const batch = writeBatch(firestore);

      representativeSnapshot.docs.forEach((doc) => {
        const representativeData = doc.data();
        console.log(
          `Updating inspectionStatus for document ID: ${doc.id}, representativeData`
        );

        // Check the current inspectionStatus and update if necessary
        if (representativeData.inspectionStatus === true) {
          batch.update(doc.ref, { inspectionStatus: false });
        } else {
          console.log(
            `No update needed for document ID: ${doc.id}, inspectionStatus is already false.`
          );
        }
      });

      // Commit batch updates
      await batch.commit();
      console.log("Batch updates committed successfully for inspectionStatus.");
    } else {
      console.warn(`No representative found with mrId: ${mrId}`);
    }

    return {
      success: true,
      message:
        "Inspection report created successfully and inspectionStatus updated.",
      inspectionDocId: inspectionDoc.id,
      inspectionId,
      inspectionData: newInspectionData, // Return the created report data as well
    };
  } catch (err) {
    console.error("Error creating inspection report:", err);
    return { success: false, error: err.message };
  }
}

// Get All Inspection Reports
export async function getAllInspectionReports() {
  try {
    const inspectionRef = collection(firestore, "InspectionReport");
    const snapshot = await getDocs(inspectionRef);

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
    const inspectionRef = collection(firestore, "InspectionReport");
    const q = query(inspectionRef, where("inspectionId", "==", inspectionId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: "Inspection report not found" };
    }

    const docId = snapshot.docs[0].id;

    if (updatedData.options) {
      const verifyResult = await verifyOptions(updatedData.options);
      if (!verifyResult.success) {
        return {
          success: false,
          message: "Failed to update inspection report: invalid options",
          invalidOptions: verifyResult.invalidOptions,
        };
      }
    }

    await updateDoc(doc(firestore, "InspectionReport", docId), {
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
    const inspectionRef = collection(firestore, "InspectionReport");
    const q = query(inspectionRef, where("inspectionId", "==", inspectionId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: "Inspection report not found" };
    }

    const docId = snapshot.docs[0].id;

    await deleteDoc(doc(firestore, "InspectionReport", docId));

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
      return inspectionReport;
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
    const inspectionRef = collection(firestore, "InspectionReport");
    const q = query(inspectionRef, where("mrId", "==", mrId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No inspection reports found for the given MR ID.",
      };
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
    const inspectionRef = collection(firestore, "InspectionReport");
    const q = query(inspectionRef, where("messNo", "==", messNo));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No inspection reports found for the given Mess Number.",
      };
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
    const inspectionRef = collection(firestore, "InspectionReport");
    const q = query(
      inspectionRef,
      where("inspectionDate", ">=", startDate),
      where("inspectionDate", "<=", endDate)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No inspection reports found in the given date range.",
      };
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
    const inspectionRef = collection(firestore, "InspectionReport");
    const snapshot = await getDocs(inspectionRef);

    if (snapshot.empty) {
      return {
        success: false,
        message: "No inspection reports found to validate.",
      };
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
    const optionsRef = doc(firestore, "InspectOptions", "optionsDoc");
    const docSnap = await getDoc(optionsRef);

    if (!docSnap.exists()) {
      return {
        success: false,
        message: "InspectOptions collection is not initialized.",
      };
    }

    const validOptions = docSnap.data().options;
    const invalidOptions = options.filter(
      (option) => !validOptions.includes(option)
    );

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

// Add Multiple Options to InspectOptions (per messId, replace or create)
export async function addMultipleInspectOptions(messId, newOptions) {
  try {
    // Validate inputs
    if (
      !messId ||
      !newOptions ||
      !Array.isArray(newOptions) ||
      newOptions.length === 0
    ) {
      return {
        success: false,
        message:
          "Valid Mess ID (string) and a non-empty options array are required.",
      };
    }

    // Reference the document with the given messId
    const optionsRef = doc(firestore, "InspectOptions", messId);

    // Set or replace the document
    await setDoc(optionsRef, { options: newOptions }, { merge: false });

    return {
      success: true,
      message: `Options for messId '${messId}' added/replaced successfully.`,
      addedOptions: newOptions,
    };
  } catch (err) {
    console.error("Error adding InspectOptions:", err);
    return { success: false, error: err.message };
  }
}
export async function updateInspectionStatusAndDescription(
  messId,
  description
) {
  try {
    if (!messId || !description) {
      return {
        success: false,
        message: "Mess ID and description are required",
      };
    }

    // Retrieve the mess document using messId
    const messRef = collection(firestore, "mess");
    const messQuery = query(messRef, where("messId", "==", messId));
    const messSnapshot = await getDocs(messQuery);

    if (messSnapshot.empty) {
      return { success: false, message: "Mess not found" };
    }

    const messData = messSnapshot.docs[0].data();
    const setofmr = messData.setofmr;

    if (!setofmr || setofmr.length === 0) {
      return { success: false, message: "No MRs found for this mess" };
    }

    // Retrieve users whose emails are in the setofmr field
    const usersRef = collection(firestore, "users");
    const usersQuery = query(usersRef, where("email", "in", setofmr));
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      return {
        success: false,
        message: "No users found for the given MR emails",
      };
    }

    const userIds = usersSnapshot.docs.map((doc) => doc.data().userId);

    // Retrieve representative documents for the users
    const representativesRef = collection(firestore, "representative");
    const representativesQuery = query(
      representativesRef,
      where("userId", "in", userIds)
    );
    const representativesSnapshot = await getDocs(representativesQuery);

    if (representativesSnapshot.empty) {
      return {
        success: false,
        message: "No representatives found for the given users",
      };
    }

    // Update inspection status and description for each representative
    const updatePromises = representativesSnapshot.docs.map(async (doc) => {
      const repData = doc.data();
      const inspectionStatus = repData.inspectionStatus || false;

      // Only update if inspectionStatus is false or doesn't exist
      if (!inspectionStatus) {
        const docRef = doc.ref;

        // Update inspectionStatus and add description
        await updateDoc(docRef, {
          inspectionStatus: true,
          description: description, // Add description
          updatedAt: Timestamp.now(),
        });
      }
    });

    // Wait for all updates to finish
    await Promise.all(updatePromises);

    return {
      success: true,
      message: "Inspection status and description updated successfully",
    };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

// Get InspectOptions for a Specific messId
export async function getInspectOptions(messId) {
  try {
    if (!messId) {
      return { success: false, message: "Mess ID is required." };
    }

    const optionsRef = doc(firestore, "InspectOptions", messId);
    const docSnap = await getDoc(optionsRef);

    if (docSnap.exists()) {
      return { success: true, options: docSnap.data().options };
    } else {
      return {
        success: false,
        message: "No InspectOptions found for messId '${messId}'. ",
      };
    }
  } catch (err) {
    console.error("Error fetching InspectOptions:", err);
    return { success: false, error: err.message };
  }
}

// Upload to Cloudinary
// Upload to Cloudinary
export async function uploadToCloudinary(image, type) {
  try {
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dwi8fucyt/upload";
    const uploadPreset = "mcms-issue";

    // Read the image as base64
    const blob = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });

    // Prepare the form data for the request
    const formData = new FormData();
    formData.append("file", `data:${type};base64,${blob}`);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", "dwi8fucyt");

    // Upload the image to Cloudinary
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    const responseData = await uploadResponse.json();

    // Check for the secure_url in the response
    if (responseData.secure_url) {
      return responseData.secure_url;
    } else {
      // If no URL is returned, throw an error with the response message
      const errorMsg = responseData.error
        ? responseData.error.message
        : "Image upload failed without error message.";
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error("Error uploading image to Cloudinary:", err);
    throw new Error(
      err.message || "An error occurred while uploading the image."
    );
  }
}
