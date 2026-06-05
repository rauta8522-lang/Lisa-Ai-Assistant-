export interface ThemePalette {
  id: "deep-space" | "neon-sunset" | "monochrome";
  name: string;
  glowTop: string;
  glowBottom: string;
  accentGradient: string; // e.g. "from-violet-500 to-pink-500"
  accentGradientText: string; // elements with text clips
  accentText: string; // e.g. "text-violet-400"
  accentBorder: string; // e.g. "border-violet-500/30"
  accentBg: string; // e.g. "bg-violet-600 hover:bg-violet-500"
  accentRing: string; // focus border class
  avatarBg: string;
  glassBorder: string;
  ambientShadow: string;
  sidebarBorder: string;
  visColors: {
    listening: { color: string; glow: string; border: string };
    processing: { color: string; glow: string; border: string };
    speaking: { color: string; glow: string; border: string };
    idle: { color: string; glow: string; border: string };
  };
}

export const THEME_PALETTES: Record<"deep-space" | "neon-sunset" | "monochrome", ThemePalette> = {
  "deep-space": {
    id: "deep-space",
    name: "Deep Space",
    glowTop: "bg-violet-900/20",
    glowBottom: "bg-pink-900/20",
    accentGradient: "from-violet-500 to-pink-500",
    accentGradientText: "bg-gradient-to-tr from-violet-400 to-pink-400 bg-clip-text text-transparent",
    accentText: "text-violet-400",
    accentBorder: "border-violet-500/30",
    accentBg: "bg-violet-600 hover:bg-violet-500",
    accentRing: "focus:border-violet-500",
    avatarBg: "from-violet-500 to-pink-500",
    glassBorder: "border-white/10",
    ambientShadow: "shadow-[0_10px_50px_rgba(139,92,246,0.15)]",
    sidebarBorder: "border-white/10",
    visColors: {
      listening: { color: "rgba(139, 92, 246, 1)", glow: "shadow-violet-500/60", border: "border-violet-400" },
      processing: { color: "rgba(56, 189, 248, 1)", glow: "shadow-sky-400/80", border: "border-sky-400" },
      speaking: { color: "rgba(236, 72, 153, 1)", glow: "shadow-pink-500/80", border: "border-pink-400" },
      idle: { color: "rgba(6, 182, 212, 0.8)", glow: "shadow-cyan-500/40", border: "border-cyan-500/50" }
    }
  },
  "neon-sunset": {
    id: "neon-sunset",
    name: "Neon Sunset",
    glowTop: "bg-amber-900/20",
    glowBottom: "bg-rose-900/25",
    accentGradient: "from-amber-500 to-rose-500",
    accentGradientText: "bg-gradient-to-tr from-amber-400 to-rose-400 bg-clip-text text-transparent",
    accentText: "text-rose-400",
    accentBorder: "border-rose-500/30",
    accentBg: "bg-rose-600 hover:bg-rose-500",
    accentRing: "focus:border-rose-500",
    avatarBg: "from-amber-500 to-rose-500",
    glassBorder: "border-rose-500/15",
    ambientShadow: "shadow-[0_10px_50px_rgba(244,63,94,0.18)]",
    sidebarBorder: "border-rose-500/20",
    visColors: {
      listening: { color: "rgba(245, 158, 11, 1)", glow: "shadow-amber-500/60", border: "border-amber-400" },
      processing: { color: "rgba(236, 72, 153, 1)", glow: "shadow-pink-400/80", border: "border-pink-400" },
      speaking: { color: "rgba(244, 63, 94, 1)", glow: "shadow-rose-500/85", border: "border-rose-400" },
      idle: { color: "rgba(217, 119, 6, 0.8)", glow: "shadow-orange-500/40", border: "border-orange-500/50" }
    }
  },
  "monochrome": {
    id: "monochrome",
    name: "Monochrome",
    glowTop: "bg-zinc-800/10",
    glowBottom: "bg-slate-700/5",
    accentGradient: "from-zinc-300 to-zinc-500",
    accentGradientText: "bg-gradient-to-tr from-zinc-200 to-zinc-400 bg-clip-text text-transparent",
    accentText: "text-zinc-300",
    accentBorder: "border-zinc-500/20",
    accentBg: "bg-zinc-700 hover:bg-zinc-600",
    accentRing: "focus:border-zinc-400",
    avatarBg: "from-zinc-300 to-zinc-500 text-black",
    glassBorder: "border-zinc-700/30",
    ambientShadow: "shadow-[0_10px_50px_rgba(255,255,255,0.03)]",
    sidebarBorder: "border-zinc-800",
    visColors: {
      listening: { color: "rgba(228, 228, 231, 1)", glow: "shadow-zinc-100/40", border: "border-zinc-100" },
      processing: { color: "rgba(161, 161, 170, 1)", glow: "shadow-zinc-400/50", border: "border-zinc-400" },
      speaking: { color: "rgba(244, 244, 245, 1)", glow: "shadow-zinc-200/60", border: "border-zinc-200" },
      idle: { color: "rgba(113, 113, 122, 0.7)", glow: "shadow-zinc-500/20", border: "border-zinc-600/40" }
    }
  }
};
