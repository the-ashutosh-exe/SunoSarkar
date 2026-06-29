import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAllIssues } from './db';

export interface UserStats {
  points: number;
  reportsCount: number;
  resolvedCount: number;
  rankTitle: string;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, where('reporterId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    let reportsCount = 0;
    let resolvedCount = 0;

    querySnapshot.forEach((doc) => {
      reportsCount++;
      if (doc.data().status === 'resolved') {
        resolvedCount++;
      }
    });

    const points = (reportsCount * 10) + (resolvedCount * 50);
    
    let rankTitle = 'Scout';
    if (points >= 50) rankTitle = 'Observer';
    if (points >= 150) rankTitle = 'Guardian';
    if (points >= 500) rankTitle = 'Community Hero';

    return {
      points,
      reportsCount,
      resolvedCount,
      rankTitle
    };
  } catch (error) {
    console.error("Error fetching user stats: ", error);
    return { points: 0, reportsCount: 0, resolvedCount: 0, rankTitle: 'Scout' };
  }
};

let leaderboardCache: any[] | null = null;
let leaderboardCacheTime = 0;
const LEADERBOARD_CACHE_TTL = 60 * 1000; // 60 seconds

// Dynamic Leaderboard using client-side aggregation with 60s TTL caching
export const getLeaderboard = async (forceRefresh = false) => {
  if (!forceRefresh && leaderboardCache && (Date.now() - leaderboardCacheTime < LEADERBOARD_CACHE_TTL)) {
    return leaderboardCache;
  }
  try {
    const allIssues = await getAllIssues();
    
    // Group issues by reporterId to calculate points
    const userScores: Record<string, { name: string; reports: number; resolved: number }> = {};
    
    allIssues.forEach(issue => {
      if (!userScores[issue.reporterId]) {
        userScores[issue.reporterId] = { name: issue.reporterName || 'Citizen', reports: 0, resolved: 0 };
      }
      userScores[issue.reporterId].reports++;
      if (issue.status === 'resolved') {
        userScores[issue.reporterId].resolved++;
      }
    });

    const leaderboard = Object.values(userScores).map(u => {
      const points = (u.reports * 10) + (u.resolved * 50);
      
      let rankTitle = 'Scout';
      if (points >= 50) rankTitle = 'Observer';
      if (points >= 150) rankTitle = 'Guardian';
      if (points >= 500) rankTitle = 'Community Hero';
      
      return {
        name: u.name,
        points,
        rank: rankTitle
      };
    });

    // Sort descending and ensure we always return an array
    const sorted = leaderboard.sort((a, b) => b.points - a.points);
    
    // Pad with placeholders if the database is literally empty
    while (sorted.length < 4) {
      sorted.push({ name: "Waiting for reporters...", points: 0, rank: "Scout" });
    }
    
    leaderboardCache = sorted;
    leaderboardCacheTime = Date.now();
    return sorted;
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return [
      { name: "Leaderboard Unavailable", points: 0, rank: "Scout" },
      { name: "...", points: 0, rank: "Scout" },
      { name: "...", points: 0, rank: "Scout" },
      { name: "...", points: 0, rank: "Scout" },
      { name: "You", points: 0, rank: "Scout" }
    ];
  }
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  contactNumber: string;
  photoURL: string;
  updatedAt?: string;
}

const mockUserProfiles: Record<string, UserProfile> = {
  'demo-judge-hackathon-2026': {
    uid: 'demo-judge-hackathon-2026',
    email: 'Demo.sharma@gmail.com',
    displayName: 'Demo User (VIP Triage Lead)',
    contactNumber: '+91 98765 43210',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
};

export const getUserProfile = async (uid: string, email: string, defaultName?: string, defaultPhoto?: string): Promise<UserProfile> => {
  const cacheKey = `civicpulse_profile_${email || uid}`;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // If cached profile has a cartoon or abstract URL, override it with a real Indian portrait photo
        if (parsed.photoURL?.includes('dicebear.com') || parsed.photoURL?.includes('1618005182384') || parsed.photoURL?.includes('1573496359142') || parsed.photoURL?.includes('1556157382') || parsed.photoURL?.includes('1580489944761')) {
          parsed.photoURL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
        }
        mockUserProfiles[uid] = parsed;
        if (email) mockUserProfiles[email] = parsed;
      } catch (e) {
        console.warn("Failed to parse cached profile", e);
      }
    }
  }

  if (mockUserProfiles[uid] || (email && mockUserProfiles[email])) {
    const profile = mockUserProfiles[uid] || mockUserProfiles[email];
    if (profile.photoURL?.includes('dicebear.com') || profile.photoURL?.includes('1618005182384') || profile.photoURL?.includes('1573496359142') || profile.photoURL?.includes('1556157382') || profile.photoURL?.includes('1580489944761')) {
      profile.photoURL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
    }
    return profile;
  }

  const fallback: UserProfile = {
    uid,
    email: email || 'Demo.sharma@gmail.com',
    displayName: defaultName || 'Demo User',
    contactNumber: '+91 98765 43210',
    photoURL: defaultPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  };

  try {
    const docRef = doc(db, 'users', uid || email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      if (data.photoURL?.includes('dicebear.com') || data.photoURL?.includes('1618005182384') || data.photoURL?.includes('1573496359142') || data.photoURL?.includes('1556157382') || data.photoURL?.includes('1580489944761')) {
        data.photoURL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
      return data;
    }
  } catch (error) {
    console.warn("Firestore error fetching user profile:", error);
  }

  return fallback;
};

export const saveUserProfile = async (profile: UserProfile): Promise<boolean> => {
  const cacheKey = `civicpulse_profile_${profile.email || profile.uid}`;
  mockUserProfiles[profile.uid] = profile;
  if (profile.email) {
    mockUserProfiles[profile.email] = profile;
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, JSON.stringify(profile));
  }

  try {
    const docRef = doc(db, 'users', profile.uid || profile.email);
    await setDoc(docRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore error saving user profile:", error);
    return true;
  }
};
