import React from "react";
import { RefreshCw, Wifi, WifiOff, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { ConnectionStatus } from "../core/memory/types";

interface ConnectionStatusBarProps {
  status: ConnectionStatus;
  attempt?: number;
  maxAttempts?: number;
  onRetry: () => void;
  personaName?: string;
  isVoiceActive?: boolean;
}

export const ConnectionStatusBar: React.FC<ConnectionStatusBarProps> = ({
  status,
  attempt = 1,
  maxAttempts = 5,
  onRetry,
  personaName,
  isVoiceActive = false
}) => {
  // If connected and voice is not active, stay hidden to avoid clutter
  if (status === "connected" && !isVoiceActive) {
    return null;
  }

  return (
    <div id="lisa-connection-status-bar" className="w-full flex items-center justify-center px-3 py-1.5 transition-all duration-300 z-30">
      {status === "reconnecting" && (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium backdrop-blur-md shadow-lg animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>Reconnecting to Lisa ({attempt}/{maxAttempts})... Preserving session & persona</span>
        </div>
      )}

      {status === "restored" && (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-medium backdrop-blur-md shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>Connection restored — Lisa is ready to continue!</span>
        </div>
      )}

      {status === "offline" && (
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-medium backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-1.5 text-rose-300">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Connection paused</span>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/30 hover:bg-rose-500/50 text-white font-semibold transition-colors text-[11px]"
          >
            <RefreshCw className="w-3 h-3" />
            Reconnect Now
          </button>
        </div>
      )}

      {status === "connected" && isVoiceActive && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300/80 text-[11px] backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Voice Active</span>
        </div>
      )}
    </div>
  );
};
