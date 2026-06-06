import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, Youtube, Music, Radio, Minimize2, Maximize2, 
  ExternalLink, Search, Disc, Play, Square, Volume2
} from "lucide-react";
import { ThemePalette } from "../utils/theme";

interface MediaWidgetProps {
  type: "youtube" | "spotify";
  query: string;
  videoId?: string | null;
  palette: ThemePalette;
  onClose: () => void;
}

export default function MediaWidget({ type, query, videoId, palette, onClose }: MediaWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentQuery, setCurrentQuery] = useState(query);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(videoId || null);
  const [activeType, setActiveType] = useState<"youtube" | "spotify">(type);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [currentWidgetKey, setCurrentWidgetKey] = useState(0); // For forcing iframe reloads on search

  // URL Resolvers
  // If specific videoId is provided, play it directly, otherwise fallback to list search
  const youtubeEmbedUrl = currentVideoId
    ? `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=0&enablejsapi=1`
    : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(currentQuery)}&autoplay=1&mute=0&enablejsapi=1`;
  const spotifyEmbedUrl = `https://open.spotify.com/embed/search?q=${encodeURIComponent(currentQuery)}`;

  const handleInlineSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      setCurrentQuery(searchInputValue.trim());
      setCurrentVideoId(null); // Clear specific videoId for manual search standard query fallback
      setSearchInputValue("");
      setCurrentWidgetKey(prev => prev + 1); // Refresh iframe
    }
  };

  const handleTypeSwitch = (newType: "youtube" | "spotify") => {
    setActiveType(newType);
    setCurrentWidgetKey(prev => prev + 1);
  };

  const handleExternalRedirect = () => {
    const url = activeType === "youtube"
      ? (currentVideoId ? `https://www.youtube.com/watch?v=${currentVideoId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(currentQuery)}`)
      : `https://open.spotify.com/search/${encodeURIComponent(currentQuery)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={{ left: -100, right: window.innerWidth - 300, top: -50, bottom: window.innerHeight - 150 }}
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 50 }}
      className={`fixed z-40 ${
        isMinimized 
          ? "w-72 h-14" 
          : "w-80 sm:w-96 h-[380px]"
      } bg-zinc-950/90 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col overflow-hidden pointer-events-auto select-none`}
      style={{ 
        bottom: "85px", 
        left: "20px",
        touchAction: "none" // Prevents default browser scroll while dragging
      }}
    >
      {/* Glow highlight base border */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
        activeType === "youtube" ? "from-red-600 to-rose-400" : "from-emerald-500 to-teal-400"
      }`} />

      {/* HEADER BAR */}
      <div className="flex justify-between items-center px-4 py-2.5 bg-white/[0.02] border-b border-white/5 cursor-grab active:cursor-grabbing shrink-0">
        <div className="flex items-center gap-2 max-w-[65%]">
          {activeType === "youtube" ? (
            <Youtube size={16} className="text-red-500 animate-pulse shrink-0" />
          ) : (
            <Music size={16} className="text-emerald-400 animate-pulse shrink-0" />
          )}
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/90 truncate">
            {isMinimized ? `Playing: ${currentQuery}` : `Lisa Media Stream`}
          </span>
        </div>

        {/* Action button bar */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Switch source button inline if maximized */}
          {!isMinimized && (
            <button
              onClick={() => handleTypeSwitch(activeType === "youtube" ? "spotify" : "youtube")}
              className={`p-1 rounded-lg border border-white/5 hover:bg-white/5 text-[9px] font-mono tracking-tighter uppercase px-1.5 transition-colors cursor-pointer ${
                activeType === "youtube" ? "text-emerald-400 hover:text-emerald-300" : "text-rose-400 hover:text-rose-300"
              }`}
              title={`Switch playback to ${activeType === "youtube" ? "Spotify" : "YouTube"}`}
            >
              To {activeType === "youtube" ? "Spotify" : "YouTube"}
            </button>
          )}

          {/* Minimize toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title={isMinimized ? "Maximize window" : "Minimize window"}
          >
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>

          {/* External Redirect info */}
          {!isMinimized && (
            <button
              onClick={handleExternalRedirect}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Open stream in a new tab"
            >
              <ExternalLink size={12} />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            title="Stop & Close player"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* MINIMIZED VIEW STATE */}
      {isMinimized ? (
        <div className="flex-1 flex items-center justify-between px-4 py-1.5 gap-3 bg-gradient-to-r from-black/25 to-black/5 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            {/* Spinning vinyl disk icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className={`w-7 h-7 rounded-full flex items-center justify-center border border-white/15 bg-black text-xs shrink-0 ${
                activeType === "youtube" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              <Disc size={13} />
            </motion.div>

            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-[10px] text-white/55 font-mono tracking-tight capitalize truncate">
                {currentQuery}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase">
                  ACTIVE STREAMING BACKGROUND
                </span>
                {/* Audio viz simulation lines */}
                <div className="flex gap-0.5 items-end h-2.5">
                  <div className="w-[1.5px] bg-emerald-400 rounded-full animate-pulse h-2" style={{ animationDelay: "0.1s" }} />
                  <div className="w-[1.5px] bg-sky-400 rounded-full animate-pulse h-1" style={{ animationDelay: "0.3s" }} />
                  <div className="w-[1.5px] bg-red-400 rounded-full animate-pulse h-3" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 cursor-pointer text-[9px] font-mono uppercase tracking-wider h-7 flex items-center justify-center gap-1 shrink-0"
          >
            <Volume2 size={10} />
            <span>Show video</span>
          </button>
        </div>
      ) : (
        /* MAXIMIZED VIEW STATE */
        <div className="flex-1 flex flex-col min-h-0 bg-black/40">
          
          {/* Direct Input Search Bar in player */}
          <form 
            onSubmit={handleInlineSearchSubmit} 
            className="flex items-center h-9 border-b border-white/5 bg-white/[0.01] px-2.5 gap-2 shrink-0 pointer-events-auto"
          >
            <Search size={11} className="text-white/40 shrink-0" />
            <input 
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder={`Search another song on ${activeType === "youtube" ? "YouTube" : "Spotify"}...`}
              className="flex-1 bg-transparent border-none outline-none text-[10px] text-white placeholder-white/20"
            />
            <button 
              type="submit"
              disabled={!searchInputValue.trim()}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 text-[8px] font-mono tracking-wider uppercase disabled:opacity-30 cursor-pointer shrink-0 transition-opacity"
            >
              Search
            </button>
          </form>

          {/* Embedded Streaming Iframe wrapper */}
          <div className="flex-1 w-full bg-black/80 flex items-center justify-center relative select-none">
            {activeType === "youtube" ? (
              <iframe
                key={`yt-${currentQuery}-${currentWidgetKey}`}
                src={youtubeEmbedUrl}
                title="YouTube Video Player"
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
                className="w-full h-full border-none pointer-events-auto relative z-10"
              />
            ) : (
              <iframe
                key={`sp-${currentQuery}-${currentWidgetKey}`}
                src={spotifyEmbedUrl}
                title="Spotify Music Player"
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
                className="w-full h-full border-none pointer-events-auto relative z-10"
              />
            )}

            {/* Simulated background overlay for elegant initialization and error screens */}
            <div className="absolute inset-0 z-0 bg-[#0c0d12] flex flex-col items-center justify-center gap-2 p-6 text-center">
              <Disc size={28} className="text-zinc-700 animate-spin" style={{ animationDuration: "5s" }} />
              <div className="space-y-0.5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Initializing player channel</p>
                <p className="text-[9px] text-zinc-600 truncate max-w-[200px]">{currentQuery}</p>
              </div>
            </div>
          </div>

          {/* MINI CONTROLLER FOOTER BAR */}
          <div className="px-3.5 py-2 bg-white/[0.01] border-t border-white/5 flex justify-between items-center shrink-0">
            <div className="flex flex-col leading-none max-w-[70%]">
              <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400">Stream Source</span>
              <span className="text-[9px] text-white/50 font-sans truncate mt-0.5">{currentQuery}</span>
            </div>

            <span className="text-[8px] font-mono tracking-wider bg-white/5 text-white/60 px-1.5 py-0.5 rounded border border-white/5 uppercase">
              {activeType} Active Mode
            </span>
          </div>

        </div>
      )}
    </motion.div>
  );
}
