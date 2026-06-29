import { collection, addDoc, doc, getDoc, updateDoc, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SquadMember {
  id: string;
  name: string;
  email?: string;
  contact?: string;
  avatar?: string;
  xp: number;
  status: string;
}

export interface SquadData {
  id?: string;
  squadName: string;
  leaderId: string;
  leaderName: string;
  members: SquadMember[];
  totalSquadXP: number;
  createdAt?: string;
}

// In-memory fallback if Firestore fails or offline during hackathon demo
let mockSquads: Record<string, SquadData> = {
  'squad_default_101': {
    id: 'squad_default_101',
    squadName: "Bengaluru Municipal Crusaders ⚡",
    leaderId: 'demo_user',
    leaderName: 'Demo User',
    members: [
      { id: 'usr_1', name: 'Aarav Patel', email: 'aarav.patel@gmail.com', contact: '+91 98765 43210', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', xp: 650, status: 'Rank #1 City MVP' },
      { id: 'usr_2', name: 'Priya Nair', email: 'priya.nair@gmail.com', contact: '+91 98123 45678', avatar: 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', xp: 480, status: 'Online in Field' },
      { id: 'usr_3', name: 'Rohan Deshmukh', email: 'rohan.deshmukh@gmail.com', contact: '+91 97654 32109', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', xp: 390, status: 'Verified Triage' },
      { id: 'usr_4', name: 'Ananya Iyer', email: 'ananya.iyer@gmail.com', contact: '+91 96543 21098', avatar: 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80', xp: 310, status: 'Active Dispatch' }
    ],
    totalSquadXP: 1830,
    createdAt: new Date().toISOString()
  }
};

export const createSquad = async (leaderId: string, leaderName: string, leaderAvatar?: string): Promise<string> => {
  const newSquad: SquadData = {
    squadName: `${leaderName.split(' ')[0]}'s Civic Squad 👑`,
    leaderId,
    leaderName,
    members: [
      { id: leaderId, name: leaderName, email: 'leader@gmail.com', contact: '+91 99999 88888', avatar: leaderAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', xp: 500, status: 'Squad Leader 👑' }
    ],
    totalSquadXP: 500,
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, 'squads'), newSquad);
    return docRef.id;
  } catch (error) {
    console.warn("Firestore error in createSquad, falling back to local mock:", error);
    const mockId = `squad_${Date.now()}`;
    mockSquads[mockId] = { ...newSquad, id: mockId };
    return mockId;
  }
};

const INDIAN_PEER_AVATARS: Record<string, string> = {
  'Aarav Patel': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'Priya Nair': 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80',
  'Rohan Deshmukh': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Ananya Iyer': 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80'
};

const enrichMembers = (squad: SquadData): SquadData => {
  if (!squad || !squad.members) return squad;
  squad.members = squad.members.map(m => {
    let avatar = m.avatar || INDIAN_PEER_AVATARS[m.name];
    if (avatar?.includes('dicebear.com') || avatar?.includes('1618005182384') || avatar?.includes('1573496359142') || avatar?.includes('1556157382') || avatar?.includes('1580489944761')) {
      avatar = INDIAN_PEER_AVATARS[m.name] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
    }
    return { ...m, avatar };
  });
  return squad;
};

export const getSquadById = async (squadId: string): Promise<SquadData | null> => {
  if (mockSquads[squadId]) {
    return enrichMembers(mockSquads[squadId]);
  }
  try {
    const docRef = doc(db, 'squads', squadId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() } as SquadData;
      mockSquads[squadId] = enrichMembers(data); // cache locally
      return mockSquads[squadId];
    }
  } catch (error) {
    console.warn("Firestore error in getSquadById:", error);
  }
  return null;
};

export const joinSquad = async (squadId: string, newMember: SquadMember): Promise<SquadData | null> => {
  let squad = await getSquadById(squadId);
  if (!squad) return null;

  // Check if member already exists
  if (!squad.members.some(m => m.id === newMember.id || m.name === newMember.name)) {
    squad.members.push(newMember);
    squad.totalSquadXP += (newMember.xp || 500);
    
    // Update local cache
    mockSquads[squadId] = enrichMembers(squad);

    try {
      const docRef = doc(db, 'squads', squadId);
      await updateDoc(docRef, {
        members: squad.members,
        totalSquadXP: squad.totalSquadXP
      });
    } catch (error) {
      console.warn("Firestore update failed in joinSquad, keeping local mock:", error);
    }
  }
  return enrichMembers(squad);
};

export const getUserSquad = async (userId: string, userName: string, _userAvatar?: string): Promise<SquadData> => {
  // Check local mocks first
  for (const s of Object.values(mockSquads)) {
    if (s.members.some(m => m.id === userId || m.name === userName)) {
      return enrichMembers(s);
    }
  }

  try {
    const q = query(collection(db, 'squads'));
    const querySnapshot = await getDocs(q);
    for (const docSnap of querySnapshot.docs) {
      const data = { id: docSnap.id, ...docSnap.data() } as SquadData;
      if (data.members?.some(m => m.id === userId || m.name === userName)) {
        mockSquads[data.id!] = enrichMembers(data);
        return mockSquads[data.id!];
      }
    }
  } catch (error) {
    console.warn("Firestore error in getUserSquad:", error);
  }

  // Return default hackathon demo squad if none found
  return enrichMembers(mockSquads['squad_default_101']);
};
