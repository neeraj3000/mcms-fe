import { firestore } from "./firebase"; // Import firestore and Timestamp
import * as FileSystem from "expo-file-system";
import { Timestamp } from "firebase/firestore"; // Import Timestamp for timestamps

// Upload to Cloudinary
export async function uploadToCloudinary(image, type) {
  try {
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dwi8fucyt/upload";
    const uploadPreset = "mcms-issue";

    const blob = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });

    const formData = new FormData();
    formData.append("file", `data:${type}/;base64,${blob}`);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", "dwi8fucyt");

    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    const responseData = await uploadResponse.json();

    if (responseData.secure_url) {
      return responseData.secure_url;
    } else {
      throw new Error("Image upload failed");
    }
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// Create Issue
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { uploadToCloudinary } from "./uploadService"; // Assuming you have an upload service function

export async function createIssue({ title, description, messNo, image, userId }) {
  try {
    if (!description || !title || !userId || messNo === undefined) {
      throw new Error("All fields are required except image");
    }

    const db = getFirestore(); // Initialize Firestore
    const issuesRef = collection(db, "Issues");
    let imageUrl = null;

    if (image) {
      const imageType = "image/jpeg"; // Adjust based on the actual image type
      imageUrl = await uploadToCloudinary(image, imageType);
    }

    const issueData = {
      description,
      title,
      image: imageUrl,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
      messNo,
      upvotes: 0,
      downvotes: 0,
      count: 0,
      solveId: null,
    };

    const issueDoc = await addDoc(issuesRef, issueData);

    return {
      success: true,
      message: "Issue created successfully",
      issueId: issueDoc.id,
    };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}


// Get All Issues
export async function getAllIssues() {
  try {
    const snapshot = await firestore.collection("Issues").get();
    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, issues };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// Get Single Issue
export async function getIssueById(id) {
  try {
    if (!id) {
      throw new Error("Issue ID is required");
    }

    const doc = await firestore.collection("Issues").doc(id).get();

    if (!doc.exists) {
      throw new Error("Issue not found");
    }

    return { success: true, issue: { id: doc.id, ...doc.data() } };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// Update Issue
export async function updateIssue(id, updates) {
  try {
    if (!id) {
      throw new Error("Issue ID is required");
    }

    updates.updatedAt = Timestamp.now();
    await firestore.collection("Issues").doc(id).update(updates);

    return { success: true, message: "Issue updated successfully" };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// Delete Issue
export async function deleteIssue(id) {
  try {
    if (!id) {
      throw new Error("Issue ID is required");
    }

    await firestore.collection("Issues").doc(id).delete();
    return { success: true, message: "Issue deleted successfully" };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// Upvote/Downvote Issue
export async function voteIssue(id, voteType) {
  try {
    if (!id || !voteType) {
      throw new Error("Issue ID and voteType are required");
    }

    const issueRef = firestore.collection("Issues").doc(id);
    const issueDoc = await issueRef.get();

    if (!issueDoc.exists) {
      throw new Error("Issue not found");
    }

    const issueData = issueDoc.data();

    if (voteType === "upvote") {
      issueData.upvotes += 1;
    } else if (voteType === "downvote") {
      issueData.downvotes += 1;
    } else {
      throw new Error("Invalid voteType");
    }

    issueData.count = issueData.upvotes - issueData.downvotes;
    issueData.updatedAt = Timestamp.now();

    await issueRef.update({
      upvotes: issueData.upvotes,
      downvotes: issueData.downvotes,
      count: issueData.count,
      updatedAt: issueData.updatedAt,
    });

    return {
      success: true,
      voteType,
      updatedValue:
        voteType === "upvote" ? issueData.upvotes : issueData.downvotes,
    };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// Get Issues by userId
export async function getIssuesByUserId(userId) {
  try {
    if (!userId) {
      return { success: false, message: "User ID is required" };
    }

    const snapshot = await firestore
      .collection("Issues")
      .where("userId", "==", userId) // Filter by userId
      .get();

    if (snapshot.empty) {
      return { success: false, message: "No issues found for this user" };
    }

    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, issues };
  } catch (err) {
    console.error("Error fetching issues by userId:", err);
    return { success: false, error: err.message };
  }
}

// Get Issues by messNo
export async function getIssuesByMessNo(messNo) {
  try {
    if (messNo === undefined) {
      return { success: false, message: "Mess number is required" };
    }

    const snapshot = await firestore
      .collection("Issues")
      .where("messNo", "==", messNo) // Filter by messNo
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No issues found for this mess number",
      };
    }

    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, issues };
  } catch (err) {
    console.error("Error fetching issues by messNo:", err);
    return { success: false, error: err.message };
  }
}

// Get Issues by status
export async function getIssuesByStatus(status) {
  try {
    if (!status) {
      return { success: false, message: "Status is required" };
    }

    const snapshot = await firestore
      .collection("Issues")
      .where("status", "==", status) // Filter by status
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: `No issues found with status: ${status}`,
      };
    }

    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, issues };
  } catch (err) {
    console.error("Error fetching issues by status:", err);
    return { success: false, error: err.message };
  }
}

// Get Issues Except by status
export async function getIssuesExceptStatus(excludedStatus) {
  try {
    if (!excludedStatus) {
      return { success: false, message: "Status is required" };
    }

    const snapshot = await firestore
      .collection("Issues")
      .where("status", "!=", excludedStatus) // Filter out issues with the excluded status
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: `No issues found except status: ${excludedStatus}`,
      };
    }

    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return { success: true, issues };
  } catch (err) {
    console.error("Error fetching issues except status:", err);
    return { success: false, error: err.message };
  }
}
