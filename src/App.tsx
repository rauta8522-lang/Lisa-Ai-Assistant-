import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, VolumeX, Keyboard, Send, Trash2 } from "lucide-react";
import { getLisaResponse, getLisaAudio, resetLisaSession } from "./services/geminiService";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import PermissionModal from "./components/PermissionModal";
import { playPCM, resumeAudioContext } from "./utils/audioUtils";
import { Platform, Features, Network } from "./utils/platformUtils";
import { motion, AnimatePresence } from "framer-motion";
import SettingsMenu from "./components/SettingsMenu";
import { db } from "./config/firebase";
import { collection, addDoc } from "firebase/firestore";

type AppState = "idle" | "listening" | "processing" | "speaking";

interface ChatMessage {
  id: string;
  sender: "user" | "lisa";
  text: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  useEffect(() => {
  window.addEventListener("appinstalled", async () => {
    try {
      await addDoc(collection(db, "installs"), {
        installedAt: new Date(),
        userAgent: navigator.userAgent,
      });

      console.log("Lisa AI Installed");
    } catch (error) {
      console.error("Install tracking failed:", error);
    }
  });
}, []);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>("idle");
  const [deviceType] = useState(Platform.getDeviceType());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("lisa_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [];
  });
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    localStorage.setItem("lisa_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
useEffect(() => {
  const handleOnline = () => setIsOffline(false);
  const handleOffline = () => setIsOffline(true);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);


// 👇 YAHAN paste karo
useEffect(() => {
  const handler = (e: any) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
  };
}, []);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
    }
  }, [isMuted]);

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSongOpen, setIsSongOpen] = useState(false);
  const songWindowRef = useRef<Window | null>(null);

  const stopSong = () => {
    if (songWindowRef.current && !songWindowRef.current.closed) {
      songWindowRef.current.close();
    }
    songWindowRef.current = null;
    setIsSongOpen(false);
  };

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusDescription = (state: AppState) => {
    switch (state) {
      case "listening":
        return "Lisa is ready to hear your voice command.";
      case "processing":
        return "Lisa is thinking and crafting a response.";
      case "speaking":
        return "Lisa is speaking out loud now.";
      default:
        return "Ask Lisa anything by voice or text.";
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  useEffect(() => {
    if (!isSongOpen) return;
    const interval = window.setInterval(() => {
      if (!songWindowRef.current || songWindowRef.current.closed) {
        setIsSongOpen(false);
        songWindowRef.current = null;
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isSongOpen]);

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
      setAppState("idle");
      return;
    }

    const lowerTranscript = finalTranscript.toLowerCase();
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: finalTranscript }]);
    
    if (songWindowRef.current && /\b(?:stop|pause|halt|band|rok|ruk|band kar|rok do|pause kar|pause karo)\b/.test(lowerTranscript)) {
      stopSong();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-l",
          sender: "lisa",
          text: "The song has been stopped.",
        },
      ]);
      setAppState("idle");
      return;
    }

    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");

    // 1. Check for browser commands
    const commandResult = await processCommand(finalTranscript);

    let responseText = "";

    if (commandResult.shouldStop) {
      responseText = commandResult.action;
      stopSong();
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);
      setAppState("idle");
      return;
    }

    if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);

      let opened: Window | null = null;
      if (commandResult.url) {
        // Use appropriate method based on device type
        if (deviceType === "mobile" || deviceType === "tablet") {
          // On mobile, use window.location instead of window.open for better compatibility
          window.location.href = commandResult.url;
        } else {
          opened = window.open(commandResult.url, "_blank");
          if (!opened) {
            console.warn("Browser blocked popup for URL:", commandResult.url);
            alert("Popup blocked. Please allow popups for this site.");
          } else if (commandResult.url.includes("youtube.com/watch")) {
            songWindowRef.current = opened;
            setIsSongOpen(true);
          }
        }
      }
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getLisaAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64).catch(err => {
            console.error("Audio playback error:", err);
          });
        }
      }

      setAppState("idle");
    } else {
      // 2. General Chit-Chat via Gemini
      responseText = await getLisaResponse(finalTranscript, messagesRef.current);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getLisaAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64).catch(err => {
            console.error("Audio playback error:", err);
          });
        }
      }
      setAppState("idle");
    }
  }, [isMuted, isSessionActive, deviceType]);

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  const startLiveSession = useCallback(async () => {
    try {
      // Check if speech recognition is supported
      if (!Features.isSpeechRecognitionSupported()) {
        alert("Speech recognition is not supported on this device. Please use text input instead.");
        setShowTextInput(true);
        return;
      }

      // Resume audio context on mobile
      await resumeAudioContext();

      setIsSessionActive(true);
      setShowPermissionModal(false);
      resetLisaSession();
      
      const session = new LiveSessionManager();
      session.isMuted = isMuted;
      liveSessionRef.current = session;
      
      session.onStateChange = (state) => {
        setAppState(state);
      };
      
      session.onMessage = (sender, text) => {
        setMessages((prev) => [...prev, { id: Date.now().toString() + "-" + sender, sender, text }]);

        if (sender === "user") {
          const lowerText = text.toLowerCase();
          if (
            songWindowRef.current &&
            /\b(?:stop|pause|halt|band|rok|ruk|band kar|rok do|pause kar|pause karo)\b/.test(lowerText)
          ) {
            stopSong();
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString() + "-l",
                sender: "lisa",
                text: "The song is stopped.",
              },
            ]);
          } else if (/\b(?:stop|pause|halt|band|rok|ruk|band kar|rok do|pause kar|pause karo)\b.*\b(?:song|music|video|playing)\b/.test(lowerText)) {
            stopSong();
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString() + "-l",
                sender: "lisa",
                text: "The song is stopped.",
              },
            ]);
          }
        }
      };
      
      session.onCommand = (url) => {
        if (deviceType === "mobile" || deviceType === "tablet") {
          window.location.href = url;
        } else {
          const opened = window.open(url, "_blank");
          if (!opened) {
            console.warn("Browser blocked popup for URL:", url);
            alert("Popup blocked. Please allow popups for this site.");
          } else if (url.includes("youtube.com/watch")) {
            songWindowRef.current = opened;
            setIsSongOpen(true);
          }
        }
      };

      await session.start();
      setShowPermissionModal(false);
    } catch (e: any) {
      console.error("Failed to start session", e);
      setIsSessionActive(false);
      setAppState("idle");
      
      const errorMessage = (e as Error).message || "";
      const isPermissionError = 
        errorMessage.includes("Microphone access denied") ||
        errorMessage.includes("NotAllowedError") ||
        errorMessage.includes("Permission denied") ||
        (e.name === "NotAllowedError") ||
        (e.name === "PermissionDeniedError");
      
      if (isPermissionError) {
        setShowPermissionModal(true);
      } else {
        alert(`Error: ${errorMessage || e.message || "Unknown error"}`);
      }
    }
  }, [isMuted, deviceType]);

  const toggleListening = useCallback(async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      resetLisaSession();
    } else {
      await startLiveSession();
    }
  }, [isSessionActive, startLiveSession]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    handleTextCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#050505] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden m-0 p-0 safe-area">
     {deferredPrompt && (
      <button
        onClick={async () => {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          setDeferredPrompt(null);
        }}
      >
        Install App
      </button>
    )}
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500/80 text-white py-2 text-center text-xs md:text-sm z-50">
          You are offline. Some features may not work.
        </div>
      )}

      {showPermissionModal && (
        <PermissionModal 
          onClose={() => setShowPermissionModal(false)}
        />
      )}

      {/* Cinematic Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center z-20 shrink-0 px-4 py-3 md:px-12 md:py-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 flex items-center justify-center font-bold text-xs md:text-sm">
            L
          </div>
          <h1 className="text-lg md:text-xl font-serif font-medium tracking-wide opacity-90">Lisa</h1>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear chat history?")) {
                  setMessages([]);
                  resetLisaSession();
                }
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10"
              title="Clear Chat History"
            >
              <Trash2 size={16} className="opacity-70 md:w-5 md:h-5" />
            </button>
          )}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX size={16} className="opacity-70 md:w-5 md:h-5" />
            ) : (
              <Volume2 size={16} className="opacity-70 md:w-5 md:h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content - Visualizer & Chat */}
      <main className={`absolute inset-0 flex ${deviceType === 'mobile' ? 'flex-col' : 'flex-row'} items-center justify-between w-full h-full z-10 overflow-hidden pt-16 md:pt-20 pb-28 md:pb-24 px-3 md:px-12 pointer-events-none`}>
        
        {/* Left Column: Lisa Status (hidden on mobile) */}
        {deviceType !== 'mobile' && (
          <div className="flex w-[30%] lg:w-[25%] h-full flex-col justify-center gap-4 z-10">
            <div className="h-6">
              <AnimatePresence>
                {appState === "processing" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 text-cyan-300/80 text-xs md:text-sm italic font-serif"
                  >
                    <Loader2 size={14} className="animate-spin" />
                    Replying...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Center Visualizer (Fixed Full Screen Background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <Visualizer state={appState} />
        </div>

        {/* Right Column: User Status (hidden on mobile) */}
        {deviceType !== 'mobile' && (
          <div className="flex w-[30%] lg:w-[25%] h-full flex-col justify-center gap-4 z-10">
            <div className="h-6 flex justify-end">
              <AnimatePresence>
                {appState === "listening" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 text-violet-300/80 text-xs md:text-sm italic"
                  >
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    Listening...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Mobile centered status */}
        {deviceType === 'mobile' && (
          <div className="flex flex-col gap-4 z-10 items-center">
            <AnimatePresence>
              {appState === "processing" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 text-cyan-300/80 text-sm italic font-serif"
                >
                  <Loader2 size={14} className="animate-spin" />
                  Replying...
                </motion.div>
              )}
              {appState === "listening" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 text-violet-300/80 text-sm italic"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  Listening...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Settings 3-Dot Menu Button */}
       <div className="absolute top-6 right-2 z-50 flex items-center">
         <SettingsMenu userEmail="anil@example.com" />
       </div>
      {/* Controls */}
      <footer className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-center pb-4 md:pb-8 z-20 shrink-0 gap-3 md:gap-4 px-3 md:px-4">
        <AnimatePresence>
          {showTextInput && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleTextSubmit}
              className={`w-full ${deviceType === 'mobile' ? 'max-w-xs' : 'max-w-md'} flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 pl-3 md:pl-4 backdrop-blur-md shadow-2xl`}
            >
              <input 
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-xs md:text-sm"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 rounded-full bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:hover:bg-violet-500 transition-colors"
              >
                <Send size={14} className="md:w-4 md:h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className={`flex ${deviceType === 'mobile' ? 'flex-wrap justify-center gap-2' : 'items-center gap-4'}`}>
          <button
            onClick={toggleListening}
            className={`
              group relative flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full font-medium tracking-wide transition-all duration-300 shadow-2xl text-sm md:text-base
              ${
                isSessionActive
                  ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-105"
              }
            `}
          >
            {isSessionActive ? (
              <>
                <MicOff size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">End</span>
              </>
            ) : (
              <>
                <Mic size={16} className="md:w-5 md:h-5 group-hover:animate-bounce" />
                <span className="hidden sm:inline">Start</span>
              </>
            )}
          </button>

          {isSongOpen && (
            <button
              onClick={stopSong}
              className="group relative flex items-center gap-1 md:gap-2 px-4 md:px-6 py-3 md:py-4 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30 transition-all duration-300 shadow-2xl text-sm md:text-base"
              title="Stop song"
            >
              <Trash2 size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}
          
          {!isSessionActive && (
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="p-3 md:p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-2xl"
              title="Type"
            >
              <Keyboard size={16} className="opacity-70 md:w-5 md:h-5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
