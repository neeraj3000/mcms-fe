import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { firestore } from "./firebase";

// Create Representative
export async function createRepresentative(email, messNo) {
  try {
    if (!email || !messNo) {
      throw new Error("Email and messNo are required.");
    }

    const usersRef = collection(firestore, "users");
    const userSnapshot = await getDocs(
      query(
        usersRef,
        where("email", "==", email),
        where("role", "==", "student")
      )
    );

    if (userSnapshot.empty) {
      throw new Error("User not found or not a student.");
    }

    const userData = userSnapshot.docs[0].data();
    const userId = userData.userId;

    const messRef = collection(firestore, "mess");
    const messSnapshot = await getDocs(
      query(messRef, where("messId", "==", parseInt(messNo)))
    );

    if (messSnapshot.empty) {
      throw new Error("Mess not found.");
    }

    const representativeRef = collection(firestore, "representative");
    const lastMrSnapshot = await getDocs(
      query(representativeRef, orderBy("mrId", "desc"), limit(1))
    );
    const newMrId = lastMrSnapshot.empty
      ? 1
      : lastMrSnapshot.docs[0].data().mrId + 1;

    const representativeData = {
      mrId: newMrId,
      userId,
      messNo: parseInt(messNo),
      createdAt: Timestamp.now(),
    };

    await addDoc(representativeRef, representativeData);

    const messDoc = messSnapshot.docs[0];
    await updateDoc(doc(firestore, "mess", messDoc.id), {
      setofmr: arrayUnion(email),
      updatedAt: Timestamp.now(),
    });

    const userDoc = userSnapshot.docs[0];
    await updateDoc(doc(firestore, "users", userDoc.id), {
      role: "representative",
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      message: "Representative created successfully",
      mrId: newMrId,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get All Representatives
export async function getAllRepresentatives() {
  try {
    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(representativeRef);

    if (snapshot.empty) {
      throw new Error("No representatives found.");
    }

    const representatives = snapshot.docs.map((doc) => doc.data());

    return { success: true, representatives };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get Representative by ID
export async function getRepresentativeById(mrId) {
  try {
    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(
      query(representativeRef, where("mrId", "==", parseInt(mrId)))
    );

    if (snapshot.empty) {
      throw new Error("Representative not found.");
    }

    return { success: true, representative: snapshot.docs[0].data() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Delete Representative by ID
export async function deleteRepresentativeById(mrId) {
  try {
    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(
      query(representativeRef, where("mrId", "==", parseInt(mrId)))
    );

    if (snapshot.empty) {
      throw new Error("Representative not found.");
    }

    const representativeDoc = snapshot.docs[0];
    const messNo = representativeDoc.data().messNo;
    const userId = representativeDoc.data().userId;

    const usersRef = collection(firestore, "users");
    const userSnapshot = await getDocs(
      query(usersRef, where("userId", "==", userId))
    );
    const userEmail = userSnapshot.docs[0]?.data()?.email;

    const messRef = collection(firestore, "mess");
    const messSnapshot = await getDocs(
      query(messRef, where("messId", "==", messNo))
    );

    if (!messSnapshot.empty) {
      await updateDoc(doc(firestore, "mess", messSnapshot.docs[0].id), {
        setofmr: arrayRemove(userEmail),
        updatedAt: Timestamp.now(),
      });
    }

    await deleteDoc(doc(firestore, "representative", representativeDoc.id));

    if (!userSnapshot.empty) {
      await updateDoc(doc(firestore, "users", userSnapshot.docs[0].id), {
        role: "student",
        updatedAt: Timestamp.now(),
      });
    }

    return { success: true, message: "Representative deleted successfully." };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get Representatives by Mess Number
export async function getRepresentativesByMessNo(messNo) {
  try {
    if (!messNo) {
      throw new Error("Mess Number is required.");
    }

    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(
      query(representativeRef, where("messNo", "==", parseInt(messNo)))
    );

    if (snapshot.empty) {
      throw new Error("No representatives found for the given Mess Number.");
    }

    const representatives = snapshot.docs.map((doc) => doc.data());

    return { success: true, representatives };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get Representative by User ID
export async function getRepresentativeByUserId(userId) {
  try {
    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(
      query(representativeRef, where("userId", "==", userId))
    );

    if (snapshot.empty) {
      throw new Error("Representative not found.");
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
      throw new Error("User ID is required.");
    }

    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(
      query(representativeRef, where("userId", "==", userId))
    );

    if (snapshot.empty) {
      throw new Error("Representative not found for the given User ID.");
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
      throw new Error("New Mess Number is required.");
    }

    const representativeRef = collection(firestore, "representative");
    const representativeSnapshot = await getDocs(
      query(representativeRef, where("mrId", "==", parseInt(mrId)))
    );

    if (representativeSnapshot.empty) {
      throw new Error("Representative not found.");
    }

    const representativeDoc = representativeSnapshot.docs[0];
    const currentMessNo = representativeDoc.data().messNo;

    const messRef = collection(firestore, "mess");
    const messSnapshot = await getDocs(
      query(messRef, where("messId", "==", parseInt(newMessNo)))
    );

    if (messSnapshot.empty) {
      throw new Error("Mess with the provided Mess Number not found.");
    }

    const userEmail = representativeDoc.data().userId; // Assuming userId is the email

    if (currentMessNo !== newMessNo) {
      const oldMessSnapshot = await getDocs(
        query(messRef, where("messId", "==", parseInt(currentMessNo)))
      );
      if (!oldMessSnapshot.empty) {
        await updateDoc(doc(firestore, "mess", oldMessSnapshot.docs[0].id), {
          setofmr: arrayRemove(userEmail),
          updatedAt: Timestamp.now(),
        });
      }

      await updateDoc(doc(firestore, "mess", messSnapshot.docs[0].id), {
        setofmr: arrayUnion(userEmail),
        updatedAt: Timestamp.now(),
      });
    }

    await updateDoc(doc(firestore, "representative", representativeDoc.id), {
      messNo: parseInt(newMessNo),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      message: "Mess Number updated successfully for the Representative.",
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Delete Representative by UserId
export const deleteRepresentativeByUserId = async (userId) => {
  try {
    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(
      query(representativeRef, where("userId", "==", userId))
    );

    if (snapshot.empty) {
      return { success: false, message: "Representative not found" };
    }

    const representativeDoc = snapshot.docs[0];
    const messNo = representativeDoc.data().messNo;

    const userEmail = representativeDoc.data().userId; // Assuming userId is the email of the representative

    const messRef = collection(firestore, "mess");
    const messSnapshot = await getDocs(
      query(messRef, where("messId", "==", messNo))
    );

    if (!messSnapshot.empty) {
      await updateDoc(doc(firestore, "mess", messSnapshot.docs[0].id), {
        setofmr: arrayRemove(userEmail),
        updatedAt: Timestamp.now(),
      });
    }

    await deleteDoc(doc(firestore, "representative", representativeDoc.id));

    const usersRef = collection(firestore, "users");
    const userSnapshot = await getDocs(
      query(usersRef, where("userId", "==", userId))
    );

    if (!userSnapshot.empty) {
      await updateDoc(doc(firestore, "users", userSnapshot.docs[0].id), {
        role: "student",
        updatedAt: Timestamp.now(),
      });
    }

    return { success: true, message: "Representative deleted successfully" };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Function to get list of students by a list of emails
export async function getStudentsByEmails(emails) {
  try {
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return {
        success: false,
        message: "Emails array is required and cannot be empty.",
      };
    }

    // Step 1: Get userIds from the 'users' collection using the provided emails
    const usersRef = collection(firestore, "users");
    const userQuery = query(usersRef, where("email", "in", emails));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return {
        success: false,
        message: "No users found with the provided emails.",
      };
    }

    const userIds = userSnapshot.docs.map((doc) => doc.data().userId);

    // Step 2: Get student details from the 'Student' collection using the userIds
    const studentsRef = collection(firestore, "Student");
    const studentQuery = query(studentsRef, where("userId", "in", userIds));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      return {
        success: false,
        message: "No students found with the provided userIds.",
      };
    }

    const studentsList = studentSnapshot.docs.map((doc) => doc.data());

    return { success: true, students: studentsList };
  } catch (err) {
    console.error("Error fetching students:", err);
    return { success: false, error: err.message };
  }
}

export async function getStudentsByUserIds(userIds) {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        message: "UserIds array is required and cannot be empty.",
      };
    }

    const studentsRef = collection(firestore, "Student");
    const studentQuery = query(
      studentsRef,
      where("userId", "in", userIds) // Filter students where userId is in the list of userIds
    );

    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      return {
        success: false,
        message: "No students found with the given userIds.",
      };
    }

    const studentsList = studentSnapshot.docs.map((doc) => doc.data());

    return { success: true, students: studentsList };
  } catch (err) {
    console.error("Error fetching students:", err);
    return { success: false, error: err.message };
  }
}
export async function updateRepresentativeDetails(mrId, newDetails) {
  try {
    const representativeRef = doc(firestore, "representative", mrId.toString());

    // Update the representative details
    await updateDoc(representativeRef, {
      name: newDetails.name,
      email: newDetails.email,
      mobileNo: newDetails.mobileNo,
      gender: newDetails.gender,
      batch: newDetails.batch,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating representative details:", error);
    return { success: false, message: error.message };
  }
}
