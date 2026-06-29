import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, Shield, CheckCircle2, ArrowRight, Zap, Trophy, MapPin } from 'lucide-react';
import { useSettingsStore, type ThemeMode } from '../../store/useSettingsStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

const THEMES = [
  {
    id: 'genz-light' as ThemeMode,
    name: 'Antigravity Aura ✨',
    tagline: 'Vibrant Glassmorphism & Neon Levitation',
    desc: 'Ethereal glowing shadows, floating UI cards, and dynamic gradient accents designed for maximum modern wow-factor.',
    gradient: 'from-emerald-400 via-teal-300 to-indigo-400',
    previewBg: 'bg-gradient-to-br from-slate-900 via-[#0d1527] to-slate-900 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    cardBg: 'bg-white/5 backdrop-blur-md border border-white/10 text-white',
    accentColor: 'text-emerald-400',
    badgeVariant: 'warning' as const
  },
  {
    id: 'gis-dark' as ThemeMode,
    name: 'GIS Slate Dark 🌙',
    tagline: 'Tactical Municipal Operations',
    desc: 'Deep slate backgrounds optimized for long command-center triage sessions and GIS telemetry analysis.',
    gradient: 'from-blue-500 to-slate-400',
    previewBg: 'bg-slate-950 border-slate-800',
    cardBg: 'bg-slate-900 border border-slate-800 text-slate-100',
    accentColor: 'text-blue-400',
    badgeVariant: 'secondary' as const
  },
  {
    id: 'amoled' as ThemeMode,
    name: 'AMOLED Black 🖤',
    tagline: 'Pitch Black High Contrast',
    desc: 'True zero-light black background. Maximum battery saving for field officers inspecting hazards at night.',
    gradient: 'from-purple-500 to-pink-500',
    previewBg: 'bg-black border-slate-900',
    cardBg: 'bg-[#0a0a0a] border border-slate-800 text-white',
    accentColor: 'text-purple-400',
    badgeVariant: 'default' as const
  },
  {
    id: 'light' as ThemeMode,
    name: 'Solar Light ☀️',
    tagline: 'High Visibility Daytime Mode',
    desc: 'Clean, crisp white interface built for direct sunlight viewing during outdoor civic surveys.',
    gradient: 'from-amber-400 to-orange-500',
    previewBg: 'bg-slate-100 border-slate-300 text-slate-900',
    cardBg: 'bg-white border border-slate-200 text-slate-900 shadow-sm',
    accentColor: 'text-amber-600',
    badgeVariant: 'outline' as const
  }
];

export const ThemeOnboardingModal: React.FC = () => {
  const { themeMode, setThemeMode } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode || 'genz-light');
  const [demoCount, setDemoCount] = useState(42);

  useEffect(() => {
    const onboarded = localStorage.getItem('civicpulse_theme_onboarded');
    if (!onboarded) {
      setIsOpen(true);
      setSelectedTheme('genz-light');
      setThemeMode('genz-light');
    }

    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-theme-onboarding', handleOpen);
    return () => window.removeEventListener('open-theme-onboarding', handleOpen);
  }, [setThemeMode]);

  const handleSelectTheme = (mode: ThemeMode) => {
    setSelectedTheme(mode);
    setThemeMode(mode);
  };

  const handleConfirm = () => {
    localStorage.setItem('civicpulse_theme_onboarded', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentThemeInfo = THEMES.find(t => t.id === selectedTheme) || THEMES[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col text-slate-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-bold text-green-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to SunoSarkar AI
              </div>
              <h2 className="text-2xl font-bold font-heading text-white">Choose Your Visual Reference Theme</h2>
              <p className="text-xs text-slate-400 mt-1">Select an interface style below to instantly preview live interactive widget behavior.</p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
            {/* Theme Selector List (Left 5 cols) */}
            <div className="md:col-span-5 space-y-3 flex flex-col justify-center">
              <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">Available Interface Themes</span>
              {THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col gap-1 group",
                      isSelected
                        ? "bg-slate-800/90 border-green-500/60 shadow-lg shadow-green-500/10 scale-[1.02]"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
                    )}
                    <div className="flex items-center justify-between">
                      <span className={cn("font-bold text-sm", isSelected ? "text-white" : "text-slate-300")}>
                        {theme.name}
                      </span>
                      {theme.id === 'genz-light' && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono line-clamp-1">{theme.tagline}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Demo Preview Box (Right 7 cols) */}
            <div className="md:col-span-7 flex flex-col">
              <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center justify-between">
                <span>Interactive Theme Demo Preview</span>
                <span className="text-green-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span> Live rendering
                </span>
              </span>

              <div className={cn("flex-1 rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden min-h-[260px]", currentThemeInfo.previewBg)}>
                {/* Background glowing orb if Antigravity */}
                {selectedTheme === 'genz-light' && (
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
                )}

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center font-bold text-sm text-green-400">
                        ⚡
                      </div>
                      <div>
                        <h4 className={cn("font-bold text-sm", selectedTheme === 'light' ? 'text-slate-900' : 'text-white')}>
                          Hazard #CP-8924
                        </h4>
                        <span className="text-[10px] font-mono opacity-70">Sector 4 • Mumbai Highway</span>
                      </div>
                    </div>
                    <Badge variant={currentThemeInfo.badgeVariant} size="sm">Priority 94/100</Badge>
                  </div>

                  {/* Simulated Issue Preview Card */}
                  <div className={cn("p-3.5 rounded-lg transition-all space-y-2", currentThemeInfo.cardBg)}>
                    <div className="flex justify-between items-center font-semibold text-xs">
                      <span>🕳️ Deep Crater Pothole</span>
                      <span className={cn("font-mono font-bold", currentThemeInfo.accentColor)}>Active Triage</span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">
                      "Massive suspension-breaking crater reported on main overpass. Immediate municipal dispatch required."
                    </p>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span>Upvotes: <strong className="font-bold">{demoCount}</strong></span>
                      <button 
                        onClick={() => setDemoCount(c => c + 1)}
                        className="px-2 py-1 rounded bg-green-500 text-slate-950 font-bold hover:scale-105 active:scale-95 transition-transform flex items-center gap-1"
                      >
                        👍 Upvote Preview
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] font-mono opacity-70 relative z-10 flex items-center justify-between">
                  <span>Theme: {currentThemeInfo.name}</span>
                  <span>⚡ Instant Switch Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400 hidden sm:block">
              💡 You can always switch themes later anytime from the top navigation bar.
            </p>
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto px-8 py-2.5 font-extrabold text-sm shadow-xl shadow-green-500/20"
            >
              <span>Confirm & Enter SunoSarkar 🚀</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
