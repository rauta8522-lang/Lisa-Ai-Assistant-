import { useMemo } from "react"; // ✅ useMemo ko React se import kiya
import { motion, TargetAndTransition } from "framer-motion"; // ya "motion/react"
import { ThemePalette } from "../utils/theme";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
  palette: ThemePalette;
  onToggleListening: () => void;
}

export default function Visualizer({ state, palette, onToggleListening }: VisualizerProps) {
  const theme = palette?.visColors?.[state] || {
    color: "rgba(6, 182, 212, 0.8)",
    glow: "shadow-cyan-500/40",
    border: "border-cyan-500/50"
  };

  const blobAnimation = useMemo<TargetAndTransition>(() => {
    const baseTransitions = { repeat: Infinity, ease: "easeInOut" as const }; 

    switch (state) {
      case "speaking":
        return {
          scale: [1, 1.2, 1.1, 1.3, 1],
          borderRadius: ["50% 50% 50% 50%", "40% 60% 30% 70%", "60% 40% 70% 30%", "45% 55% 45% 55%", "50% 50% 50% 50%"],
          opacity: [0.8, 1, 0.9, 1, 0.8],
          boxShadow: [
            `0 0 20px 5px ${theme.color}`,
            `0 0 40px 10px ${theme.color}`,
            `0 0 60px 15px ${theme.color}`,
            `0 0 30px 8px ${theme.color}`,
            `0 0 20px 5px ${theme.color}`
          ],
          transition: { ...baseTransitions, duration: 2.5 }
        };

      case "listening":
        return {
          scale: [1, 1.1, 1.05, 1],
          borderRadius: ["50% 50% 50% 50%", "42% 58% 50% 50%", "50% 50% 58% 42%", "50% 50% 50% 50%"],
          opacity: [0.7, 0.9, 0.8, 0.7],
          boxShadow: [
            `0 0 10px 2px ${theme.color}`,
            `0 0 30px 8px ${theme.color}`,
            `0 0 20px 5px ${theme.color}`,
            `0 0 10px 2px ${theme.color}`
          ],
          transition: { ...baseTransitions, duration: 2 }
        };

      case "processing":
        return {
          scale: [1, 1.05, 1],
          borderRadius: ["50% 50% 50% 50%", "35% 65% 65% 35%", "50% 50% 50% 50%"],
          opacity: [0.5, 0.8, 0.5],
          boxShadow: [
            `0 0 15px 2px ${theme.color}40`,
            `0 0 25px 5px ${theme.color}60`,
            `0 0 15px 2px ${theme.color}40`
          ],
          transition: { repeat: Infinity, ease: "linear" as const, duration: 1.5 }
        };

      default: // "idle"
        return {
          scale: [1, 1.03, 1],
          borderRadius: ["50% 50% 50% 50%", "47% 53% 53% 47%", "50% 50% 50% 50%"],
          opacity: [0.4, 0.6, 0.4],
          boxShadow: [
            `0 0 5px 0px ${theme.color}20`,
            `0 0 10px 1px ${theme.color}30`,
            `0 0 5px 0px ${theme.color}20`
          ],
          transition: { ...baseTransitions, duration: 4 }
        };
    }
  }, [state, theme.color]);

  return (
    <div 
      className="relative flex items-center justify-center p-10 cursor-pointer pointer-events-auto select-none" 
      onClick={onToggleListening}
    >
      {/* Background Soft Glow */}
      <motion.div
        animate={blobAnimation}
        className="absolute w-64 h-64 blur-[60px] mix-blend-screen pointer-events-none"
        style={{ backgroundColor: theme.color }}
      />
      
      {/* Ripples when listening */}
      {state === "listening" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-emerald-400/50"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-emerald-400/30"
            animate={{ scale: [1, 2.1], opacity: [0.4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
          />
        </div>
      )}
      
      {/* Dynamic Core Blob / Listen Button */}
      <motion.div
        animate={blobAnimation}
        className="relative w-40 h-40 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl z-10"
        style={{ 
          background: `radial-gradient(circle at center, ${theme.color}30, transparent 80%)`
        }}
      >
        <span className="font-serif text-white/95 text-2xl tracking-[0.25em] drop-shadow-md">LISA</span>
      </motion.div>
    </div>
  );
}