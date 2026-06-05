import { motion } from "motion/react";
import { ThemePalette } from "../utils/theme";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
  palette: ThemePalette;
  onToggleListening: () => void;
}

export default function Visualizer({ state, palette, onToggleListening }: VisualizerProps) {
  const theme = palette ? palette.visColors[state] : {
    color: "rgba(6, 182, 212, 0.8)",
    glow: "shadow-cyan-500/40",
    border: "border-cyan-500/50"
  };

  const getBlobAnimation = () => {
    if (state === "speaking") {
      return {
        scale: [1, 1.2, 1.1, 1.3, 1],
        borderRadius: ["40% 60% 70% 30%", "60% 40% 30% 70%", "50% 50% 50% 50%", "40% 60% 70% 30%"],
        opacity: [0.8, 1, 0.9, 1, 0.8],
        boxShadow: [`0 0 20px 5px ${theme.color}`, `0 0 60px 15px ${theme.color}`, `0 0 20px 5px ${theme.color}`],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if (state === "listening") {
      return {
        scale: [1, 1.1, 1],
        borderRadius: ["50% 50% 50% 50%", "40% 60% 60% 40%", "50% 50% 50% 50%"],
        opacity: [0.7, 0.9, 0.7],
        boxShadow: [`0 0 10px 2px ${theme.color}`, `0 0 30px 8px ${theme.color}`, `0 0 10px 2px ${theme.color}`],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if (state === "processing") {
      return {
        scale: [1, 1.05, 1],
        borderRadius: ["30% 70% 40% 60%", "50% 50% 50% 50%", "30% 70% 40% 60%"],
        opacity: [0.5, 0.8, 0.5],
        boxShadow: `0 0 15px 2px ${theme.color}40`,
        transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
      };
    }
    return {
      scale: [1, 1.02, 1],
      borderRadius: ["50% 50% 50% 50%", "45% 55% 45% 55%", "50% 50% 50% 50%"],
      opacity: [0.3, 0.5, 0.3],
      boxShadow: `0 0 5px 0px transparent`,
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    };
  };

  return (
    <div className="relative flex items-center justify-center p-10 cursor-pointer pointer-events-auto" onClick={onToggleListening}>
      {/* Background Soft Glow */}
      <motion.div
        animate={getBlobAnimation()}
        className="absolute w-64 h-64 blur-[80px] opacity-40 mix-blend-screen rounded-full"
        style={{ backgroundColor: theme.color }}
      />
      
      {/* Ripples when listening */}
      {state === "listening" && (
        <>
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-emerald-400/50"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-emerald-400/30"
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      )}
      
      {/* Dynamic Core Blob / Listen Button */}
      <motion.div
        animate={getBlobAnimation()}
        className="relative w-40 h-40 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl rounded-full"
        style={{ 
          background: `radial-gradient(circle at center, ${theme.color}40, transparent 70%)`
        }}
      >
        <span className="font-serif text-white/90 text-2xl tracking-[0.2em]">LISA</span>
      </motion.div>
    </div>
  );
}
