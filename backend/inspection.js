// Update Inspection Status and Description for Representatives
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
  Timestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";


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