import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Cpu, MapPin, Zap } from 'lucide-react';

const STEPS = [
  { icon: Cpu, label: "Scanning Multimodal Vision Telemetry..." },
  { icon: MapPin, label: "Cross-Referencing GIS Infrastructure Vectors..." },
  { icon: Zap, label: "Calculating Weather Urgency & Risk Matrix..." },
  { icon: Sparkles, label: "Assigning Municipal Dispatch Routing..." }
];

export const AIProcessingSteps: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500/20 to-emerald-500/10 border border-green-500/30 flex items-center justify-center shadow-lg shadow-green-500/10 animate-pulse">
          <Sparkles className="w-8 h-8 text-green-400 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-slate-100 font-heading">AI Triage Engine Synthesizing</h3>
        <p className="text-xs text-slate-400 font-mono">Autonomous municipal risk assessment in progress</p>
      </div>

      <div className="w-full space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0.4, x: -10 }}
              animate={{ opacity: isDone || isCurrent ? 1 : 0.4, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-xs font-mono"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                )}
              </div>
              <span className={isDone ? "text-slate-300 line-through decoration-slate-600" : isCurrent ? "text-green-400 font-bold" : "text-slate-600"}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
