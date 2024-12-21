import { 
    collection, 
    doc, 
    getDocs, 
    query, 
    where, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    increment, 
    getDoc 
  } from 'firebase/firestore';
  import { firestore } from './firebase'; // Adjust the import based on your project setup
  
  const isVotedCollection = collection(firestore, 'isvoted');
  const issuesCollection = collection(firestore, 'Issues');
  
  /**
   * Handle upvote or downvote for an issue by a user
   * @param {string} issueId - ID of the issue
   * @param {string} userId - ID of the user
   * @param {string} vote - 'upvotes' or 'downvotes'
   */
  export async function handleVote(issueId, userId, vote) {
    try {
      // Query to check if the user already voted for this issue
      const q = query(isVotedCollection, where('issueId', '==', issueId), where('userId', '==', userId));
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        // If no record exists, add a new vote
        const voteRef = doc(isVotedCollection);
        await setDoc(voteRef, { issueId, userId, vote });
  
        // Increment the respective vote count in the Issues collection
        const issueRef = doc(issuesCollection, issueId);
        await updateDoc(issueRef, {
          [vote]: increment(1), // Increment upvotes or downvotes
          count: increment(vote === 'upvotes' ? 1 : -1), // Adjust count: upvotes add 1, downvotes subtract 1
          updatedAt: new Date(), // Update the timestamp
        });
  
        return { success: true, message: 'Vote added successfully.' };
      } else {
        // If a record exists, get the vote data
        const voteRef = snapshot.docs[0].ref;
        const existingVote = snapshot.docs[0].data().vote;
  
        if (existingVote === vote) {
          // If the vote matches, delete the record and decrement the vote count
          await deleteDoc(voteRef);
  
          const issueRef = doc(issuesCollection, issueId);
          await updateDoc(issueRef, {
            [vote]: increment(-1), // Decrement the vote count
            count: increment(vote === 'upvotes' ? -1 : 1), // Adjust count: upvotes subtract 1, downvotes add 1
            updatedAt: new Date(), // Update the timestamp
          });
  
          return { success: true, message: 'Vote removed successfully.' };
        } else {
          // If the vote is opposite, update the record and adjust the vote counts
          await updateDoc(voteRef, { vote });
  
          const issueRef = doc(issuesCollection, issueId);
          await updateDoc(issueRef, {
            [existingVote]: increment(-1), // Decrement the previous vote count
            [vote]: increment(1),          // Increment the new vote count
            count: increment(
              vote === 'upvotes' ? 2 : -2 // Adjust count based on the vote change
            ),
            updatedAt: new Date(),         // Update the timestamp
          });
  
          return { success: true, message: 'Vote updated successfully.' };
        }
      }
    } catch (err) {
      console.error('Error handling vote:', err);
      return { success: false, error: err.message };
    }
  }
  
  /**
   * Retrieve upvotes and downvotes for a specific issue
   * @param {string} issueId - ID of the issue
   * @returns {Promise<{ upvotes: number, downvotes: number }>}
   */
  export async function getVotesForIssue(issueId) {
    try {
      // Reference to the specific issue document in the Issues collection
      const issueRef = doc(firestore, 'Issues', issueId);
      
      // Fetch the document
      const issueSnapshot = await getDoc(issueRef);
  
      if (issueSnapshot.exists()) {
        // Extract upvotes and downvotes fields from the document
        const { upvotes, downvotes } = issueSnapshot.data();
        return { upvotes, downvotes };
      } else {
        return { success: false, message: 'Issue not found.' };
      }
    } catch (err) {
      console.error('Error fetching votes for issue:', err);
      return { success: false, error: err.message };
    }
  }

  export async function getUserVote(issueId, userId) {
    const q = query(isVotedCollection, where("issueId", "==", issueId), where("userId", "==", userId));
    const snapshot = await getDocs(q);
  
    if (!snapshot.empty) {
      return snapshot.docs[0].data().vote; // Return the user's vote ('upvotes' or 'downvotes')
    }
    return null; // No vote found
  }
  
  