import React, { useEffect } from 'react';
import { Users, Share2, Trophy, Shield, Award, CheckCircle2, Sparkles, Mail, Phone } from 'lucide-react';
import { useSquadStore } from '../store/useSquadStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../utils/cn';

export const Squads: React.FC = () => {
  const { activeSquad, loadUserSquad, copyInviteLink, toastMessage } = useSquadStore();
  const { themeMode } = useSettingsStore();
  const { user, userProfile } = useAuthStore();
  const isGenZ = themeMode === 'genz-light';

  useEffect(() => {
    if (!activeSquad) {
      loadUserSquad();
    }
  }, [activeSquad, loadUserSquad]);

  const members = activeSquad?.members && activeSquad.members.length > 0 ? activeSquad.members : [
    { name: 'Aarav Patel', email: 'aarav.patel@gmail.com', contact: '+91 98765 43210', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', status: 'Rank #1 MVP', xp: 650, role: 'Field Scout' },
    { name: 'Priya Nair', email: 'priya.nair@gmail.com', contact: '+91 98123 45678', avatar: 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', status: 'In Field', xp: 480, role: 'Triage Inspector' },
    { name: 'Rohan Deshmukh', email: 'rohan.deshmukh@gmail.com', contact: '+91 97654 32109', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'Triage Lead', xp: 390, role: 'Dispatch Lead' },
    { name: 'Ananya Iyer', email: 'ananya.iyer@gmail.com', contact: '+91 96543 21098', avatar: 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80', status: 'GIS Expert', xp: 310, role: 'Mapping Specialist' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto pb-12">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center gap-3 font-extrabold text-sm shadow-xl animate-in slide-in-from-top duration-300 z-50",
          isGenZ 
            ? "bg-[#10B981] text-white border-2 border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E]" 
            : "bg-green-500/20 text-green-300 border border-green-500/30"
        )}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={cn(
        "p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all",
        isGenZ 
          ? "bg-[#F4B400]/20 border-4 border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E]" 
          : "bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-lg"
      )}>
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5",
              isGenZ ? "bg-[#F4B400] text-[#111111] border-2 border-[#1E1E1E]" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            )}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Municipal Multi-Player Hub</span>
            </span>
            <span className="text-xs font-mono text-slate-400">Region: Bengaluru Metro #1</span>
          </div>
          <h1 className={cn("text-3xl sm:text-4xl font-extrabold tracking-tight", isGenZ ? "text-[#111111]" : "text-slate-100")}>
            {isGenZ ? "Squad Hub & The MVPs 👑⚡" : "Civic Squad & Team Hub"}
          </h1>
          <p className={cn("text-sm sm:text-base leading-relaxed", isGenZ ? "text-[#111111]/80 font-medium" : "text-slate-400")}>
            Collaborate with verified Indian citizen responders, earn combined triage XP, and accelerate municipal infrastructure fixes across your neighborhood.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={copyInviteLink}
            className={cn(
              "px-6 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95",
              isGenZ 
                ? "bg-[#3B82F6] hover:bg-[#2563EB] text-white border-3 border-[#1E1E1E] shadow-[4px_4px_0px_0px_#1E1E1E] hover:translate-y-[-2px]" 
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:shadow-lg"
            )}
          >
            <Share2 className="w-4 h-4" />
            <span>+ Invite Friends 🎁</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className={cn(
          "p-6 rounded-3xl transition-all flex items-center gap-4",
          isGenZ ? "bg-white border-3 border-[#1E1E1E] shadow-[6px_6px_0px_0px_#1E1E1E]" : "bg-slate-900 border border-slate-800"
        )}>
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", isGenZ ? "bg-[#10B981] text-white border-2 border-[#1E1E1E]" : "bg-green-500/10 text-green-400")}>
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Combined Squad XP</div>
            <div className={cn("text-3xl font-extrabold font-mono mt-0.5", isGenZ ? "text-[#111111]" : "text-green-400")}>
              {activeSquad?.totalSquadXP || 1830} XP ⭐
            </div>
            <div className="text-xs text-green-500 font-semibold mt-1">↑ Top 1% in Maharashtra / Karnataka</div>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-3xl transition-all flex items-center gap-4",
          isGenZ ? "bg-white border-3 border-[#1E1E1E] shadow-[6px_6px_0px_0px_#1E1E1E]" : "bg-slate-900 border border-slate-800"
        )}>
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", isGenZ ? "bg-[#F4B400] text-[#111111] border-2 border-[#1E1E1E]" : "bg-amber-500/10 text-amber-400")}>
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">City Leaderboard Rank</div>
            <div className={cn("text-3xl font-extrabold font-mono mt-0.5", isGenZ ? "text-[#111111]" : "text-amber-400")}>
              Rank #1 🏆
            </div>
            <div className="text-xs text-slate-400 mt-1">Active Unit: {activeSquad?.squadName || "Bengaluru Metro"}</div>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-3xl transition-all flex items-center gap-4",
          isGenZ ? "bg-white border-3 border-[#1E1E1E] shadow-[6px_6px_0px_0px_#1E1E1E]" : "bg-slate-900 border border-slate-800"
        )}>
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", isGenZ ? "bg-[#3B82F6] text-white border-2 border-[#1E1E1E]" : "bg-blue-500/10 text-blue-400")}>
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved Reports</div>
            <div className={cn("text-3xl font-extrabold font-mono mt-0.5", isGenZ ? "text-[#111111]" : "text-blue-400")}>
              24 Fixed Ws ✅
            </div>
            <div className="text-xs text-blue-400 mt-1">100% Verification Accuracy</div>
          </div>
        </div>
      </div>

      {/* Squad Members Roster */}
      <div className={cn(
        "rounded-3xl overflow-hidden transition-all",
        isGenZ ? "bg-white border-4 border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E]" : "bg-slate-900 border border-slate-800"
      )}>
        <div className={cn("p-6 border-b flex items-center justify-between", isGenZ ? "border-[#1E1E1E] bg-[#F8F7F4]" : "border-slate-800 bg-slate-950/50")}>
          <div className="flex items-center gap-3">
            <Users className={cn("w-6 h-6", isGenZ ? "text-[#3B82F6]" : "text-blue-400")} />
            <div>
              <h2 className={cn("text-xl font-extrabold tracking-tight", isGenZ ? "text-[#111111]" : "text-slate-100")}>
                Active Roster & Peers ({members.length + 1})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status and municipal dispatch credentials</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>All Channels Live</span>
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Logged-in User Card */}
          <div className={cn(
            "p-4 rounded-2xl flex items-start justify-between gap-4 transition-all relative overflow-hidden",
            isGenZ ? "bg-[#F8F7F4] border-2 border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E]" : "bg-slate-950 border border-slate-800"
          )}>
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              {userProfile?.photoURL || user?.photoURL ? (
                <img src={userProfile?.photoURL || user?.photoURL!} alt="You" className="w-12 h-12 rounded-2xl border-2 border-[#1E1E1E] object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#F4B400] text-[#111111] font-extrabold text-lg flex items-center justify-center shrink-0 border-2 border-[#1E1E1E]">
                  {(userProfile?.displayName || user?.displayName || 'A').charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("font-extrabold text-base truncate", isGenZ ? "text-[#111111]" : "text-slate-100")}>
                    {userProfile?.displayName || user?.displayName || 'Demo User'}
                  </span>
                  <span className="text-[10px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-md shrink-0">YOU (Leader)</span>
                </div>
                <div className="text-xs text-[#3B82F6] font-bold mt-0.5">🎖️ Municipal Commander</div>
                
                <div className="mt-2.5 space-y-1 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{userProfile?.email || user?.email || 'Demo.sharma@gmail.com'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{(userProfile as any)?.contact || '+91 98765 43210'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-extrabold font-mono text-[#10B981]">1,250 XP</span>
              <div className="flex items-center justify-end gap-1 text-[10px] text-green-400 font-bold mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
              </div>
            </div>
          </div>

          {/* Peer Members */}
          {members.map((member: any, index: number) => (
            <div key={index} className={cn(
              "p-4 rounded-2xl flex items-start justify-between gap-4 transition-all",
              isGenZ ? "bg-white border-2 border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] hover:translate-y-[-2px]" : "bg-slate-950 border border-slate-800 hover:border-slate-700"
            )}>
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {(member.avatar || ({'Aarav Patel': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Priya Nair': 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', 'Rohan Deshmukh': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Ananya Iyer': 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80'} as Record<string, string>)[member.name]) ? (
                  <img src={member.avatar || ({'Aarav Patel': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Priya Nair': 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80', 'Rohan Deshmukh': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Ananya Iyer': 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80'} as Record<string, string>)[member.name]} alt={member.name} className="w-12 h-12 rounded-2xl border-2 border-[#1E1E1E] object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#3B82F6] text-white font-extrabold text-lg flex items-center justify-center shrink-0 border-2 border-[#1E1E1E]">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-extrabold text-base truncate", isGenZ ? "text-[#111111]" : "text-slate-100")}>
                      {member.name}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-md shrink-0 border border-slate-700">Peer</span>
                  </div>
                  <div className="text-xs text-amber-500 font-bold mt-0.5">⚡ {member.role || member.status || 'Active Citizen'}</div>
                  
                  <div className="mt-2.5 space-y-1 text-xs text-slate-400 font-mono">
                    {member.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.contact && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{member.contact}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold font-mono text-[#10B981]">{member.xp || 300} XP</span>
                <div className="flex items-center justify-end gap-1 text-[10px] text-green-400 font-bold mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Active
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
