import { collection, query, where, getDocs, addDoc, doc, setDoc, orderBy, limit, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore'; // Required Firestore imports
import { firestore } from './firebase'; // Import Firestore configuration from your firebase.js
// const bcrypt = require('bcrypt');

/*// Register Student and User(need update)
export const registerStudent = async (name, collegeId, mobileNo, gender, batch, email, password) => {
  try {
    if (!name || !collegeId || !mobileNo || !gender || !batch || !email || !password) {
      throw new Error('All fields are required');
    }

    const usersRef = collection(firestore, 'users');
    const studentsRef = collection(firestore, 'Student');

    const lastUserQuery = query(usersRef, orderBy('userId', 'desc'), limit(1));
    const lastUserSnapshot = await getDocs(lastUserQuery);
    const newUserId = lastUserSnapshot.empty ? 1 : lastUserSnapshot.docs[0].data().userId + 1;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      userId: newUserId,
      role: 'student',
      email,
      password: hashedPassword,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(usersRef, newUserId.toString()), userData);

    const studentData = {
      userId: newUserId,
      name,
      collegeId,
      mobileNo,
      gender,
      batch,
      messId: null,
      createdAt: Timestamp.now(),
    };

    await addDoc(studentsRef, studentData);

    return { success: true, message: 'Student registered successfully', userId: newUserId };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};*/
// Get Student by userId (Student Collection)
export const getStudentDetailsByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const studentsRef = collection(firestore, "Student");
    const studentQuery = query(studentsRef, where("userId", "==", parseInt(userId)));
    const snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      return { success: false, message: "Student not found." };
    }

    const studentDoc = snapshot.docs[0]; // Assuming userId is unique and there's only one matching document
    const studentData = studentDoc.data();

    return {
      success: true,
      messId: studentData.messId || null, // Return messId or null if not present
      isFeedback: studentData.isFeedback || false, // Default to false if isFeedback is not set
    };
  } catch (err) {
    console.error("Error fetching student details:", err);
    return { success: false, error: err.message };
  }
};
// Register Student and User
export const registerStudent = async (
  name,
  collegeId,
  mobileNo,
  gender,
  batch,
  email,
  password
) => {
  try {
    // Validate input fields
    if (
      !name ||
      !collegeId ||
      !mobileNo ||
      !gender ||
      !batch ||
      !email ||
      !password
    ) {
      throw new Error("All fields are required");
    }

    const usersRef = collection(firestore, "users");
    const studentsRef = collection(firestore, "Student");

    // Check if the email already exists in the users collection
    const emailQuery = query(usersRef, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      // If email already exists, return a message indicating that
      return { success: false, message: "User already exists with this email" };
    }

    // Check if the collegeId already exists in the students collection
    const collegeIdQuery = query(
      studentsRef,
      where("collegeId", "==", collegeId)
    );
    const collegeIdSnapshot = await getDocs(collegeIdQuery);

    if (!collegeIdSnapshot.empty) {
      // If collegeId already exists, return a message indicating that
      return {
        success: false,
        message: "Student already exists with this college ID",
      };
    }

    // Generate a new userId by querying the last userId from the users collection
    const lastUserQuery = query(usersRef, orderBy("userId", "desc"), limit(1));
    const lastUserSnapshot = await getDocs(lastUserQuery);
    const newUserId = lastUserSnapshot.empty
      ? 1
      : lastUserSnapshot.docs[0].data().userId + 1;

    // Create user data
    const userData = {
      userId: newUserId,
      role: "student",
      email,
      password, // Store plain text password (you should consider hashing it for security)
      createdAt: Timestamp.now(),
    };

    // Add user document to the 'users' collection
    await setDoc(doc(usersRef, newUserId.toString()), userData);

    // Create student data
    const studentData = {
      userId: newUserId,
      name,
      collegeId,
      mobileNo,
      gender,
      batch,
      messId: null,
      createdAt: Timestamp.now(),
    };

    // Add student document to the 'Student' collection
    await addDoc(studentsRef, studentData);

    return {
      success: true,
      message: "Student registered successfully",
      userId: newUserId,
    };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Get User by CollegeId
export const getUserByCollegeId = async (collegeId) => {
  try {
    const studentsRef = collection(firestore, 'Student');
    const studentQuery = query(studentsRef, where('collegeId', '==', collegeId));
    const snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      throw new Error('Student not found');
    }

    const studentData = snapshot.docs[0].data();
    return { success: true, user: studentData };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Retrieve All Users
export const getAllUsers = async () => {
  try {
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);

    if (snapshot.empty) {
      throw new Error('No users found');
    }

    const usersList = snapshot.docs.map(doc => doc.data());
    return { success: true, users: usersList };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Retrieve User by ID(User Collection)
export const getUserById = async (userId) => {
  try {
    const usersRef = collection(firestore, 'users');
    const userQuery = query(usersRef, where('userId', '==', parseInt(userId)));
    const snapshot = await getDocs(userQuery);

    if (snapshot.empty) {
      throw new Error('No user found with this userId');
    }

    const userDoc = snapshot.docs[0].data();
    return { success: true, user: userDoc };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Delete User by ID
export const deleteUserById = async (userId) => {
  try {
    const usersRef = collection(firestore, 'users');
    const userQuery = query(usersRef, where('userId', '==', parseInt(userId)));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error('No user found with this userId');
    }

    const userDoc = userSnapshot.docs[0];
    await deleteDoc(userDoc.ref);

    const studentsRef = collection(firestore, 'Student');
    const studentQuery = query(studentsRef, where('userId', '==', parseInt(userId)));
    const studentSnapshot = await getDocs(studentQuery);

    studentSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    return { success: true, message: 'User deleted successfully' };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Update Student Profile
export const updateStudentProfile = async (userId, profileData) => {
  try {
    const { name, mobileNo, gender, batch, messId } = profileData;

    if (!name && !mobileNo && !gender && !batch && !messId) {
      throw new Error('At least one field is required to update');
    }

    const studentsRef = collection(firestore, 'Student');
    const studentQuery = query(studentsRef, where('userId', '==', parseInt(userId)));
    const snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      throw new Error('No student found with this userId');
    }

    const studentDoc = snapshot.docs[0];
    const updatedData = {
      name: name || studentDoc.data().name,
      mobileNo: mobileNo || studentDoc.data().mobileNo,
      gender: gender || studentDoc.data().gender,
      batch: batch || studentDoc.data().batch,
      messId: messId || studentDoc.data().messId,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(studentDoc.ref, updatedData);

    return { success: true, message: 'Student profile updated successfully' };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Get All Students
export const getAllStudents = async () => {
    try {
      const studentsRef = collection(firestore, 'Student');
      const snapshot = await getDocs(studentsRef);
  
      if (snapshot.empty) {
        throw new Error('No students found');
      }
  
      const studentsList = snapshot.docs.map(doc => doc.data());
      return { success: true, students: studentsList };
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  };

// Get Student by Id(Student Collection)
export const getStudentById = async (studentId) => {
    try {
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('userId', '==', parseInt(studentId)));
      const snapshot = await getDocs(studentQuery);
      
      if (snapshot.empty) {
        throw new Error('Student not found');
      }
  
      const studentData = snapshot.docs[0].data();
      return { success: true, student: studentData };
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  };
  
// Update Mess ID by CollegeId
export const updateMessByCollegeId = async (collegeId, messId) => {
    try {
      if (!collegeId || !messId) {
        throw new Error('CollegeId and MessId are required');
      }
  
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('collegeId', '==', collegeId));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        throw new Error('No student found with this collegeId');
      }
  
      const studentDoc = studentSnapshot.docs[0];
      await updateDoc(studentDoc.ref, { messId, updatedAt: Timestamp.now() });
  
      return { success: true, message: `MessId updated successfully for collegeId ${collegeId}` };
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  };

/*// Update Student Password(need update)
export const updateStudentPassword = async (userId, newPassword) => {
    try {
      if (!newPassword) {
        throw new Error('New password is required');
      }
  
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', parseInt(userId)));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        throw new Error('No user found with this userId');
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const userDoc = userSnapshot.docs[0];
  
      await updateDoc(userDoc.ref, { password: hashedPassword, updatedAt: Timestamp.now() });
  
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  };*/

// Update Student Password
export const updateStudentPassword = async (userId, newPassword) => {
  try {
    if (!newPassword) {
      throw new Error('New password is required');
    }

    const usersRef = collection(firestore, 'users');
    const userQuery = query(usersRef, where('userId', '==', parseInt(userId)));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error('No user found with this userId');
    }

    const userDoc = userSnapshot.docs[0];

    await updateDoc(userDoc.ref, { password: newPassword, updatedAt: Timestamp.now() });

    return { success: true, message: 'Password updated successfully' };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
};

// Delete User by CollegeId
export const deleteUserByCollegeId = async (collegeId) => {
    try {
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('collegeId', '==', collegeId));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        return { success: false, message: 'No student found with this collegeId' };
      }
  
      const studentDoc = studentSnapshot.docs[0];
      const userId = studentDoc.data().userId;
  
      // Delete associated user data
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        await deleteDoc(userSnapshot.docs[0].ref);
      }
  
      // Delete the student document
      await deleteDoc(studentDoc.ref);
  
      return { success: true, message: 'User deleted successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Update Student Profile by CollegeId
export const updateStudentProfileByCollegeId = async (collegeId, updateData) => {
    try {
      const { name, mobileNo, gender, batch, messId } = updateData;
  
      if (!name && !mobileNo && !gender && !batch && !messId) {
        return { success: false, message: 'At least one field is required to update' };
      }
  
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('collegeId', '==', collegeId));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        return { success: false, message: 'No student found with this collegeId' };
      }
  
      const studentDoc = studentSnapshot.docs[0];
      const updatedData = {
        name: name || studentDoc.data().name,
        mobileNo: mobileNo || studentDoc.data().mobileNo,
        gender: gender || studentDoc.data().gender,
        batch: batch || studentDoc.data().batch,
        messId: messId || studentDoc.data().messId,
        updatedAt: Timestamp.now(),
      };
  
      await updateDoc(studentDoc.ref, updatedData);
  
      return { success: true, message: 'Student profile updated successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Update Mess ID by User ID
export const updateMessByUserId = async (userId, messId ) => {
    try {
      if (!messId) {
        return { success: false, message: 'MessId is required' };
      }
  
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('userId', '==', parseInt(userId)));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        return { success: false, message: 'No student found with this userId' };
      }
  
      const studentDoc = studentSnapshot.docs[0];
      await updateDoc(studentDoc.ref, { messId, updatedAt: Timestamp.now() });
  
      return { success: true, message: `MessId updated successfully for userId ${userId}` };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };
  
// Update Mess ID by Batch
export const updateMessByBatch = async ( batch, messId ) => {
    try {
      if (!batch || !messId) {
        return { success: false, message: 'Batch and MessId are required' };
      }
  
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('batch', '==', batch));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        return { success: false, message: 'No students found for this batch' };
      }
  
      const batchUpdate = [];
      studentSnapshot.forEach((doc) => {
        batchUpdate.push(updateDoc(doc.ref, { messId, updatedAt: Timestamp.now() }));
      });
  
      await Promise.all(batchUpdate);
  
      return { success: true, message: `MessId updated successfully for batch ${batch}` };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

/*// Update Student Password by CollegeId(need update)
export const updateStudentPasswordByCollegeId = async (collegeId, newPassword ) => {
    try {
      if (!newPassword) {
        return { success: false, message: 'New password is required' };
      }
  
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('collegeId', '==', collegeId));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        return { success: false, message: 'No student found with this collegeId' };
      }
  
      const studentDoc = studentSnapshot.docs[0];
      const userId = studentDoc.data().userId;
  
      const usersRef = collection(firestore, 'users');
      const userQuery = query(usersRef, where('userId', '==', userId));
      const userSnapshot = await getDocs(userQuery);
  
      if (userSnapshot.empty) {
        return { success: false, message: 'No user found with this userId' };
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const userDoc = userSnapshot.docs[0];
  
      await updateDoc(userDoc.ref, { password: hashedPassword, updatedAt: Timestamp.now() });
  
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };*/

// Update Student Password by CollegeId
export const updateStudentPasswordByCollegeId = async (collegeId, newPassword) => {
  try {
    if (!newPassword) {
      return { success: false, message: 'New password is required' };
    }

    const studentsRef = collection(firestore, 'Student');
    const studentQuery = query(studentsRef, where('collegeId', '==', collegeId));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      return { success: false, message: 'No student found with this collegeId' };
    }

    const studentDoc = studentSnapshot.docs[0];
    const userId = studentDoc.data().userId;

    const usersRef = collection(firestore, 'users');
    const userQuery = query(usersRef, where('userId', '==', userId));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return { success: false, message: 'No user found with this userId' };
    }

    const userDoc = userSnapshot.docs[0];

    await updateDoc(userDoc.ref, { password: newPassword, updatedAt: Timestamp.now() });

    return { success: true, message: 'Password updated successfully' };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// Retrieve Students by Batch and Gender
export const getStudentsByBatchAndGender = async ( batch, gender ) => {
    try {
      const studentsRef = collection(firestore, 'Student');
      let studentQuery = studentsRef;
  
      if (batch) {
        studentQuery = query(studentQuery, where('batch', '==', batch));
      }
  
      if (gender) {
        studentQuery = query(studentQuery, where('gender', '==', gender));
      }
  
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        return { success: false, message: 'No students found with the provided criteria' };
      }
  
      const studentsList = studentSnapshot.docs.map((doc) => doc.data());
  
      return { success: true, students: studentsList };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };

// Retrieve Students by Gender
export const getStudentsByGender = async (gender) => {
    try {
      if (!gender) {
        return { success: false, message: 'Gender is required' };
      }
  
      const studentsRef = collection(firestore, 'Student');
      const studentQuery = query(studentsRef, where('gender', '==', gender));
      const studentSnapshot = await getDocs(studentQuery);
  
      if (studentSnapshot.empty) {
        return { success: false, message: 'No students found with this gender' };
      }
  
      const studentsList = studentSnapshot.docs.map((doc) => doc.data());
  
      return { success: true, students: studentsList };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  };
  

  // Get Mess Numbers by User IDs
// Get Users by User IDs
export async function getUsersByUserIds(userIds) {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('An array of User IDs is required.');
    }

    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(query(usersRef, where('userId', 'in', userIds)));

    if (snapshot.empty) {
      throw new Error('No users found for the given User IDs.');
    }

    // Map the documents to their data
    const users = snapshot.docs.map((doc) => ({
      id: doc.id, // Document ID
      ...doc.data(), // Document data
    }));

    return { success: true, users };
  } catch (err) {
    console.error('Error getting users by User IDs:', err);
    return { success: false, error: err.message };
  }
}