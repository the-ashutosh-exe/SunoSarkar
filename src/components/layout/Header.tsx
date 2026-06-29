import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, Settings, CheckCircle2, AlertTriangle, Trophy, X, Sliders, User, Moon, Sparkles, MapPin } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { cn } from '../../utils/cn';
import { ProfileModal } from '../profile/ProfileModal';
import { useToast } from '../ui/Toast';

interface HeaderProps {
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'alert' | 'success' | 'rank';
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuthStore();
  const { 
    themeMode, setThemeMode, 
    aiSensitivity, setAiSensitivity, 
    gpsTracking, setGpsTracking, 
    dispatchAlerts, setDispatchAlerts 
  } = useSettingsStore();

  const isGenZ = themeMode === 'genz-light';
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: '🚨 Critical Hazard Reported',
      desc: 'High severity water main break reported nearby. AI Triage score: 88/100.',
      time: '2 mins ago',
      read: false,
      type: 'alert'
    },
    {
      id: '2',
      title: '🌟 Citizen Impact Rank Up!',
      desc: 'You earned +15 Citizen Points for submitting verified visual telemetry.',
      time: '1 hour ago',
      read: false,
      type: 'rank'
    },
    {
      id: '3',
      title: '✔ Ticket Dispatched & Verified',
      desc: 'Roads & Traffic (PWD) accepted ticket #9402 for immediate dispatch.',
      time: '3 hours ago',
      read: true,
      type: 'success'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/map');
    }
  };

  return (
    <>
      <header className={cn(
        "h-16 border-b flex items-center justify-between px-4 shrink-0 z-30 relative font-sans transition-colors",
        isGenZ ? "bg-[#F8F7F4] border-[#1E1E1E] border-b-2" : "border-slate-800 bg-slate-900"
      )}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className={cn("md:hidden p-2 -ml-2 rounded-md", isGenZ ? "text-[#111111] hover:bg-[#F4B400]/20" : "text-slate-400 hover:text-slate-100")}
          >
            <Menu className="h-5 w-5" />
          </button>
          {isGenZ ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-all text-left"
                title="Click to edit profile"
              >
                {userProfile?.photoURL && (
                  <img src={userProfile.photoURL} alt="Avatar" className="w-8 h-8 rounded-xl border-2 border-[#1E1E1E] object-cover shrink-0" />
                )}
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#111111] underline decoration-wavy decoration-[#F4B400] underline-offset-4">
                  What's Up, {(userProfile?.displayName || user?.displayName || "Demo").split(' ')[0]}! 👋
                </h2>
              </button>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold bg-[#F4B400] text-[#111111] px-2.5 py-1 rounded-full border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]">
                🔥 5 Day Streak
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-xs font-extrabold bg-[#3B82F6] text-white px-2.5 py-1 rounded-full border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]">
                🪙 450 Coins
              </span>
            </div>
          ) : (
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 focus-within:border-green-500/50 transition-colors">
              <Search className="h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search tickets by ID, address..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-64 font-sans"
              />
            </form>
          )}
        </div>
        
        <div className="flex items-center gap-4 relative">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="hidden sm:inline">System Status:</span>
            <Badge variant="success" size="sm">Online</Badge>
          </div>
          
          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
          
          {/* Notification Bell Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className={cn(
                "relative p-2 rounded-md transition-colors",
                showNotifications ? "bg-slate-800 text-green-400" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
                <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-green-400" />
                    <span className="font-bold text-sm">Live Dispatch Feed</span>
                    {unreadCount > 0 && (
                      <Badge variant="warning" size="sm">{unreadCount} new</Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-green-400 hover:underline font-mono"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                        navigate('/dashboard');
                        setShowNotifications(false);
                      }}
                      className={cn(
                        "p-3.5 hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3",
                        !n.read ? "bg-green-500/5" : ""
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {n.type === 'rank' && <Trophy className="w-4 h-4 text-purple-400" />}
                        {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={cn("text-xs font-bold truncate", !n.read ? "text-slate-100" : "text-slate-300")}>{n.title}</span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{n.desc}</p>
                      </div>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/dashboard');
                    }}
                    className="text-xs font-bold text-slate-300 hover:text-green-400 transition-colors"
                  >
                    View All Command Activity →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Button */}
          <button
            onClick={() => {
              setShowProfileModal(true);
              setShowNotifications(false);
              setShowSettings(false);
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all",
              isGenZ
                ? "bg-[#F4B400] text-[#111111] border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-y-[-1px]"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            )}
            title="Edit User Profile"
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* Settings Button */}
          <button 
            onClick={() => {
              setShowSettings(true);
              setShowNotifications(false);
              setShowProfileModal(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors" 
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Settings Modal Drawer */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-green-400" />
                <h3 className="font-bold text-base">SunoSarkar Command Settings</h3>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Account Section */}
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-green-500" /> Active Citizen Profile
                </span>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-200">{user?.displayName || 'Demo User'}</div>
                    <div className="text-xs font-mono text-slate-500">{user?.email || 'Demo.sharma@gmail.com'}</div>
                  </div>
                  <Badge variant="success" size="sm">Level 4: Pothole Vigilante 🕵️‍♂️</Badge>
                </div>
              </div>

              {/* AI Triage Configuration */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gemini AI Triage Sensitivity
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'strict', label: 'Strict (7+)' },
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'verbose', label: 'Verbose' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setAiSensitivity(m.id as any)}
                      className={cn(
                        "py-2 px-2 rounded-lg border text-xs font-semibold transition-all",
                        aiSensitivity === m.id 
                          ? "bg-green-500/10 border-green-500/40 text-green-400 font-bold" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                  {aiSensitivity === 'strict' && "🛡️ Strict: Only flags catastrophic hazards like craters & fireballs. Small potholes get told to walk it off."}
                  {aiSensitivity === 'balanced' && "⚖️ Balanced: Goldilocks triage. Perfect blend of citizen sanity and municipal budget protection."}
                  {aiSensitivity === 'verbose' && "🔍 Verbose (Karen Mode): Flags microscopic sidewalk cracks, crooked leaves, and suspicious pigeons."}
                </p>
              </div>

              {/* Telemetry & Notifications */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Telemetry & Alerting
                </span>
                
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Live GPS Tracking</div>
                    <div className="text-xs text-slate-500">Auto-lock coordinates when capturing reports</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={gpsTracking} 
                    onChange={(e) => setGpsTracking(e.target.checked)}
                    className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Dispatch Push Alerts</div>
                    <div className="text-xs text-slate-500">Notify when nearby municipal tickets change status</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={dispatchAlerts} 
                    onChange={(e) => setDispatchAlerts(e.target.checked)}
                    className="w-4 h-4 accent-green-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* System Theme */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-purple-400" /> GIS Display Theme
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gis-dark', label: 'GIS Slate Dark' },
                    { id: 'amoled', label: 'AMOLED Black' },
                    { id: 'light', label: 'Solar Light ☀️' },
                    { id: 'genz-light', label: 'Antigravity Aura ✨' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setThemeMode(t.id as any)}
                      className={cn(
                        "py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all truncate",
                        themeMode === t.id 
                          ? "bg-green-500/10 border-green-500/40 text-green-400 font-bold shadow-sm" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed pt-1">
                  {themeMode === 'gis-dark' && "🌙 Tactical dark mode for late-night municipal crusaders."}
                  {themeMode === 'amoled' && "🖤 Pitch black OLED saver. Hunts potholes at 3 AM with zero battery drain."}
                  {themeMode === 'light' && "☀️ Blindingly bright daytime mode. Wear sunglasses before inspecting."}
                  {themeMode === 'genz-light' && "✨ Ethereal Antigravity & Aura Mesh gradient. Glassmorphism floating cards, vibrant atmospheric shadows, and continuous CSS levitation animation. Pure GenZ slayed no cap fr fr 💅🔥."}
                </p>
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    window.dispatchEvent(new Event('open-theme-onboarding'));
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive Theme Demo Reference</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowSettings(false)}
              >
                Close
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  toast("Preferences saved! Your Theme & AI Triage mode are now live across all nodes.", "success");
                  setShowSettings(false);
                }}
                className="font-bold px-5"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
