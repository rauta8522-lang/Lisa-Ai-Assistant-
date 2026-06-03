import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, VolumeX, Keyboard, Send, Trash2, MessageSquare, X, Settings, LogOut, ChevronUp, ChevronDown, History } from "lucide-react";
import { getLisaResponse, getLisaAudio, resetLisaSession } from "./services/geminiService";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import PermissionModal from "./components/PermissionModal";
import { playPCM, resumeAudioContext } from "./utils/audioUtils";
import { Platform, Features, Network } from "./utils/platformUtils";
import { motion, AnimatePresence } from "framer-motion";
import { generateNotes } from "./services/notesService";
import SettingsMenu from "./components/SettingsMenu";
import { db } from "./config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApkDownload from "./pages/ApkDownload";
import LoginPage from "./pages/LoginPage";

type AppState = "idle" | "listening" | "processing" | "speaking";

interface ChatMessage {
  id: string;
  sender: "user" | "lisa";
  text: string;
  timestamp: number;
  type?: "text" | "voice";
}

const HISTORY_STORAGE_KEY = "lisa_chat_history";
const VOICE_HISTORY_KEY = "lisa_voice_history";
const MAX_STORED_HISTORY = 100;
const MAX_DISPLAY_MESSAGES = 30;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  // All state declarations must come before any useEffect hooks
  const [diagramPrompt, setDiagramPrompt] = useState("");
  const [appState, setAppState] = useState<AppState>("idle");
  const [deviceType] = useState(Platform.getDeviceType());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceHistory, setVoiceHistory] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [accent, setAccent] = useState<"sky" | "violet" | "pink">("sky");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSongOpen, setIsSongOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("lisa_user_session") === "true");
  const [showConversation, setShowConversation] = useState(false);
  const [showVoiceHistory, setShowVoiceHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStudyAssistant, setShowStudyAssistant] = useState(false);

  const messagesRef = useRef(messages);
  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const songWindowRef = useRef<Window | null>(null);

  // Track app installation
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

  // Load saved history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setMessages(parsed.slice(-MAX_STORED_HISTORY));
        }
      } catch (err) {
        console.error("Failed to restore chat history:", err);
      }
    }

    // Load voice history
    const voiceSaved = localStorage.getItem(VOICE_HISTORY_KEY);
    if (voiceSaved) {
      try {
        const parsed = JSON.parse(voiceSaved) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setVoiceHistory(parsed.slice(-MAX_STORED_HISTORY));
        }
      } catch (err) {
        console.error("Failed to restore voice history:", err);
      }
    }
  }, []);

  // Save voice history to localStorage
  useEffect(() => {
    const trimmed = voiceHistory.slice(-MAX_STORED_HISTORY);
    localStorage.setItem(VOICE_HISTORY_KEY, JSON.stringify(trimmed));
  }, [voiceHistory]);

  useEffect(() => {
    messagesRef.current = messages;
    const trimmed = messages.slice(-MAX_STORED_HISTORY);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  }, [messages]);

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
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("lisa_user_session", "true");
    } else {
      localStorage.removeItem("lisa_user_session");
    }
  }, [isLoggedIn]);

  const stopSong = () => {
    if (songWindowRef.current && !songWindowRef.current.closed) {
      songWindowRef.current.close();
    }
    songWindowRef.current = null;
    setIsSongOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusDescription = (state: AppState) => {
    switch (state) {
      case "listening":
        return "Lisa is listening...";
      case "processing":
        return "Lisa is thinking...";
      case "speaking":
        return "Lisa is speaking...";
      default:
        return "Tap the orb to begin";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const clearVoiceHistory = () => {
    setVoiceHistory([]);
    localStorage.removeItem(VOICE_HISTORY_KEY);
  };

  // Save message to voice history
  const saveToVoiceHistory = (message: ChatMessage) => {
    setVoiceHistory((prev) => [...prev, { ...message, type: "voice" }]);
  };

  const displayMessages = messages.slice(-MAX_DISPLAY_MESSAGES);

  const getStateColor = (state: AppState) => {
    switch (state) {
      case "listening":
        return "violet";
      case "processing":
      case "speaking":
        return "pink";
      default:
        return "sky";
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
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: finalTranscript, timestamp: Date.now() }]);

    if (
      lowerTranscript.includes("notes") ||
      lowerTranscript.includes("handwritten notes") ||
      lowerTranscript.includes("study notes")
    ) {
      setAppState("processing");
      const data = await generateNotes(finalTranscript);
      setGeneratedNotes(data.notes);
      setDiagramPrompt(data.diagramPrompt);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-l",
          sender: "lisa",
          text: "Notes generated successfully.",
          timestamp: Date.now(),
        },
      ]);
      setAppState("idle");
      return;
    }

    if (songWindowRef.current && /\b(?:stop|pause|halt|band|rok|ruk|band kar|rok do|pause kar|pause karo)\b/.test(lowerTranscript)) {
      stopSong();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-l",
          sender: "lisa",
          text: "The song has been stopped.",
          timestamp: Date.now(),
        },
      ]);
      setAppState("idle");
      return;
    }

    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");

    const commandResult = await processCommand(finalTranscript);
    let responseText = "";

    if (commandResult.shouldStop) {
      responseText = commandResult.action;
      stopSong();
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText, timestamp: Date.now() }]);
      setAppState("idle");
      return;
    }

    if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText, timestamp: Date.now() }]);
      let opened: Window | null = null;
      if (commandResult.url) {
        if (deviceType === "mobile" || deviceType === "tablet") {
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
      responseText = await getLisaResponse(finalTranscript, messagesRef.current);
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText, timestamp: Date.now() }]);

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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone capture is not supported in this browser. Please use a different browser or device.");
        setShowTextInput(true);
        return;
      }

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
        const messageId = Date.now().toString() + "-" + sender;
        const message = { id: messageId, sender, text, timestamp: Date.now() };
        setMessages((prev) => [...prev, message]);

        // Save to voice history for all voice interactions
        saveToVoiceHistory(message);

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
                timestamp: Date.now(),
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
                timestamp: Date.now(),
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
  }, [isSessionActive]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    handleTextCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Dynamic background gradient based on state
  const getBackgroundGradient = () => {
    switch (appState) {
      case "listening":
        return "from-violet-950 via-slate-950 to-slate-950";
      case "processing":
      case "speaking":
        return "from-pink-950 via-slate-950 to-slate-950";
      default:
        return "from-sky-950 via-slate-950 to-slate-950";
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className={`min-h-[100dvh] w-screen overflow-hidden text-white font-sans relative m-0 p-0 safe-area ${getBackgroundGradient()} transition-colors duration-1000`}>
            {isOffline && (
              <div className="fixed inset-x-0 top-0 z-50 bg-red-500/90 text-white py-2 text-center text-xs md:text-sm backdrop-blur-sm">
                You are offline. Some features may not work.
              </div>
            )}
            {showPermissionModal && (
              <PermissionModal onClose={() => setShowPermissionModal(false)} />
            )}

            {/* Full-screen Visualizer Background */}
            <div className="absolute inset-0 z-0">
              <Visualizer state={appState} accent={accent} />
            </div>

            {/* Top Header Bar */}
            <header className="relative z-20 flex items-center justify-between px-4 md:px-6 py-3 backdrop-blur-sm bg-black/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-violet-500 to-pink-500 text-base font-bold text-slate-950 shadow-xl">
                  L
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lisa AI</p>
                  <p className="text-xs text-slate-500">{getStatusDescription(appState)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Accent Color Selector */}
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1">
                  {(["sky", "violet", "pink"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAccent(mode)}
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold transition ${
                        accent === mode
                          ? "bg-white/20 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode === "sky" ? "🔵" : mode === "violet" ? "🟣" : "🩷"}
                    </button>
                  ))}
                </div>

                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-slate-300 transition hover:bg-black/50 hover:text-white"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Conversation Toggle (Text Chat) */}
                <button
                  onClick={() => setShowConversation(!showConversation)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-slate-300 transition hover:bg-black/50 hover:text-white"
                >
                  <MessageSquare size={18} />
                </button>

                {/* Voice History Toggle */}
                <button
                  onClick={() => setShowVoiceHistory(!showVoiceHistory)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-slate-300 transition hover:bg-black/50 hover:text-white"
                >
                  <History size={18} />
                </button>

                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-slate-300 transition hover:bg-black/50 hover:text-white"
                >
                  <Settings size={18} />
                </button>
              </div>
            </header>

            {/* Central LISA Button - Main Interaction Point */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <motion.button
                onClick={toggleListening}
                className="pointer-events-auto relative flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Outer Glow Ring */}
                <div
                  className={`absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse ${
                    appState === "listening"
                      ? "bg-violet-500"
                      : appState === "processing" || appState === "speaking"
                      ? "bg-pink-500"
                      : "bg-sky-500"
                  }`}
                  style={{ width: "280px", height: "280px" }}
                />

                {/* Animated Rings */}
                <AnimatePresence>
                  {isSessionActive && (
                    <>
                      <motion.div
                        className="absolute rounded-full border-2 border-white/20"
                        style={{ width: "240px", height: "240px" }}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute rounded-full border border-white/15"
                        style={{ width: "240px", height: "240px" }}
                        initial={{ scale: 0.8, opacity: 0.3 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Main Button Container */}
                <div
                  className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-500 ${
                    appState === "listening"
                      ? "shadow-violet-500/50"
                      : appState === "processing" || appState === "speaking"
                      ? "shadow-pink-500/50"
                      : "shadow-sky-500/50"
                  }`}
                  style={{ width: "200px", height: "200px" }}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 via-violet-500 to-pink-500 opacity-90" />

                  {/* Inner Circle */}
                  <div className="relative flex h-[160px] w-[160px] items-center justify-center rounded-full bg-slate-900/90">
                    {appState === "listening" ? (
                      <Mic className="text-white animate-pulse" size={48} />
                    ) : appState === "processing" || appState === "speaking" ? (
                      <Loader2 className="text-white animate-spin" size={48} />
                    ) : (
                      <div className="text-center">
                        <span className="text-3xl font-bold tracking-[0.2em] text-white">LISA</span>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Tap to Start</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Text Below Button */}
                <div className="absolute -bottom-16 text-center">
                  <p className="text-sm text-slate-300">{getStatusDescription(appState)}</p>
                  {isSessionActive && (
                    <p className="text-xs text-slate-500 mt-1">Click again to stop</p>
                  )}
                </div>
              </motion.button>
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-4 px-4 py-4 backdrop-blur-sm bg-gradient-to-t from-black/80 to-transparent">
              {/* Text Input Toggle */}
              <motion.button
                onClick={() => setShowTextInput(!showTextInput)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-300 transition hover:bg-black/60 hover:text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Keyboard size={16} />
                {showTextInput ? "Close" : "Type"}
              </motion.button>

              {/* Stop Music (if playing) */}
              {isSongOpen && (
                <motion.button
                  onClick={stopSong}
                  className="flex items-center gap-2 rounded-full bg-rose-500/80 px-4 py-3 text-sm text-white transition hover:bg-rose-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 size={16} />
                  Stop Music
                </motion.button>
              )}
            </div>

            {/* Text Input Modal */}
            <AnimatePresence>
              {showTextInput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 left-4 right-4 z-30 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[500px]"
                >
                  <form onSubmit={handleTextSubmit} className="flex items-center gap-2 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your message to Lisa..."
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!textInput.trim()}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    >
                      <Send size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTextInput(false);
                        setTextInput("");
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conversation Panel (Slide-in from right) */}
            <AnimatePresence>
              {showConversation && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowConversation(false)}
                    className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm"
                  />

                  {/* Panel */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 z-40 h-full w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Conversation</h2>
                        <p className="text-xs text-slate-400">{displayMessages.length} messages</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                          <button
                            onClick={clearChatHistory}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/30 text-rose-400 transition hover:bg-rose-500/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setShowConversation(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {displayMessages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                          No messages yet. Start a conversation!
                        </div>
                      ) : (
                        displayMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3 ${
                                message.sender === "user"
                                  ? "bg-sky-500/20 border border-sky-500/30 text-white"
                                  : "bg-slate-800/80 border border-white/10 text-slate-100"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{formatTimestamp(message.timestamp)}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Conversation Input */}
                    <div className="flex items-center gap-2 p-3 border-t border-white/10">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && textInput.trim()) {
                            handleTextSubmit(e);
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
                      />
                      <button
                        onClick={(e) => handleTextSubmit(e as any)}
                        disabled={!textInput.trim()}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-16 right-4 z-40 w-64 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl"
                >
                  <SettingsMenu onLogout={handleLogout} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Study Assistant Button - Always visible */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-24 right-4 z-20 flex items-center gap-2 rounded-full bg-violet-500/80 px-4 py-3 text-sm text-white transition hover:bg-violet-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStudyAssistant(true)}
            >
              📝 Notes
            </motion.button>

            {/* Study Assistant Panel */}
            <AnimatePresence>
              {showStudyAssistant && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowStudyAssistant(false)}
                    className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm"
                  />

                  {/* Panel */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 right-0 z-40 h-[80vh] bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl flex flex-col"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Study Assistant</h2>
                        <p className="text-xs text-slate-400">
                          {generatedNotes ? "Notes generated - ready to view/download" : "Ask Lisa to generate study notes"}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowStudyAssistant(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {generatedNotes ? (
                        <div className="space-y-4">
                          {/* PDF Download Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                // Import PDF generator
                                import("./components/PDFGenerator").then(mod => {
                                  mod.setNotesForPDF(generatedNotes, diagramPrompt ? `https://image.pollinations.ai/prompt/${encodeURIComponent(diagramPrompt)}` : "");
                                  setTimeout(() => mod.downloadPDF(), 500);
                                });
                              }}
                              className="flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                            >
                              📄 Download PDF
                            </button>
                          </div>

                          {/* Notes Content */}
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <div className="font-['Caveat'] text-lg leading-relaxed text-slate-200 whitespace-pre-wrap">
                              {generatedNotes}
                            </div>
                          </div>

                          {/* Diagram if available */}
                          {diagramPrompt && (
                            <div className="rounded-2xl border border-white/10 overflow-hidden">
                              <img
                                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(diagramPrompt)}`}
                                alt="Diagram"
                                crossOrigin="anonymous"
                                className="w-full"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="text-6xl mb-4">📘</div>
                          <h3 className="text-xl font-semibold text-white mb-2">No Notes Yet</h3>
                          <p className="text-slate-400 max-w-sm">
                            Ask Lisa to generate study notes by saying something like:<br/>
                            <span className="text-sky-400">"Generate notes on photosynthesis"</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Voice History Panel */}
            <AnimatePresence>
              {showVoiceHistory && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowVoiceHistory(false)}
                    className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm"
                  />

                  {/* Panel */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 z-40 h-full w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Voice History</h2>
                        <p className="text-xs text-slate-400">{voiceHistory.length} voice interactions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {voiceHistory.length > 0 && (
                          <button
                            onClick={clearVoiceHistory}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/30 text-rose-400 transition hover:bg-rose-500/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setShowVoiceHistory(false)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Voice History Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {voiceHistory.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                          No voice interactions yet. Tap the LISA button to start!
                        </div>
                      ) : (
                        voiceHistory.slice(-MAX_DISPLAY_MESSAGES).map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3 ${
                                message.sender === "user"
                                  ? "bg-violet-500/20 border border-violet-500/30 text-white"
                                  : "bg-slate-800/80 border border-white/10 text-slate-100"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{formatTimestamp(message.timestamp)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        } />
        <Route path="/download" element={<ApkDownload />} />
      </Routes>
    </BrowserRouter>
  );
}