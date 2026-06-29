import { create } from 'zustand';
import { getUserSquad, joinSquad, createSquad, type SquadData, type SquadMember } from '../services/squads';
import { useAuthStore } from './useAuthStore';

interface SquadState {
  activeSquad: SquadData | null;
  isLoading: boolean;
  inviteUrl: string;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  loadUserSquad: () => Promise<void>;
  acceptInvite: (squadId: string) => Promise<boolean>;
  copyInviteLink: () => void;
}

export const useSquadStore = create<SquadState>((set, get) => ({
  activeSquad: null,
  isLoading: false,
  inviteUrl: '',
  toastMessage: null,
  setToastMessage: (msg) => set({ toastMessage: msg }),

  loadUserSquad: async () => {
    set({ isLoading: true });
    const user = useAuthStore.getState().user;
    const uid = user?.uid || 'demo_user';
    const name = user?.displayName || 'Demo';
    const avatar = user?.photoURL || undefined;

    try {
      let squad = await getUserSquad(uid, name, avatar);
      if (!squad) {
        const newId = await createSquad(uid, name, avatar);
        squad = {
          id: newId,
          squadName: `${name.split(' ')[0]}'s Civic Squad 👑`,
          leaderId: uid,
          leaderName: name,
          members: [{ id: uid, name, avatar, xp: 500, status: 'Squad Leader 👑' }],
          totalSquadXP: 500
        };
      }
      
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const inviteUrl = `${origin}/join?squadId=${squad.id}&inviter=${encodeURIComponent(name)}`;

      set({ activeSquad: squad, inviteUrl, isLoading: false });
    } catch (error) {
      console.error("Error loading squad:", error);
      set({ isLoading: false });
    }
  },

  acceptInvite: async (squadId: string) => {
    set({ isLoading: true });
    const user = useAuthStore.getState().user;
    const uid = user?.uid || `peer_${Date.now()}`;
    const name = user?.displayName || `Peer Citizen #${Math.floor(Math.random() * 900 + 100)}`;
    const avatar = user?.photoURL || undefined;

    const newPeer: SquadMember = {
      id: uid,
      name,
      avatar,
      xp: 500, // +500 Bonus XP reward
      status: 'Online 🚀'
    };

    try {
      const updatedSquad = await joinSquad(squadId, newPeer);
      if (updatedSquad) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        const inviteUrl = `${origin}/join?squadId=${updatedSquad.id}&inviter=${encodeURIComponent(updatedSquad.leaderName)}`;
        set({ activeSquad: updatedSquad, inviteUrl, isLoading: false, toastMessage: `🎉 Successfully joined ${updatedSquad.squadName}! +500 Bonus XP Awarded!` });
        return true;
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
    set({ isLoading: false, toastMessage: "❌ Failed to join squad. Please try again." });
    return false;
  },

  copyInviteLink: () => {
    const { inviteUrl, activeSquad } = get();
    let urlToCopy = inviteUrl;
    if (!urlToCopy) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const name = useAuthStore.getState().user?.displayName || 'Demo';
      urlToCopy = `${origin}/join?squadId=${activeSquad?.id || 'squad_default_101'}&inviter=${encodeURIComponent(name)}`;
    }
    
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
      set({ toastMessage: "🎁 Real Squad Invite Link Copied to Clipboard! Share with friends to build your team." });
      setTimeout(() => set({ toastMessage: null }), 4000);
    }
  }
}));
