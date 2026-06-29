import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { triggerPasswordResetEmail } from '../../services/auth';
import { X, Lock, Mail, Phone, User as UserIcon, Camera, KeyRound, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { label: '🇮🇳 Demo (Lead)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: '🇮🇳 Aarav (Scout)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { label: '🇮🇳 Priya (Inspector)', url: 'https://images.unsplash.com/photo-1503283821925-00aedcaae382?w=150&auto=format&fit=crop&q=80' },
  { label: '🇮🇳 Rohan (Dispatch)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { label: '🇮🇳 Ananya (GIS)', url: 'https://images.unsplash.com/photo-1623138599284-b4b305f22bf0?w=150&auto=format&fit=crop&q=80' }
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, updateUserProfileData } = useAuthStore();
  const { themeMode } = useSettingsStore();
  const isGenZ = themeMode === 'genz-light';

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(userProfile?.displayName || user?.displayName || 'Demo User');
      setContactNumber(userProfile?.contactNumber || '+91 98765 43210');
      setPhotoURL(userProfile?.photoURL || user?.photoURL || PRESET_AVATARS[0].url);
      setRecoveryEmail(userProfile?.email || user?.email || 'Demo.sharma@gmail.com');
      setToastMsg(null);
    }
  }, [isOpen, userProfile, user]);

  if (!isOpen) return null;

  const currentEmail = userProfile?.email || user?.email || 'Demo.sharma@gmail.com';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToastMsg({ text: "⚠️ Image too large! Please upload a file under 2MB.", isError: true });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoURL(base64String);
        setToastMsg({ text: "📸 Photo uploaded locally! Click Save Profile Changes to store it." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserProfileData({
      displayName,
      contactNumber,
      photoURL
    });
    setIsSaving(false);
    setToastMsg({ text: "🎉 Profile successfully saved to database!" });
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handlePasswordReset = async () => {
    setIsResetting(true);
    const res = await triggerPasswordResetEmail(recoveryEmail.trim());
    setIsResetting(false);
    setToastMsg({ text: res.message, isError: !res.success });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={cn(
        "relative w-full max-w-lg rounded-2xl p-6 overflow-hidden shadow-2xl transition-all",
        isGenZ 
          ? "bg-[#F8F7F4] border-4 border-[#1E1E1E] shadow-[8px_8px_0px_0px_#1E1E1E] text-[#111111]" 
          : "bg-slate-900 border border-slate-800 text-slate-100 shadow-cyan-500/10"
      )}>
        {/* Toast feedback banner */}
        {toastMsg && (
          <div className={cn(
            "mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top duration-300",
            toastMsg.isError
              ? (isGenZ
                  ? "bg-[#EF4444] text-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]"
                  : "bg-red-500/20 text-red-300 border border-red-500/30")
              : (isGenZ
                  ? "bg-[#10B981] text-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E]"
                  : "bg-green-500/20 text-green-300 border border-green-500/30")
          )}>
            {toastMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="leading-snug">{toastMsg.text}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isGenZ ? "bg-[#F4B400] border-2 border-[#1E1E1E]" : "bg-blue-500/10 text-blue-400"
            )}>
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{isGenZ ? "Profile & Aura Settings ⚡" : "User Account Settings"}</h2>
              <p className="text-xs opacity-70">Manage your municipal identity and credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={cn(
              "p-2 rounded-xl transition-all",
              isGenZ ? "hover:bg-slate-200 border-2 border-transparent hover:border-[#1E1E1E]" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Email (Read-Only) */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold uppercase mb-1 opacity-80">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Registered Email</span>
              <span className="flex items-center gap-1 text-[10px] text-amber-500 font-mono"><Lock className="w-3 h-3" /> READ ONLY</span>
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={currentEmail}
                className={cn(
                  "w-full px-3 py-2.5 rounded-xl text-xs font-mono cursor-not-allowed opacity-60",
                  isGenZ ? "bg-slate-200 border-2 border-[#1E1E1E] text-[#111111]" : "bg-slate-950 border border-slate-800 text-slate-400"
                )}
              />
            </div>
            <p className="text-[10px] opacity-60 mt-1">Email cannot be changed for security and municipal triage verification.</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold uppercase mb-1 opacity-80">Full Name / Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className={cn(
                "w-full px-3 py-2.5 rounded-xl text-xs font-bold outline-none transition-all",
                isGenZ 
                  ? "bg-white border-2 border-[#1E1E1E] focus:shadow-[4px_4px_0px_0px_#3B82F6]" 
                  : "bg-slate-950 border border-slate-800 focus:border-blue-500 text-white"
              )}
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase mb-1 opacity-80">
              <Phone className="w-3.5 h-3.5" /> Contact Number
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className={cn(
                "w-full px-3 py-2.5 rounded-xl text-xs font-mono outline-none transition-all",
                isGenZ 
                  ? "bg-white border-2 border-[#1E1E1E] focus:shadow-[4px_4px_0px_0px_#3B82F6]" 
                  : "bg-slate-950 border border-slate-800 focus:border-blue-500 text-white"
              )}
            />
          </div>

          {/* Profile Photo URL / Preset Gallery / Local Upload */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold uppercase mb-1 opacity-80">
              <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Profile Avatar / Upload Picture</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all",
                  isGenZ
                    ? "bg-[#10B981] text-white border border-[#1E1E1E] shadow-[1px_1px_0px_0px_#1E1E1E] hover:translate-y-[-1px]"
                    : "bg-green-600 hover:bg-green-500 text-white"
                )}
              >
                <Upload className="w-3 h-3" /> Upload Photo 📁
              </button>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3 mb-2">
              <img src={photoURL} alt="Avatar Preview" className="w-12 h-12 rounded-xl border-2 border-[#1E1E1E] bg-white shrink-0 object-cover" />
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="Paste image URL or upload picture above"
                className={cn(
                  "w-full px-3 py-2 rounded-xl text-xs font-mono outline-none",
                  isGenZ ? "bg-white border-2 border-[#1E1E1E]" : "bg-slate-950 border border-slate-800 text-white"
                )}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPhotoURL(preset.url)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                    photoURL === preset.url
                      ? (isGenZ ? "bg-[#F4B400] text-[#111111] border-2 border-[#1E1E1E]" : "bg-blue-600 text-white")
                      : (isGenZ ? "bg-white hover:bg-slate-100 border border-[#1E1E1E]" : "bg-slate-800 hover:bg-slate-700 text-slate-300")
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Password Reset Section */}
          <div className={cn(
            "p-3.5 rounded-xl border flex flex-col gap-2.5 mt-4",
            isGenZ ? "bg-white border-2 border-[#1E1E1E]" : "bg-slate-950/60 border-slate-800"
          )}>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Password Recovery Delivery
              </div>
              <span className="text-[10px] font-mono opacity-60">Real Firebase Mail</span>
            </div>
            <p className="text-[11px] opacity-70 leading-snug">
              Enter your real target email below to receive an official Firebase Auth password reset link:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="Enter personal email address"
                className={cn(
                  "flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none",
                  isGenZ ? "bg-slate-100 border-2 border-[#1E1E1E]" : "bg-slate-900 border border-slate-700 text-white"
                )}
              />
              <button
                type="button"
                disabled={isResetting}
                onClick={handlePasswordReset}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0",
                  isGenZ 
                    ? "bg-[#EF4444] hover:bg-[#DC2626] text-white border-2 border-[#1E1E1E] shadow-[2px_2px_0px_0px_#1E1E1E] hover:translate-y-[-1px]" 
                    : "bg-red-600 hover:bg-red-500 text-white"
                )}
              >
                {isResetting ? "Sending..." : "Send Reset Link 📧"}
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold",
                isGenZ ? "bg-slate-200 border-2 border-[#1E1E1E]" : "bg-slate-800 text-slate-300"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-extrabold transition-all",
                isGenZ 
                  ? "bg-[#3B82F6] hover:bg-[#2563EB] text-white border-2 border-[#1E1E1E] shadow-[3px_3px_0px_0px_#1E1E1E] hover:translate-y-[-2px]" 
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
            >
              {isSaving ? "Saving..." : "Save Profile Changes 💾"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
