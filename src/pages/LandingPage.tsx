import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { Zap, Shield, Brain, CloudRain, PenTool, Sparkles, Lock, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login, loginAsDemoJudge } = useAuthStore();
  
  const handleDemoLogin = () => {
    localStorage.removeItem('civicpulse_theme_onboarded');
    window.dispatchEvent(new Event('open-theme-onboarding'));
    loginAsDemoJudge();
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-text font-body relative overflow-x-hidden selection:bg-cta selection:text-black">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-cta/15 blur-[140px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] bg-emerald-500/10 blur-[160px] rounded-full pointer-events-none"></div>

      {/* Modern Glassmorphism Top Navbar */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-xl">
        <div className="flex items-center gap-3 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-12 sm:w-16 h-12 sm:h-16 bg-white rounded-full blur-md opacity-95 -z-10 shadow-[0_0_25px_#ffffff]"></div>
          <img src="/logo.png" alt="SunoSarkar Logo" className="h-16 sm:h-20 w-auto max-w-[85px] object-contain p-0 m-0 border-0 shrink-0 drop-shadow-md brightness-[1.35]" />
          <span className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">SunoSarkar<span className="text-cta">.AI</span></span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-cta/10 text-cta border border-cta/30">
            <Sparkles className="w-3 h-3" /> Flagship Edition
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={handleDemoLogin}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cta to-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-cta/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <span>Municipal Dispatch Demo Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={login}
            className="px-4 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 text-white font-semibold text-sm transition-all hidden md:flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Lock className="w-3.5 h-3.5 text-white/70" />
            <span>Citizen Google Sign-In</span>
          </button>
        </div>
      </nav>

      {/* Live System Ticker Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-black to-emerald-950/40 border-b border-white/5 py-2.5 px-4 text-center text-xs text-text/80 font-mono flex items-center justify-center gap-6 overflow-x-auto">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live WMO Storm Radar Active</span>
        <span className="text-white/20">•</span>
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> 50m Spatial Clustering Shield Online</span>
        <span className="text-white/20">•</span>
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cta" /> Gemini AI Vision Grounding Active</span>
      </div>

      {/* Main Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center relative z-10"
      >
        <div className="flex justify-center mb-8 relative">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-95 -z-10 shadow-[0_0_50px_#ffffff]"></div>
            <div className="absolute inset-2 bg-white rounded-full -z-10 shadow-[0_0_30px_#ffffff]"></div>
            <img src="/logo.png" alt="SunoSarkar Flagship Emblem" className="h-32 sm:h-40 w-auto max-w-[180px] object-contain p-0 m-0 border-0 drop-shadow-xl brightness-[1.35]" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-300 mb-8 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Empowering Smart Indian Cities • Zero Triage Bottlenecks
        </div>

        <h1 className="text-5xl sm:text-7xl font-heading font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
          The Autonomous OS for <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cta via-emerald-400 to-teal-200">
            Hyper-Local Civic Action.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-text/80 max-w-3xl mx-auto mb-12 font-body leading-relaxed">
          While ordinary apps merely transcribe photos to text, SunoSarkar AI solves the human problems: <span className="text-white font-extrabold underline decoration-cta decoration-2 underline-offset-4">The Municipal Noise Bottleneck</span> and <span className="text-white font-extrabold underline decoration-cta decoration-2 underline-offset-4">The Citizen Black Hole</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
          <button
            onClick={handleDemoLogin}
            className="w-full sm:w-auto px-8 py-4 bg-cta hover:bg-emerald-400 text-black font-extrabold rounded-xl text-lg shadow-xl shadow-cta/25 hover:shadow-cta/40 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3 whitespace-nowrap shrink-0"
          >
            <Zap className="w-5 h-5 fill-black" />
            <span>Launch VIP Dispatch Dashboard</span>
            <span className="text-sm bg-black/10 px-2 py-0.5 rounded whitespace-nowrap">Instant Access</span>
          </button>
          <button
            onClick={login}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-lg border border-white/15 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <Lock className="w-5 h-5 text-white/70" />
            <span>Citizen Google Auth</span>
          </button>
        </div>

        {/* Flagship 4 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {[
            {
              icon: <Brain className="w-6 h-6 text-cta" />,
              color: "cta",
              title: "Human-in-the-Loop Vision Grounding",
              desc: (<span>Standard camera reports often miss crucial context. Our Sensory Context Box captures ground-level citizen observations (<span className="text-emerald-300 italic font-medium">"Smells like gas"</span>, <span className="text-emerald-300 italic font-medium">"Hidden underwater"</span>) alongside photos, giving municipal responders a complete tactical picture.</span>)
            },
            {
              icon: <Shield className="w-6 h-6 text-emerald-400" />,
              color: "emerald-400",
              title: "50m Spatial Clustering Shield",
              desc: "Prevents triage overload during major incidents. Our spatial clustering algorithm groups duplicate reports within a 50-meter radius into single high-priority tickets while rewarding verifying citizens."
            },
            {
              icon: <CloudRain className="w-6 h-6 text-teal-400" />,
              color: "teal-400",
              title: "Live Weather Urgency Multiplier",
              desc: "Context changes everything. A fallen power line on a calm day is routine, but during a severe thunderstorm it becomes critical. Our platform cross-references live meteorological radar to dynamically adjust triage priorities."
            },
            {
              icon: <PenTool className="w-6 h-6 text-cta" />,
              color: "cta",
              title: "Autonomous Dispatch Drafts",
              desc: (<span>Eliminates citizen ghosting. When city dispatchers click <span className="bg-white/10 text-cta px-2 py-0.5 rounded font-mono text-xs font-bold border border-cta/30">[Generate Dispatch Reply]</span>, our intelligent engine drafts professional, empathetic status updates tailored to the exact infrastructure severity.</span>)
            }
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-7 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cta/50 transition-all group backdrop-blur-sm relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cta/5 rounded-full blur-2xl group-hover:bg-cta/15 transition-all"></div>
              <div className="w-12 h-12 rounded-xl bg-cta/10 text-cta flex items-center justify-center text-2xl mb-5 border border-cta/20 font-bold shrink-0">
                {feat.icon}
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-3 min-h-[56px] flex items-center">{feat.title}</h3>
              <p className="text-sm text-text/70 leading-relaxed flex-1">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-text/50">
        <p>© 2026 SunoSarkar AI • Built for Transparent & Autonomous Municipal Governance</p>
      </footer>
    </div>
  );
};
export default LandingPage;
