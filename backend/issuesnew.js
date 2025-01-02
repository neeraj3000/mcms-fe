import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  FieldValue,
  startAfter,
  orderBy,
  limit,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore"; // Import Timestamp for timestamps
import * as FileSystem from "expo-file-system";
import { firestore } from "./firebase"; // Import Firestore configuration from your firebase.js
import sendNotifications from "@/src/utils/sendNotifications";

// Upload to Cloudinary
// Upload to Cloudinary
export async function uploadToCloudinary(image, type) {
  try {
    console.log("Starting Cloudinary upload...");
    console.log("Image path:", image);
    console.log("Image type:", type);

    if (!image || typeof image !== "string") {
      throw new Error("Invalid image path provided.");
    }

    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dwi8fucyt/upload";
    const uploadPreset = "mcms-issue";

    console.log("Reading image as Base64...");
    const blob = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });
    console.log("Base64 string created. Length:", blob.length);

    console.log("Preparing form data...");
    const formData = new FormData();
    formData.append("file", `data:${type}/;base64,${blob}`);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", "dwi8fucyt");

    console.log("Sending request to Cloudinary...");
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    console.log("Response received from Cloudinary.");
    const responseData = await uploadResponse.json();
    console.log("Cloudinary response data:", responseData);

    if (responseData.secure_url) {
      console.log("Image uploaded successfully:", responseData.secure_url);
      return responseData.secure_url;
    } else {
      throw new Error(responseData.error?.message || "Image upload failed");
    }
  } catch (err) {
    console.error("Error during Cloudinary upload:", err);
    throw new Error(err.message);
  }
}
// Create Issue
export async function createIssue({
  description,
  category,
  image,
  userId,
  messNo,
}) {
  try {
    console.log(description + " " + category + userId + messNo);
    if (!description || !category || !userId || messNo === undefined) {
      throw new Error("All fields are required except image");
    }

    const issuesRef = collection(firestore, "Issues");
    let imageUrl = null;

    if (image) {
      const imageType = "image/jpeg"; // Adjust based on the actual image type
      imageUrl = await uploadToCloudinary(image, imageType);
    }

    const issueData = {
      description,
      category,
      image: imageUrl,
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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

// Keep a reference to the last document fetched
let lastVisibleDocument = null;

export async function getAllIssues(
  batchSize = 10,
  reset = false,
  unresolvedOnly = true
) {
  try {
    // Reset pagination if needed
    if (reset) {
      lastVisibleDocument = null;
    }

    // Create a query for the Issues collection
    let issuesQuery = query(
      collection(firestore, "Issues"),
      orderBy("createdAt", "desc"), // Adjust the field as per your data
      limit(batchSize)
    );

    // If unresolvedOnly is true, filter by status
    if (unresolvedOnly) {
      issuesQuery = query(issuesQuery, where("status", "!=", "resolved"));
    }

    // If there's a last visible document, start after it
    if (lastVisibleDocument) {
      issuesQuery = query(issuesQuery, startAfter(lastVisibleDocument));
    }

    const snapshot = await getDocs(issuesQuery);

    // If there are no documents, return an empty result
    if (snapshot.empty) {
      return { success: true, issues: [], hasMore: false };
    }

    // Map the documents to the desired format
    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Update the last visible document
    lastVisibleDocument = snapshot.docs[snapshot.docs.length - 1];

    return {
      success: true,
      issues,
      hasMore: snapshot.docs.length === batchSize,
    };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}


// Get All Unresolved Issues
export async function getAllUnresolvedIssues() {
  try {
    // Query the Issues collection where status is not 'resolved'
    const issuesRef = collection(firestore, "Issues");
    const unresolvedQuery = query(issuesRef, where("status", "!=", "resolved"));

    const snapshot = await getDocs(unresolvedQuery);

    // Map over the snapshot to retrieve issues
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

    const docRef = doc(firestore, "Issues", id);
    const issueDoc = await getDoc(docRef);
    if (!issueDoc.exists()) {
      throw new Error("Issue not found");
    }

    return { success: true, issue: { id: issueDoc.id, ...issueDoc.data() } };
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
    const issueRef = doc(firestore, "Issues", id);
    const issueDoc = await getIssueById(id);
    console.log("\nissues", issueDoc);
    await updateDoc(issueRef, updates);
    const updatesString = Object.entries(updates)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    sendNotifications(
      [`${issueDoc.issue.userId}`],
      "Issue Status Updated",
      `${updatesString} is updated`
    );

    return { success: true, message: "Issue updated successfully" };
  } catch (err) {
    console.error(err);
    throw new Error(err.message);
  }
}

// Delete Issue
export async function deleteIssueById(id) {
  try {
    if (!id) {
      throw new Error("Issue ID is required");
    }

    const issueRef = doc(firestore, "Issues", id);
    await deleteDoc(issueRef);
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

    const issueRef = doc(firestore, "Issues", id);
    const issueDoc = await getDoc(issueRef);

    if (!issueDoc.exists()) {
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

    await updateDoc(issueRef, {
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

    const q = query(
      collection(firestore, "Issues"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

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

// Get Mess Number by User ID
export async function getMessNoByUserId(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const representativeRef = collection(firestore, "representative");
    const snapshot = await getDocs(
      query(representativeRef, where("userId", "==", userId))
    );

    if (snapshot.empty) {
      throw new Error("No representative found for the given User ID.");
    }

    // Assuming only one representative document per userId
    const representativeData = snapshot.docs[0].data();
    const messNo = representativeData.messNo;

    if (!messNo) {
      throw new Error("Mess Number is not available for the given User ID.");
    }

    return { success: true, messNo };
  } catch (err) {
    console.error("Error getting Mess Number by User ID:", err);
    return { success: false, error: err.message };
  }
}

// Get Issues by messNo
export async function getIssuesByMessNo(messNo) {
  try {
    if (messNo === undefined) {
      return { success: false, message: "Mess number is required" };
    }

    const q = query(
      collection(firestore, "Issues"),
      where("messNo", "==", messNo)
    );
    const snapshot = await getDocs(q);

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

    const q = query(
      collection(firestore, "Issues"),
      where("status", "==", status)
    );
    const snapshot = await getDocs(q);

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

    const q = query(
      collection(firestore, "Issues"),
      where("status", "!=", excludedStatus)
    );
    const snapshot = await getDocs(q);

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
