import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile, type User } from 'firebase/auth';

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const triggerPasswordResetEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, message: "Please enter a valid email address." };
    }
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: `🔐 Password reset verification link sent to ${email}! Check your spam/junk folder.` };
  } catch (error: any) {
    console.warn("Firebase sendPasswordResetEmail error:", error);
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: `⚠️ No password account found for ${email}. Please ensure you registered with Email/Password.` };
    }
    if (error.code === 'auth/invalid-email') {
      return { success: false, message: `⚠️ Invalid email address format: ${email}.` };
    }
    return { success: false, message: error.message || "Failed to send verification email." };
  }
};

export const updateUserProfileAuth = async (user: User, data: { displayName?: string; photoURL?: string }): Promise<void> => {
  try {
    await updateProfile(user, data);
  } catch (error) {
    console.warn("Firebase updateProfile error (or demo user):", error);
  }
};
