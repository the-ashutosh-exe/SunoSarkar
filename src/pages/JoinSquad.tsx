import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSquadStore } from '../store/useSquadStore';
import { useAuthStore } from '../store/useAuthStore';
import { getSquadById, type SquadData } from '../services/squads';

export const JoinSquad: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const squadId = searchParams.get('squadId') || 'squad_default_101';
  const inviter = searchParams.get('inviter') || 'Demo';

  const { acceptInvite, isLoading } = useSquadStore();
  const { user, loginAsDemoJudge } = useAuthStore();
  const [squadInfo, setSquadInfo] = useState<SquadData | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    getSquadById(squadId).then(data => {
      if (data) setSquadInfo(data);
    });
  }, [squadId]);

  const handleJoin = async () => {
    if (!user) {
      loginAsDemoJudge(); // Ensure auth before joining
    }
    const success = await acceptInvite(squadId);
    if (success) {
      setJoined(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111111] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gamified Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#F4B400]/20 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#3B82F6]/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white border-4 border-[#1E1E1E] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1E1E] text-center relative z-10 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#F4B400] border-3 border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] flex items-center justify-center mx-auto mb-6 text-3xl">
          🎁
        </div>

        <span className="inline-block px-3 py-1 bg-[#3B82F6] text-white font-extrabold text-xs uppercase tracking-wider rounded-full border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] mb-3">
          SQUAD INVITE RECEIVED
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Join <span className="text-[#3B82F6]">{inviter}'s</span> Civic Squad! 👑
        </h1>

        <p className="text-sm font-semibold text-slate-600 mb-6 leading-relaxed">
          You’ve been invited to join peer forces on <span className="font-extrabold text-[#111111]">{squadInfo?.squadName || "Bengaluru Municipal Crusaders ⚡"}</span>. Report hazards, complete missions, and climb the city leaderboard together!
        </p>

        {/* Squad Preview Box */}
        <div className="bg-[#F8F7F4] p-4 rounded-2xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#3B82F6]" /> Active Peer Members</span>
            <span className="bg-[#F4B400] px-2 py-0.5 rounded-full border border-[#1E1E1E]">{squadInfo?.members?.length || 4} Members</span>
          </div>
          <div className="flex -space-x-2 overflow-hidden py-1">
            {(squadInfo?.members || [
              {name: 'Aarav Patel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'},
              {name: 'Priya Nair', avatar: 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80'},
              {name: 'Rohan Deshmukh', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'},
              {name: 'Ananya Iyer', avatar: 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80'}
            ]).map((m, i) => {
              const avatar = m.avatar || ({'Aarav Patel': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Priya Nair': 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', 'Rohan Deshmukh': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Ananya Iyer': 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80'} as Record<string, string>)[m.name];
              return avatar ? (
                <img key={i} src={avatar} alt={m.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#1E1E1E] object-cover" title={m.name} />
              ) : (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#1E1E1E] bg-[#3B82F6] text-white text-xs font-extrabold flex items-center justify-center" title={m.name}>
                  {m.name.charAt(0)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reward Banner */}
        <div className="bg-[#10B981]/15 border-2 border-[#1E1E1E] rounded-xl p-3 mb-6 flex items-center justify-center gap-2 text-xs font-extrabold text-[#111111]">
          <Trophy className="w-4 h-4 text-[#10B981]" />
          <span>Instant Peer Bonus: +500 XP upon joining! ⭐</span>
        </div>

        {joined ? (
          <div className="w-full py-4 bg-[#10B981] text-white font-extrabold rounded-2xl border-3 border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] flex items-center justify-center gap-2 text-base animate-bounce">
            <CheckCircle2 className="w-6 h-6" />
            <span>Squad Joined! Launching Hub...</span>
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={isLoading}
            className="w-full py-4 bg-[#F4B400] hover:bg-[#EAB308] text-[#111111] font-extrabold rounded-2xl border-3 border-[#1E1E1E] shadow-[5px_5px_0px_0px_#1E1E1E] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1E1E1E] transition-all flex items-center justify-center gap-2 text-base"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isLoading ? "Joining Squad..." : "Accept Invite & Join Squad 🚀"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
