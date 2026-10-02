import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Sparkles, UserCheck, ShieldCheck, HeartPulse, GraduationCap, Briefcase, Camera, Compass, Code, Rocket, ShieldAlert, ChefHat, Dumbbell, BookOpen, Mic } from "lucide-react";

export interface PersonaToastData {
  id: string;
  title: string;
  subtitle?: string;
  role?: string;
  icon?: string;
  color?: string;
  durationMs?: number;
}

interface PersonaActivationToastProps {
  toast: PersonaToastData | null;
  onDismiss: () => void;
}

// Icon resolver helper for dynamic Lucide icons
const getToastIcon = (iconName?: string, roleTitle?: string) => {
  const lower = (iconName || roleTitle || "").toLowerCase();

  if (lower.includes("nurse") || lower.includes("heart") || lower.includes("health") || lower.includes("medic")) {
    return <HeartPulse className="w-4 h-4 text-rose-400" />;
  }
  if (lower.includes("teach") || lower.includes("prof") || lower.includes("grad") || lower.includes("educat")) {
    return <GraduationCap className="w-4 h-4 text-cyan-400" />;
  }
  if (lower.includes("hr") || lower.includes("interview") || lower.includes("recruit") || lower.includes("briefcase")) {
    return <Briefcase className="w-4 h-4 text-teal-400" />;
  }
  if (lower.includes("docu") || lower.includes("narrat") || lower.includes("wildlife") || lower.includes("safari") || lower.includes("compass") || lower.includes("tour") || lower.includes("guide")) {
    return <Compass className="w-4 h-4 text-emerald-400" />;
  }
  if (lower.includes("police") || lower.includes("detective") || lower.includes("shield") || lower.includes("security")) {
    return <ShieldAlert className="w-4 h-4 text-sky-400" />;
  }
  if (lower.includes("code") || lower.includes("dev") || lower.includes("engineer") || lower.includes("tech")) {
    return <Code className="w-4 h-4 text-amber-400" />;
  }
  if (lower.includes("space") || lower.includes("rocket") || lower.includes("astron")) {
    return <Rocket className="w-4 h-4 text-purple-400" />;
  }
  if (lower.includes("chef") || lower.includes("cook")) {
    return <ChefHat className="w-4 h-4 text-orange-400" />;
  }
  if (lower.includes("fit") || lower.includes("gym") || lower.includes("train")) {
    return <Dumbbell className="w-4 h-4 text-red-400" />;
  }
  if (lower.includes("photo") || lower.includes("camera") || lower.includes("art")) {
    return <Camera className="w-4 h-4 text-yellow-400" />;
  }
  if (lower.includes("core") || lower.includes("lisa")) {
    return <Sparkles className="w-4 h-4 text-fuchsia-400" />;
  }

  return <Check className="w-4 h-4 text-emerald-400" />;
};

export const PersonaActivationToast: React.FC<PersonaActivationToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const duration = toast.durationMs || 3000;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      id="persona-toast-container"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[92vw] sm:max-w-md w-max"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            onClick={onDismiss}
            className="group cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-full bg-zinc-950/90 hover:bg-zinc-900/95 border border-white/15 hover:border-white/25 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-200"
            title="Click to dismiss"
          >
            {/* Visual Icon Badge */}
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              {getToastIcon(toast.icon, toast.title || toast.role)}
            </div>

            {/* Toast Title & Text */}
            <div className="flex flex-col min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold tracking-wide text-white drop-shadow-sm whitespace-nowrap">
                  {toast.title}
                </span>
              </div>
              {toast.subtitle && (
                <span className="text-[10px] text-zinc-400 tracking-normal whitespace-nowrap overflow-hidden text-ellipsis">
                  {toast.subtitle}
                </span>
              )}
            </div>

            {/* Subtle Checkmark indicator */}
            <div className="ml-1 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
