import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CharacterEnvironment } from "../core/character/types";

interface LisaEnvironmentProps {
  environment: CharacterEnvironment;
}

export const LisaEnvironment: React.FC<LisaEnvironmentProps> = ({ environment }) => {
  const getEnvironmentStyles = (type: CharacterEnvironment["type"]) => {
    switch (type) {
      case "hospital":
        return {
          gradient: "from-blue-100/20 to-emerald-100/10",
          overlay: "bg-white/5",
          blur: "blur-3xl"
        };
      case "school":
        return {
          gradient: "from-amber-100/20 to-orange-100/10",
          overlay: "bg-amber-900/5",
          blur: "blur-2xl"
        };
      case "zoo":
        return {
          gradient: "from-emerald-200/20 to-yellow-100/10",
          overlay: "bg-emerald-900/5",
          blur: "blur-3xl"
        };
      case "space":
        return {
          gradient: "from-indigo-900/40 to-purple-900/20",
          overlay: "bg-black/40",
          blur: "blur-[100px]"
        };
      case "lab":
        return {
          gradient: "from-cyan-100/20 to-blue-200/10",
          overlay: "bg-cyan-900/5",
          blur: "blur-3xl"
        };
      default:
        return {
          gradient: "from-transparent to-transparent",
          overlay: "transparent",
          blur: "none"
        };
    }
  };

  const styles = getEnvironmentStyles(environment.type);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={environment.type}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Abstract background shapes */}
          <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${styles.gradient} transition-all duration-1000`} />

          {/* Environment-specific "glow" */}
          <div className={`absolute -top-[20%] -left-[20%] w-[140%] h-[140%] ${styles.blur} opacity-50 mix-blend-screen transition-all duration-1000`} />

          {/* Persona overlay tint */}
          <div className={`absolute inset-0 ${styles.overlay} transition-all duration-1000`} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
