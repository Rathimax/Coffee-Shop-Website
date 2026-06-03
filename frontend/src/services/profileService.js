import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const profileService = {
  async getProfile(userId) {
    if (!userId) return null;
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  async updateProfile(userId, profileData) {
    if (!userId) return;
    try {
      const docRef = doc(db, "users", userId);
      // We use setDoc with merge: true to avoid overwriting unrelated fields
      await setDoc(docRef, profileData, { merge: true });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
};
