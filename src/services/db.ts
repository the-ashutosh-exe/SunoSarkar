import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface IssueData {
  id?: string;
  reporterId: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterContact?: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  nearbyFacilities: any[];
  issueType: string;
  severity: number;
  riskLevel: string;
  explanation: string;
  userDescription?: string;
  weatherAlert?: string;
  priorityScore: number;
  department: string;
  status: 'reported' | 'verified' | 'in_progress' | 'resolved';
  upvotes: number;
  verifiedBy: string[];
  createdAt?: any;
}

const SEED_INDIAN_ISSUES: IssueData[] = [
  {
    id: 'issue_bglr_101',
    reporterId: 'usr_ind_1',
    reporterName: 'Vikramaditya Rao',
    reporterEmail: 'vikram.rao@gmail.com',
    reporterContact: '+91 98450 12345',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    latitude: 12.9352,
    longitude: 77.6245,
    nearbyFacilities: [{ name: 'Koramangala Police Station', distance: '300m' }],
    issueType: 'Spaghetti Wires 🍝',
    severity: 4,
    riskLevel: 'Critical',
    explanation: 'Massive tangle of exposed high-tension electrical and broadband wires sagging over Koramangala 4th Block main street pedestrians.',
    userDescription: 'Wires sparkling during evening drizzle right outside the bakery.',
    weatherAlert: 'Heavy Rain Warning ⛈️',
    priorityScore: 92,
    department: 'Electrical Grid (BESCOM)',
    status: 'verified',
    upvotes: 42,
    verifiedBy: ['usr_ind_2', 'usr_ind_3']
  },
  {
    id: 'issue_mum_102',
    reporterId: 'usr_ind_2',
    reporterName: 'Sneha Kulkarni',
    reporterEmail: 'sneha.kulkarni@gmail.com',
    reporterContact: '+91 98200 54321',
    imageUrl: 'https://images.unsplash.com/photo-1584463623578-3eb21c7d819d?auto=format&fit=crop&w=600&q=80',
    latitude: 19.1136,
    longitude: 72.8697,
    nearbyFacilities: [{ name: 'Andheri Metro Station', distance: '150m' }],
    issueType: 'Chonky Pothole 🕳️',
    severity: 5,
    riskLevel: 'Critical',
    explanation: 'Massive waterlogged crater on Western Express Highway near Andheri flyover. Actively snapping auto-rickshaw axles and causing multi-km jams.',
    userDescription: 'Two wheelers skidding heavily due to hidden depth under muddy water.',
    weatherAlert: 'Monsoon Alert 🌧️',
    priorityScore: 88,
    department: 'Roads & Traffic (PWD)',
    status: 'in_progress',
    upvotes: 35,
    verifiedBy: ['usr_ind_1', 'usr_ind_4']
  },
  {
    id: 'issue_pune_103',
    reporterId: 'usr_ind_3',
    reporterName: 'Amitabh Joshi',
    reporterEmail: 'amitabh.joshi@gmail.com',
    reporterContact: '+91 94220 67890',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0ebb18086f6?auto=format&fit=crop&w=600&q=80',
    latitude: 18.5204,
    longitude: 73.8567,
    nearbyFacilities: [{ name: 'Shivaji Nagar Bus Stand', distance: '100m' }],
    issueType: 'Drainage Clog 🌊',
    severity: 3,
    riskLevel: 'High',
    explanation: 'Stormwater drain overflow causing ankle-deep sewage flooding across FC Road pedestrian walkways.',
    userDescription: 'Foul smell and mosquito breeding risk increasing rapidly.',
    priorityScore: 65,
    department: 'Solid Waste (SWM)',
    status: 'reported',
    upvotes: 19,
    verifiedBy: ['usr_ind_2']
  },
  {
    id: 'issue_del_104',
    reporterId: 'usr_ind_4',
    reporterName: 'Neha Sharma',
    reporterEmail: 'neha.sharma@gmail.com',
    reporterContact: '+91 98110 98765',
    imageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    latitude: 28.6315,
    longitude: 77.2167,
    nearbyFacilities: [{ name: 'Rajiv Chowk Metro Gate 3', distance: '50m' }],
    issueType: 'Dark Alley / Dead Lights 💡',
    severity: 4,
    riskLevel: 'High',
    explanation: 'Entire row of 6 solar streetlights non-functional in Connaught Place Outer Circle parking bay creating night safety hazards.',
    userDescription: 'Pitch dark zone after 8 PM, urgent repair required.',
    priorityScore: 74,
    department: 'Power Grid (DISCOM)',
    status: 'resolved',
    upvotes: 28,
    verifiedBy: ['usr_ind_1', 'usr_ind_3']
  }
];

let cachedIssues: IssueData[] | null = null;
let lastFetchTime: number = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export const invalidateIssuesCache = () => {
  cachedIssues = null;
  lastFetchTime = 0;
};

export const createIssue = async (data: IssueData) => {
  try {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    const issuesRef = collection(db, 'issues');
    const docRef = await addDoc(issuesRef, {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateIssuesCache();
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export const getAllIssues = async (forceRefresh: boolean = false): Promise<IssueData[]> => {
  const now = Date.now();
  if (!forceRefresh && cachedIssues && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedIssues;
  }
  try {
    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      cachedIssues = SEED_INDIAN_ISSUES;
      lastFetchTime = now;
      return SEED_INDIAN_ISSUES;
    }

    const fetched = querySnapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as IssueData));
    cachedIssues = fetched;
    lastFetchTime = now;
    return fetched;
  } catch (error) {
    console.warn("Error fetching issues from Firestore, serving Indian seed data:", error);
    return SEED_INDIAN_ISSUES;
  }
};

export const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const getNearbyOpenIssues = async (lat: number, lng: number, radiusMeters: number = 50): Promise<IssueData[]> => {
  const allIssues = await getAllIssues();
  return allIssues.filter(issue => {
    if (issue.status === 'resolved') return false;
    if (!issue.latitude || !issue.longitude) return false;
    const dist = calculateDistanceMeters(lat, lng, issue.latitude, issue.longitude);
    return dist <= radiusMeters;
  });
};

export const upvoteIssue = async (issueId: string): Promise<void> => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, {
      upvotes: increment(1)
    });
    invalidateIssuesCache();
  } catch (error) {
    console.error("Error upvoting issue: ", error);
    throw error;
  }
};
