import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser, subscribeToAuthChanges, updateUserProfileAuth } from '../services/auth';
import { getUserProfile, saveUserProfile, type UserProfile } from '../services/users';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: () => Promise<void>;
  loginAsDemoJudge: () => void;
  logout: () => Promise<void>;
  initialize: () => () => void;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  login: async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error(error);
    }
  },
  loginAsDemoJudge: async () => {
    const mockJudgeUser = {
      uid: "demo-judge-hackathon-2026",
      displayName: "Demo User (Chief Triage Lead)",
      email: "Demo.sharma@gmail.com",
      photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    } as unknown as User;
    const profile = await getUserProfile("demo-judge-hackathon-2026", "Demo.sharma@gmail.com", "Demo User (Chief Triage Lead)", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");
    set({ user: mockJudgeUser, userProfile: profile, isLoading: false });
  },
  logout: async () => {
    try {
      await logoutUser();
      set({ user: null, userProfile: null });
    } catch (error) {
      console.error(error);
    }
  },
  initialize: () => {
    set({ isLoading: true });
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid, user.email || "", user.displayName || "", user.photoURL || "");
        set({ user, userProfile: profile, isLoading: false });
      } else {
        set({ user: null, userProfile: null, isLoading: false });
      }
    });
    return unsubscribe;
  },
  updateUserProfileData: async (data: Partial<UserProfile>) => {
    const { user, userProfile } = get();
    if (!userProfile && !user) return false;

    const uid = userProfile?.uid || user?.uid || 'demo-judge-hackathon-2026';
    const email = userProfile?.email || user?.email || 'Demo.sharma@gmail.com';
    
    const updated: UserProfile = {
      uid,
      email,
      displayName: data.displayName || userProfile?.displayName || user?.displayName || 'Demo User',
      contactNumber: data.contactNumber || userProfile?.contactNumber || '+91 98765 43210',
      photoURL: data.photoURL || userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    };

    await saveUserProfile(updated);
    if (user) {
      await updateUserProfileAuth(user, { displayName: updated.displayName, photoURL: updated.photoURL });
    }

    set({
      userProfile: updated,
      user: user ? ({ ...user, displayName: updated.displayName, photoURL: updated.photoURL } as unknown as User) : null
    });
    return true;
  }
}));
