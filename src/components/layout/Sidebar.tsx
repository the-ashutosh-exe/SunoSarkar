import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPinned, PlusCircle, X, LogOut, User as UserIcon, Users } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSquadStore } from '../../store/useSquadStore';
import { ProfileModal } from '../profile/ProfileModal';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, setIsOpen }) => {
  const { user, userProfile, logout } = useAuthStore();
  const { themeMode } = useSettingsStore();
  const { activeSquad, loadUserSquad } = useSquadStore();
  const isGenZ = themeMode === 'genz-light';
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  useEffect(() => {
    if (isGenZ && !activeSquad) {
      loadUserSquad();
    }
  }, [isGenZ, activeSquad, loadUserSquad]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: isGenZ ? "The Hub ⚡" : "Command Center", path: "/dashboard" },
    { icon: MapPinned, label: isGenZ ? "Street Radar 🗺️" : "Live Interactive Map", path: "/map" },
    { icon: PlusCircle, label: isGenZ ? "Spill the Tea 🫖" : "Report New Issue", path: "/report" },
    { icon: Users, label: isGenZ ? "Squad Hub 👥" : "Team & Squads", path: "/squads" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* Sidebar container */}
      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 md:static md:translate-x-0 flex flex-col shrink-0",
          isGenZ ? "bg-white border-r-2 border-[#1E1E1E]" : "border-r border-slate-800 bg-slate-900",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {isGenZ ? (
          /* Gamified SaaS Top Profile & Statistics Card */
          <div className="p-4 border-b-2 border-[#1E1E1E] bg-[#F4B400]/15 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => { navigate('/dashboard'); setIsOpen?.(false); }} 
                className="flex items-center gap-3 text-[#111111] font-extrabold text-2xl tracking-tight hover:opacity-80 transition-opacity p-0 m-0 border-0 relative"
              >
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full blur-xs opacity-95 -z-10 shadow-sm"></div>
                <img src="/logo.png" alt="SunoSarkar Logo" className="h-14 w-auto max-w-[65px] object-contain p-0 m-0 border-0 shrink-0 drop-shadow-md brightness-[1.35]" />
                <span>SunoSarkar</span>
              </button>
              <button className="md:hidden p-1 text-[#111111]" onClick={() => setIsOpen?.(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-y-[-1px] transition-all text-left w-full"
              title="Click to edit profile"
            >
              {(userProfile?.photoURL || user?.photoURL) ? (
                <img src={userProfile?.photoURL || user?.photoURL!} alt="Profile" className="w-10 h-10 rounded-full border-2 border-[#1E1E1E] object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#F4B400] text-[#111111] flex items-center justify-center font-extrabold text-base shrink-0 border-2 border-[#1E1E1E]">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-extrabold text-[#111111] truncate">{userProfile?.displayName || user?.displayName || 'Demo'}</div>
                <div className="text-xs font-bold text-[#3B82F6] truncate">👑 Level 5 Scout</div>
              </div>
            </button>
            <div className="bg-white p-2 rounded-xl border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#111111]">⭐ XP Badge</span>
              <span className="text-xs font-extrabold bg-[#F4B400] px-2 py-0.5 rounded-full border border-[#1E1E1E] text-[#111111]">1,250 XP</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
            <button 
              onClick={() => { navigate('/dashboard'); setIsOpen?.(false); }} 
              className="flex items-center gap-3 text-green-500 font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity p-0 m-0 border-0 relative"
            >
              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full blur-md opacity-95 -z-10 shadow-[0_0_20px_#ffffff]"></div>
              <img src="/logo.png" alt="SunoSarkar Logo" className="h-14 w-auto max-w-[65px] object-contain p-0 m-0 border-0 shrink-0 drop-shadow-md brightness-[1.35]" />
              <span>SunoSarkar AI</span>
            </button>
            <button className="md:hidden p-2 text-slate-400 hover:text-slate-100" onClick={() => setIsOpen?.(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-3">
          <div className={cn("px-3 text-xs font-mono font-semibold uppercase tracking-wider mb-1", isGenZ ? "text-[#111111] font-extrabold" : "text-slate-500")}>
            {isGenZ ? "Navigation 🗺️" : "Municipal Views"}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen?.(false)}
              className={({ isActive }) =>
                isGenZ ? cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-sm font-extrabold border-2 border-[#1E1E1E]",
                  isActive 
                    ? "bg-[#F4B400] text-[#111111] shadow-[4px_4px_0px_0px_#1E1E1E] translate-x-1" 
                    : "bg-white text-[#111111] hover:bg-[#F8F7F4] shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-x-1"
                ) : cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium",
                  isActive 
                    ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
          
          {/* Departments & Triage Section (Clean UI) */}
          <div className="mt-6 px-3 text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Departments & Triage
          </div>
          <div className="space-y-1">
            {['Roads & Traffic (PWD)', 'Solid Waste (SWM)', 'Power Grid (DISCOM)', 'Water (Jal Board)'].map((dept, idx) => {
              const colors = ['bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-emerald-500'];
              return (
                <div key={dept} title={dept} className="flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800/50 transition-colors cursor-default gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", colors[idx % colors.length])}></div>
                    <span className="truncate">{dept}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">Active</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={cn("p-4 shrink-0 space-y-3", isGenZ ? "border-t-2 border-[#1E1E1E] bg-[#F8F7F4]" : "border-t border-slate-800 bg-slate-950/40")}>
          {!isGenZ && (
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800/80 p-2.5 rounded-lg border border-slate-800 w-full text-left transition-all cursor-pointer"
              title="Click to edit profile"
            >
              {(userProfile?.photoURL || user?.photoURL) ? (
                <img src={userProfile?.photoURL || user?.photoURL!} alt="Profile" className="w-8 h-8 rounded-full border border-green-500/30 object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-green-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-700">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-medium text-slate-200 truncate">{userProfile?.displayName || user?.displayName || 'VIP Dispatcher'}</div>
                <div className="text-xs text-green-400 font-mono truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online Auth • Edit
                </div>
              </div>
            </button>
          )}
          <button
            onClick={handleLogout}
            className={isGenZ 
              ? "w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-extrabold text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-xl border-2 border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] transition-all" 
              : "w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-md transition-colors border border-transparent hover:border-red-500/20"}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Session
          </button>
        </div>
      </aside>
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
};
