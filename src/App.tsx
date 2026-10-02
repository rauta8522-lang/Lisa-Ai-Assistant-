import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, VolumeX, Keyboard, Send, Trash2, User, Settings, MessageSquare, Palette, BookOpen, MessageCircle, FileText, X, Play, Camera, RefreshCw, Crown, FileSearch, Shield, Brain, Sparkles, Clock, Edit3, Check, RotateCcw, Plus, UserCheck, Database, Wand2, Tag, Search, Filter, ShieldCheck, Briefcase, Activity, HeartPulse, GraduationCap, Compass, Play as PlayIcon, Code, ShieldAlert } from "lucide-react";
import { getLisaResponse, getLisaAudio, resetLisaSession, sendLisaMessageWithRetry, fetchConversationMessages, fetchConversations, deleteConversationApi, updateConversationTitleApi, fetchUserFactsApi, synthesizeCustomPersonaApi } from "./services/geminiService";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import { ConnectionStatus, PersonaConfig, ConversationSession, ExtractedFact } from "./core/memory/types";
import { DEFAULT_PERSONAS, ContextBuilder } from "./core/memory/ContextBuilder";
import { AdaptivePersonaEngine, ARCHETYPE_CATALOG } from "./core/memory/AdaptivePersonaEngine";
import { ConnectionStatusBar } from "./components/ConnectionStatusBar";
import { PersonaActivationToast, PersonaToastData } from "./components/PersonaActivationToast";
import VRMAvatar from "./components/VRMAvatar";
import Visualizer from "./components/Visualizer";
import { characterManager } from "./core/character/CharacterManager";
import { LisaExpression } from "./core/character/types";
import PermissionModal from "./components/PermissionModal";
import LoginScreen from "./components/LoginScreen";
import ProfileModal from "./components/ProfileModal";
import StudyStudio from "./components/StudyStudio";
import PDFMaker from "./components/PDFMaker";
import BiometricLockScreen from "./components/BiometricLockScreen";
import { DocumentInspectorModal } from "./components/DocumentInspectorModal";
import { AdminPanelModal } from "./components/AdminPanelModal";
import MediaWidget from "./components/MediaWidget";
import { analytics } from "./services/analyticsService";
import { parseDocumentApi } from "./services/documentService";
import { DocumentRecord } from "./core/documents/DocumentIntelligenceEngine";
import { GreetingEngine } from "./core/greeting/GreetingEngine";
import { playPCM } from "./utils/audioUtils";
import { getLisaPreferredVoice } from "./utils/voiceUtils";
import { ComputerAgent } from "./core/computer/ComputerAgent";
import { ComputerTaskPlanner } from "./core/computer/ComputerTaskPlanner";
import { ComputerTaskPlan, ComputerAgentStatus } from "./core/computer/ComputerTaskTypes";
import { ComputerAgentWidget } from "./components/ComputerAgentWidget";
import { motion, AnimatePresence } from "motion/react";
import { THEME_PALETTES, ThemePalette } from "./utils/theme";
import { getUserAvatarUrl } from "./utils/avatar";
import { parseWhatsAppCommand, getWhatsAppContacts, linkWhatsAppContact, getWhatsAppUrl } from "./utils/whatsapp";
import { auth, db } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, query, getDocs, addDoc, updateDoc, setDoc } from "firebase/firestore";

const APP_VERSION = "2.0.2";
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

function detectAndPlayMedia(text: string): { type: "youtube" | "spotify"; query: string; mode: "play" | "search" } | null {
  const norm = text.toLowerCase().trim();

  let type: "youtube" | "spotify" = "youtube";
  if (norm.includes("spotify")) {
    type = "spotify";
  }

  // Detect search vs play intent
  const isSearchIntent =
    norm.includes("search") ||
    norm.includes("khojo") ||
    norm.includes("khojna") ||
    norm.includes("dhundho") ||
    norm.includes("dhoondho") ||
    norm.includes("dhoondo") ||
    norm.includes("dhundo") ||
    norm.includes("results") ||
    norm.includes("find");

  const mode: "play" | "search" = isSearchIntent ? "search" : "play";

  // Verify it qualifies as a media command
  const hasMediaKeywords =
    norm.includes("youtube") ||
    norm.includes("utube") ||
    norm.includes("spotify") ||
    norm.includes("play") ||
    norm.includes("chalao") ||
    norm.includes("bajao") ||
    norm.includes("sunao") ||
    norm.includes("suna") ||
    norm.includes("chalana") ||
    norm.includes("chala") ||
    norm.includes("baja") ||
    norm.includes("gana") ||
    norm.includes("song") ||
    norm.includes("video") ||
    norm.includes("search") ||
    norm.includes("khojo") ||
    norm.includes("dhundho") ||
    norm.includes("dhoondho");

  if (!hasMediaKeywords) {
    return null;
  }

  // Clean the query strictly
  let query = norm;

  // Remove platforms
  query = query.replace(/\byoutube\b/g, "")
               .replace(/\byutube\b/g, "")
               .replace(/\bspotify\b/g, "");

  // Remove action verbs/fillers
  query = query.replace(/\bplay\b/g, "")
               .replace(/\bsearch\b/g, "")
               .replace(/\bkaro\b/g, "")
               .replace(/\bkro\b/g, "")
               .replace(/\bkar\b/g, "")
               .replace(/\bkhojo\b/g, "")
               .replace(/\bkhojna\b/g, "")
               .replace(/\bdhundho\b/g, "")
               .replace(/\bdhoondho\b/g, "")
               .replace(/\bdhoondo\b/g, "")
               .replace(/\bdhundo\b/g, "")
               .replace(/\bfind\b/g, "")
               .replace(/\bresults\b/g, "")
               .replace(/\bchalao\b/g, "")
               .replace(/\bbajao\b/g, "")
               .replace(/\bsunao\b/g, "")
               .replace(/\bsuna\b/g, "")
               .replace(/\bchalana\b/g, "")
               .replace(/\bbaja\b/g, "")
               .replace(/\bchala\b/g, "")
               .replace(/\bdekhna\b/g, "")
               .replace(/\bdikhao\b/g, "");

  // Remove common media suffixes
  query = query.replace(/\bka\s+song\b/g, " ")
               .replace(/\bka\s+video\b/g, " ")
               .replace(/\bka\s+gan[aa]\b/g, " ")
               .replace(/\bka\s+music\b/g, " ")
               .replace(/\bka\s+gaan\b/g, " ")
               .replace(/\bka\s+ganna\b/g, " ")
               .replace(/\bsong\b/g, " ")
               .replace(/\bvideo\b/g, " ")
               .replace(/\bgan[aa]\b/g, " ")
               .replace(/\bmusic\b/g, " ")
               .replace(/\bgaan\b/g, " ")
               .replace(/\bganna\b/g, " ")
               .replace(/\btrack\b/g, " ")
               .replace(/\bpe\b/g, " ")
               .replace(/\bpar\b/g, " ")
               .replace(/\bp\b/g, " ")
               .replace(/\bon\b/g, " ");

  query = query.replace(/\s+/g, " ").trim();

  if (query.length > 1) {
    return { type, query, mode };
  }

  return null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [currentUser, setCurrentUser] = useState<{uid: string; email: string; name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({uid: user.uid, email: user.email!, name: user.displayName || "User",});
        analytics.track("login", { feature: "auth", organization: "global" });
      } else {
        setCurrentUser(null);
      }
    });
    analytics.track("session_started", { feature: "core" });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const autoBypassOldCache = async () => {
      try {
        // 1. सर्वर से ताज़ा version.json फ़ाइल मँगाएँ (बिना कैशे के)
        const res = await fetch("/version.json?t=" + Date.now(), {
          cache: "no-store",
        });
        const data = await res.json();

        // लोकल स्टोरेज में सेव पुराना वर्जन देखें
        const currentVersion = localStorage.getItem("lisa_pwa_version");

        // 2. अगर सर्वर का वर्जन लोकल वर्जन से अलग है
        if (currentVersion && data.version !== currentVersion) {
          console.log("New version detected! Wiping old browser cache...");

          // 3. लोकल स्टोरेज और ब्राउज़र कैशे को पूरी तरह खाली करें
          localStorage.clear();
          if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
          }

          // 4. पुराने सर्विस वर्कर को हटाएँ (Unregister)
          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
              await registration.unregister();
            }
          }

          // नया वर्जन लोकल स्टोरेज में सेट करें
          localStorage.setItem("lisa_pwa_version", data.version);

          // 5. पेज को हार्ड रीलोड (Force Refresh) करें
          window.location.reload();
        } else {
          // पहली बार ऐप इंस्टॉल होने पर वर्जन सेट करें
          localStorage.setItem("lisa_pwa_version", data.version || APP_VERSION);
        }
      } catch (error) {
        console.error("Cache auto-update check failed:", error);
      }
    };

    autoBypassOldCache();
  }, []);

  const [isAppUnlocked, setIsAppUnlocked] = useState<boolean>(() => {
    const active = localStorage.getItem("lisa_active_user");
    if (active) {
      try {
        const parsed = JSON.parse(active);
        const pinLock = localStorage.getItem(`lisa_pin_lock_${parsed.email}`) === "true";
        return !pinLock;
      } catch (e) {
        return true;
      }
    }
    return true;
  });

  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      setCurrentUserAvatar(getUserAvatarUrl(currentUser.email, currentUser.name));
    } else {
      setCurrentUserAvatar("");
    }
  }, [currentUser]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("lisa_global_dark_mode") !== "false";
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isPDFMakerOpen, setIsPDFMakerOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return localStorage.getItem("lisa_active_conv_id") || ("conv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7));
  });

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("lisa_active_conv_id", activeConversationId);
    }
  }, [activeConversationId]);

  const [activePersona, setActivePersona] = useState<PersonaConfig>(() => {
    const saved = localStorage.getItem("lisa_active_persona");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_PERSONAS.default;
  });

  const [personaToast, setPersonaToast] = useState<PersonaToastData | null>(null);

  const triggerPersonaToast = useCallback((title: string, subtitle?: string, icon?: string, color?: string, durationMs = 3200) => {
    setPersonaToast({
      id: "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      title,
      subtitle,
      icon,
      color,
      durationMs
    });
  }, []);

  // Sync appState to characterManager
  useEffect(() => {
    switch (appState) {
      case "listening":
        characterManager.setAnimation("listening");
        characterManager.setExpression("focused");
        characterManager.setSpeaking(false);
        break;
      case "processing":
        characterManager.setAnimation("thinking");
        characterManager.setExpression("thinking");
        characterManager.setSpeaking(false);
        break;
      case "speaking":
        characterManager.setAnimation("talking");
        characterManager.setSpeaking(true);
        break;
      case "idle":
        characterManager.setAnimation("idle");
        characterManager.setExpression("neutral");
        characterManager.setSpeaking(false);
        break;
    }
  }, [appState]);

  // Sync persona to characterManager
  useEffect(() => {
    if (activePersona) {
      characterManager.setPersona(activePersona.id);
    }
  }, [activePersona]);

  // Rudimentary sentiment-based expression picker
  const pickExpressionFromText = (text: string): LisaExpression => {
    const t = text.toLowerCase();
    if (t.includes("!") || t.includes("wow") || t.includes("great") || t.includes("amazing")) return "excited";
    if (t.includes("sorry") || t.includes("sad") || t.includes("apologize")) return "sad";
    if (t.includes("haha") || t.includes("lol") || t.includes("funny") || t.includes("hehe")) return "happy";
    if (t.includes("what") || t.includes("?") || t.includes("don't know")) return "confused";
    if (t.includes("take care") || t.includes("help") || t.includes("support")) return "supportive";
    return "neutral";
  };

  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Lisa Hub Consolidated Memory/Persona states
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [facts, setFacts] = useState<ExtractedFact[]>([]);
  const [isLoadingHubData, setIsLoadingHubData] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingConvTitle, setEditingConvTitle] = useState("");
  const [personaSearchQuery, setPersonaSearchQuery] = useState("");
  const [personaCategoryFilter, setPersonaCategoryFilter] = useState("all");
  const [customPersonaQuery, setCustomPersonaQuery] = useState("");
  const [isSynthesizingPersona, setIsSynthesizingPersona] = useState(false);
  const [newFactInput, setNewFactInput] = useState("");
  const [isAddingFact, setIsAddingFact] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "history" | "personas" | "memory">("chat");

  const [currentTopic, setCurrentTopic] = useState<string>(() => {
    return localStorage.getItem("lisa_active_topic") || "";
  });

  // Universal Computer / Desktop Control Agent State
  const [computerPlan, setComputerPlan] = useState<ComputerTaskPlan | null>(() => ComputerAgent.restorePersistedTask());
  const [computerStatus, setComputerStatus] = useState<ComputerAgentStatus>(() => {
    const saved = ComputerAgent.restorePersistedTask();
    return saved ? saved.status : "idle";
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem("lisa_active_conv_id", activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem("lisa_active_persona", JSON.stringify(activePersona));
    if (liveSessionRef.current) {
      liveSessionRef.current.updateContext({ activePersona });
    }
  }, [activePersona]);

  useEffect(() => {
    localStorage.setItem("lisa_active_topic", currentTopic);
    if (liveSessionRef.current) {
      liveSessionRef.current.updateContext({ currentTopic });
    }
  }, [currentTopic]);

  // Stripe Subscription return & status banner
  const [subscriptionBanner, setSubscriptionBanner] = useState<{
    type: "success" | "activating" | "canceled";
    message: string;
  } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subStatus = urlParams.get("subscription");

    if (subStatus === "success") {
      setSubscriptionBanner({
        type: "activating",
        message: "Payment received. Activating Lisa Pro 💎...",
      });

      // Clear query params from browser URL safely
      window.history.replaceState({}, document.title, window.location.pathname);

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const user = auth.currentUser;
          if (!user) return;
          const token = await user.getIdToken(true);
          const res = await fetch("/api/subscription/status", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.plan === "paid" && data.subscriptionStatus === "active") {
            clearInterval(interval);
            setSubscriptionBanner({
              type: "success",
              message: "Welcome to Lisa Pro 💎! DeepSeek AI + Gemini Lisa Voice activated.",
            });
            setTimeout(() => {
              setSubscriptionBanner(null);
            }, 8000);
          } else if (attempts >= 10) {
            clearInterval(interval);
            setSubscriptionBanner({
              type: "success",
              message: "Payment received! Lisa Pro will activate shortly.",
            });
            setTimeout(() => {
              setSubscriptionBanner(null);
            }, 8000);
          }
        } catch (err) {
          if (attempts >= 10) clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    } else if (subStatus === "canceled") {
      setSubscriptionBanner({
        type: "canceled",
        message: "Checkout canceled. You remain on Lisa Free.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        setSubscriptionBanner(null);
      }, 6000);
    }
  }, [currentUser]);

  // Home Screen Vision Chat Camera states
  const [isChatWebcamActive, setIsChatWebcamActive] = useState(false);
  const [chatWebcamStream, setChatWebcamStream] = useState<MediaStream | null>(null);
  const [chatCapturedImage, setChatCapturedImage] = useState<string | null>(null);
  const [chatCameraLoading, setChatCameraLoading] = useState(false);
  const chatWebcamRef = useRef<HTMLVideoElement | null>(null);

  // Home Screen Vision Chat Camera helpers
  const startChatWebcam = async () => {
    setChatCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      setChatWebcamStream(stream);
      setIsChatWebcamActive(true);
      setTimeout(() => {
        if (chatWebcamRef.current) {
          chatWebcamRef.current.srcObject = stream;
        }
      }, 150);
    } catch (err) {
      console.error("Failed to access camera", err);
      alert("Uh-oh! Camera block ya missing hai malka!");
    } finally {
      setChatCameraLoading(false);
    }
  };

  const stopChatWebcam = useCallback(() => {
    if (chatWebcamStream) {
      chatWebcamStream.getTracks().forEach((track) => track.stop());
      setChatWebcamStream(null);
    }
    setIsChatWebcamActive(false);
  }, [chatWebcamStream]);

  const captureChatPhoto = () => {
    const video = chatWebcamRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setChatCapturedImage(dataUrl);
      stopChatWebcam();
    }
  };

  // NEW: Restoration effect for persistent memory
  useEffect(() => {
    if (currentUser && activeConversationId && messages.length === 0) {
      console.log(`[LISA MEMORY] Initializing session recovery for ${activeConversationId}`);
      handleHubSelectConversation(activeConversationId);
    }
  }, [currentUser, activeConversationId]);

  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [memorySearchQuery, setMemorySearchQuery] = useState("");

  const filteredConversations = conversations.filter(c =>
    (c.title?.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
     c.topics?.some(t => t.toLowerCase().includes(historySearchQuery.toLowerCase())))
  );

  const filteredFacts = facts.filter(f =>
    (f.content?.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
     f.category?.toLowerCase().includes(memorySearchQuery.toLowerCase()))
  );

  const handleHubDeleteAllFacts = async () => {
    if (!confirm("Are you sure you want to clear ALL memories? This cannot be undone.")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch("/api/memory/facts", {
        method: "DELETE",
        headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) }
      });
      setFacts([]);
    } catch (e) {
      console.error("Failed to clear memories:", e);
    }
  };

  const formatTopic = (topic: string) => {
    return topic.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };
  const loadLisaHubData = useCallback(async () => {
    setIsLoadingHubData(true);
    try {
      const [convList, factList] = await Promise.all([
        fetchConversations(),
        fetchUserFactsApi()
      ]);
      setConversations(convList);
      setFacts(factList);
    } catch (e) {
      console.error("Error loading Lisa Hub data:", e);
    } finally {
      setIsLoadingHubData(false);
    }
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      loadLisaHubData();
    }
  }, [isChatOpen, loadLisaHubData]);

  const handleHubSelectConversation = async (convId: string) => {
    if (convId === activeConversationId && messages.length > 0) return;
    setIsLoadingHubData(true);
    try {
      const { messages: loadedMsgs } = await fetchConversationMessages(convId);
      setActiveConversationId(convId);
      if (loadedMsgs && loadedMsgs.length > 0) {
        const mapped: ChatMessage[] = loadedMsgs.map(m => ({
          id: m.id || String(m.timestamp),
          sender: (m.sender === "user" ? "user" : "lisa") as "user" | "lisa",
          text: m.text
        }));
        setMessages(mapped);
      } else {
        setMessages([]);
      }
      resetLisaSession();
      analytics.track("session_resumed", { conversationId: convId });
    } catch (e) {
      console.error("Error opening conversation:", e);
    } finally {
      setIsLoadingHubData(false);
    }
  };

  const handleHubDeleteConversation = async (convId: string) => {
    if (!confirm("Are you sure?")) return;
    const ok = await deleteConversationApi(convId);
    if (ok) {
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (convId === activeConversationId) {
        const newId = "conv_" + Date.now();
        setActiveConversationId(newId);
        setMessages([]);
        resetLisaSession();
      }
    }
  };

  const handleHubSaveRename = async (convId: string) => {
    if (!editingConvTitle.trim()) return;
    const ok = await updateConversationTitleApi(convId, editingConvTitle.trim());
    if (ok) {
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: editingConvTitle.trim() } : c));
    }
    setEditingConvId(null);
  };

  const handleHubSynthesizePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPersonaQuery.trim() || isSynthesizingPersona) return;
    setIsSynthesizingPersona(true);
    try {
      const synthesized = await synthesizeCustomPersonaApi(customPersonaQuery.trim()) ||
        AdaptivePersonaEngine.buildDynamicPersona(customPersonaQuery.trim(), true);
      if (synthesized) {
        setActivePersona(synthesized);
        localStorage.setItem("lisa_active_persona", JSON.stringify(synthesized));
        setCustomPersonaQuery("");
        if (liveSessionRef.current) {
          liveSessionRef.current.updateContext({ activePersona: synthesized });
        }
        triggerPersonaToast(
          `${synthesized.role || synthesized.name} Mode Activated`,
          synthesized.domain || "Custom Specialty",
          synthesized.visualProfile?.icon,
          synthesized.visualProfile?.themeColor
        );
      }
    } finally {
      setIsSynthesizingPersona(false);
    }
  };

  const handleHubAddFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactInput.trim() || isAddingFact) return;
    setIsAddingFact(true);
    try {
      const res = await fetch("/api/memory/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fact: newFactInput.trim(), category: "personal" })
      });
      if (res.ok) {
        const data = await res.json();
        setFacts(prev => [data.fact, ...prev]);
        setNewFactInput("");
      }
    } finally {
      setIsAddingFact(false);
    }
  };

  const handleHubDeleteFact = async (factId: string) => {
    try {
      await fetch(`/api/memory/facts/${encodeURIComponent(factId)}`, { method: "DELETE" });
      setFacts(prev => prev.filter(f => f.id !== factId));
    } catch (e) { console.error(e); }
  };

  const getHubPersonaIcon = (id: string, iconName?: string) => {
    const key = (iconName || id || "").toLowerCase();
    if (key.includes("heart") || key.includes("hospital")) return <HeartPulse size={14} className="text-rose-400" />;
    if (key.includes("compass") || key.includes("zoo")) return <Compass size={14} className="text-emerald-400" />;
    if (key.includes("grad") || key.includes("teach")) return <GraduationCap size={14} className="text-cyan-400" />;
    if (key.includes("code") || key.includes("dev")) return <Code size={14} className="text-amber-400" />;
    if (key.includes("law") || key.includes("legal")) return <ShieldAlert size={14} className="text-indigo-400" />;
    if (key.includes("briefcase") || key.includes("interview")) return <Briefcase size={14} className="text-blue-400" />;
    if (key.includes("book") || key.includes("research")) return <BookOpen size={14} className="text-yellow-400" />;
    return <Sparkles size={14} className="text-fuchsia-400" />;
  };

  const formatHubTimestamp = (ts?: number) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const [activePalette, setActivePalette] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem("lisa_ui_palette");
    if (saved && (saved === "deep-space" || saved === "neon-sunset" || saved === "monochrome")) {
      return THEME_PALETTES[saved];
    }
    return THEME_PALETTES["deep-space"];
  });
  const [showPaletteDropdown, setShowPaletteDropdown] = useState(false);

  useEffect(() => {
    localStorage.setItem("lisa_ui_palette", activePalette.id);
  }, [activePalette]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef(messages);
  const handleLisaSpeakRef = useRef<(phrase: string) => Promise<void>>(async () => {});
  const handleGreetingDeliveredRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // ARCHITECTURE INTEGRATION: Thread-Scoped History Restoration
  // Fetches the exact message history for the active conversation across reloads.
  useEffect(() => {
    if (currentUser && activeConversationId) {
      let isMounted = true;
      const loadConversation = async () => {
        try {
          setAppState("processing");
          const { messages: loadedMessages } = await fetchConversationMessages(activeConversationId);

          if (!isMounted) return;

          if (loadedMessages && loadedMessages.length > 0) {
            const mappedMessages: ChatMessage[] = loadedMessages.map((m: any) => ({
              id: m.id || String(m.timestamp),
              sender: (m.sender === "user" ? "user" : "lisa") as "user" | "lisa",
              text: m.text
            }));

            setMessages(mappedMessages);
            messagesRef.current = mappedMessages;

            // Trigger Smart Greeting for restored conversation
            GreetingEngine.evaluateAndTriggerGreeting({
              currentUser,
              activeConversationId,
              isResumed: true,
              activePersona,
              userAgeTier: (localStorage.getItem("lisa_user_age_tier") as any) || "adult",
              messages: mappedMessages,
              onGreetingDelivered: (text) => handleGreetingDeliveredRef.current(text),
              handleLisaSpeak: (phrase) => handleLisaSpeakRef.current(phrase)
            });
          } else {
            // Check if user has previous conversations to restore session continuity
            try {
              const userConvs = await fetchConversations();
              if (isMounted && userConvs && userConvs.length > 0) {
                const latest = userConvs[0];
                if (latest && latest.id && latest.id !== activeConversationId) {
                  const { messages: latestMsgs } = await fetchConversationMessages(latest.id);
                  if (isMounted && latestMsgs && latestMsgs.length > 0) {
                    setActiveConversationId(latest.id);
                    const mapped = latestMsgs.map((m: any) => ({
                      id: m.id || String(m.timestamp),
                      sender: (m.sender === "user" ? "user" : "lisa") as "user" | "lisa",
                      text: m.text
                    }));
                    setMessages(mapped);
                    messagesRef.current = mapped;

                    // Trigger Smart Greeting for restored conversation
                    GreetingEngine.evaluateAndTriggerGreeting({
                      currentUser,
                      activeConversationId: latest.id,
                      isResumed: true,
                      activePersona,
                      userAgeTier: (localStorage.getItem("lisa_user_age_tier") as any) || "adult",
                      messages: mapped,
                      onGreetingDelivered: (text) => handleGreetingDeliveredRef.current(text),
                      handleLisaSpeak: (phrase) => handleLisaSpeakRef.current(phrase)
                    });
                    return;
                  }
                }
              }
            } catch (convFetchErr) {}

            if (isMounted) {
              setMessages([]);
              messagesRef.current = [];

              // Trigger Smart Greeting for fresh activation / new conversation
              GreetingEngine.evaluateAndTriggerGreeting({
                currentUser,
                activeConversationId,
                isResumed: false,
                activePersona,
                userAgeTier: (localStorage.getItem("lisa_user_age_tier") as any) || "adult",
                messages: [],
                onGreetingDelivered: (text) => handleGreetingDeliveredRef.current(text),
                handleLisaSpeak: (phrase) => handleLisaSpeakRef.current(phrase)
              });
            }
          }
        } catch (e) {
          console.error(`[LISA MEMORY] Failed to restore history for ${activeConversationId}:`, e);
        } finally {
          if (isMounted) setAppState("idle");
        }
      };
      loadConversation();
      return () => { isMounted = false; };
    } else if (!currentUser) {
      setMessages([]);
      messagesRef.current = [];
    }
  }, [currentUser, activeConversationId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Unified history context for both Chat and Voice paths
  const getUnifiedHistoryContextString = useCallback(() => {
    if (messages.length === 0) return "";
    const recent = messages.slice(-30);
    return recent
      .map((msg) => `${msg.sender === "user" ? "User" : "Lisa"}: "${msg.text}"`)
      .join("\n");
  }, [messages]);

  const [isMuted, setIsMuted] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: "youtube" | "spotify"; query: string; videoId?: string | null } | null>(null);

  // States: WhatsApp Prompter
  const [pendingWaMessage, setPendingWaMessage] = useState<{ name: string; message: string } | null>(null);
  const [inputWaNum, setInputWaNum] = useState("");

  const triggerWhatsAppLaunch = useCallback((name: string, message: string, phoneNumber?: string) => {
    let phone = phoneNumber;
    if (!phone && currentUser) {
      const list = getWhatsAppContacts(currentUser.email);
      const match = list.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (match && match.phone) {
        phone = match.phone;
      }
    }

    if (!phone) {
      // Open modal helper
      setPendingWaMessage({ name, message });
      setInputWaNum("");
      return false;
    }

    const targetUrl = getWhatsAppUrl(phone, message);
    try {
      window.open(targetUrl, "_blank");
    } catch (e) {
      console.error("WhatsApp Deep Link blocked by browser window constraints", e);
    }
    return true;
  }, [currentUser]);

  // Speaking dynamic phrase helper
  const handleLisaSpeak = useCallback(async (phrase: string) => {
    if (isMuted) {
      console.log("[LISA TTS] Skipped because app is muted");
      return;
    }
    setAppState("speaking");
    try {
      const preferredVoiceStr = getLisaPreferredVoice(currentUser);
      console.log(`[LISA TTS] Starting TTS with voice: ${preferredVoiceStr}`);
      const audioBase64 = await getLisaAudio(phrase, preferredVoiceStr);
      if (audioBase64) {
        await playPCM(audioBase64);
      } else {
        console.warn("[LISA TTS] Playback failed: No audio data returned (Gemini TTS quota or limit reached)");
      }
    } catch (e: any) {
      const safeMsg = e?.message || String(e);
      console.error(`[LISA TTS] Playback failed: ${safeMsg}`);
    } finally {
      setAppState("idle");
    }
  }, [isMuted, currentUser]);

  const addMessageToHistory = async (message: ChatMessage) => {
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "chatHistory", message.id), message);
        if (activeConversationId) {
          await setDoc(doc(db, "users", currentUser.uid, "conversations", activeConversationId, "messages", message.id), {
            ...message,
            conversationId: activeConversationId,
            timestamp: Date.now()
          });
        }
      } catch (e) {
        console.error("Failed to save message to Firestore history:", e);
      }
    }
  };

  const handleGreetingDelivered = useCallback((greetingText: string) => {
    const greetingMsg: ChatMessage = {
      id: Date.now().toString() + "-l-greeting",
      sender: "lisa",
      text: greetingText
    };
    setMessages((prev) => {
      if (prev.some((m) => m.text === greetingText)) return prev;
      return [...prev, greetingMsg];
    });
    addMessageToHistory(greetingMsg).catch((e) =>
      console.warn("[LISA GREETING] History sync failed:", e)
    );
  }, [activeConversationId, currentUser]);

  useEffect(() => {
    handleLisaSpeakRef.current = handleLisaSpeak;
    handleGreetingDeliveredRef.current = handleGreetingDelivered;
  }, [handleLisaSpeak, handleGreetingDelivered]);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
    }
  }, [isMuted]);

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
      setAppState("idle");
      return;
    }

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: "user", text: finalTranscript };
    setMessages((prev) => [...prev, newUserMessage]);
    addMessageToHistory(newUserMessage).catch((e) => console.error("Non-fatal history save error:", e));

    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    // Intercept permission confirmation if a computer task is waiting for approval
    const norm = finalTranscript.toLowerCase().trim();
    if (computerStatus === "waiting_permission" && computerPlan) {
      const isAffirmative = ["haan", "yes", "proceed", "kar do", "kardo", "theek hai", "sure", "ok", "aage badho", "ha", "bilkul"].some(w => norm.includes(w));
      const isNegative = ["nahi", "no", "mat karo", "cancel", "rok do", "nahin"].some(w => norm.includes(w));
      if (isAffirmative || isNegative) {
        setAppState("processing");
        const reply = await ComputerAgent.confirmAndResumeTask(isAffirmative, {
          onStatusChange: (st, pl) => {
            setComputerStatus(st);
            if (pl) setComputerPlan({ ...pl });
          },
          onStepProgress: (step, idx, total) => {
            if (computerPlan) setComputerPlan({ ...computerPlan });
          },
          onLisaSpeak: async (phrase) => {
            await handleLisaSpeak(phrase);
          }
        }, {
          uid: currentUser?.uid,
          userName: currentUser?.name
        });
        const replyMsg: ChatMessage = { id: Date.now().toString() + "-l-comp", sender: "lisa", text: reply };
        setMessages((prev) => [...prev, replyMsg]);
        addMessageToHistory(replyMsg).catch(console.warn);
        setAppState("idle");
        return;
      }
    }

    // Intercept Universal Computer / Desktop Control Agent Commands
    if (ComputerTaskPlanner.isComputerIntent(finalTranscript)) {
      setAppState("processing");
      const compRes = await ComputerAgent.processInput(finalTranscript, {
        onStatusChange: (st, pl) => {
          setComputerStatus(st);
          if (pl) setComputerPlan({ ...pl });
        },
        onConfirmationRequired: (prompt, pl) => {
          setComputerStatus("waiting_permission");
          setComputerPlan({ ...pl });
        },
        onStepProgress: (step, idx, total) => {
          if (computerPlan) setComputerPlan({ ...computerPlan });
        },
        onLisaSpeak: async (phrase) => {
          await handleLisaSpeak(phrase);
        }
      }, {
        uid: currentUser?.uid,
        userName: currentUser?.name
      });

      if (compRes.handled) {
        if (compRes.spokenResponse) {
          const compMsg: ChatMessage = { id: Date.now().toString() + "-l-comp", sender: "lisa", text: compRes.spokenResponse };
          setMessages((prev) => {
            if (prev.some(m => m.text === compRes.spokenResponse)) return prev;
            return [...prev, compMsg];
          });
          addMessageToHistory(compMsg).catch(console.warn);
        }
        setAppState("idle");
        return;
      }
    }

    // Intercept "stop", "roko", "band kro", etc. commands first
    const stopWords = ["stop", "roko", "band kro", "band karo", "band kar", "band krdo", "band kar do", "stop song", "stop video", "stop music", "gaana roko", "gana roko", "gaana band", "gana band", "pause song", "gaana band karo", "gana band karo", "gaana band kro", "gana band kro"];
    if (stopWords.some(word => norm.includes(word))) {
      setActiveMedia(null);
      setAppState("processing");
      const responses = [
        `Ji bilkul, gana band kar diya hai! 🤫 Ab bilkul shanti hai.`,
        `Le bhai, gana rokh diya hai maine. Chalo ab dobara dhyan lagate hain! 🎯`,
        `Rokh diya gana! Shanti mil gayi dimaag ko. Ab aur kya hukumnama hai? 😉`
      ];
      const responseText = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);

      await handleLisaSpeak(responseText);
      return;
    }

    // Intercept direct WhatsApp messaging commands
    const waParams = parseWhatsAppCommand(finalTranscript);
    if (waParams) {
      setAppState("processing");
      const launched = triggerWhatsAppLaunch(waParams.name, waParams.message);

      let responseText = "";
      if (launched) {
        responseText = `Haaanji! Maine background me WhatsApp message taiyar kar diya hai. ${waParams.name} ko chala dya hai deep link! 📈🚀`;
      } else {
        responseText = `Oho! Mujhe ${waParams.name} ka phone number nahi mila screen par. 📱 Ek baar please link kar lijiye custom directory me!`;
      }

      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);

      await handleLisaSpeak(responseText);
      return;
    }

    setAppState("processing");

    // Intercept direct media queries first (YouTube/Spotify embedding)
    const mediaToPlay = detectAndPlayMedia(finalTranscript);
    if (mediaToPlay) {
      const isYt = mediaToPlay.type === "youtube";
      const isPlayMode = mediaToPlay.mode === "play";
      let videoIdToUse: string | null = null;

      if (isYt && isPlayMode) {
        try {
          const resp = await fetch(`/api/youtube/search?q=${encodeURIComponent(mediaToPlay.query)}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.videoId) {
              videoIdToUse = data.videoId;
            }
          }
        } catch (fetchErr) {
          console.error("Error fetching videoId:", fetchErr);
        }
      }

      setActiveMedia({
        type: mediaToPlay.type,
        query: mediaToPlay.query,
        videoId: videoIdToUse
      });

      // Cleanup: We no longer auto-open external tabs if we have a resolved videoId to play in-app
      if (!isPlayMode) {
        const targetUrl = isYt
          ? (videoIdToUse ? `https://www.youtube.com/watch?v=${videoIdToUse}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(mediaToPlay.query)}`)
          : `https://open.spotify.com/search/${encodeURIComponent(mediaToPlay.query)}`;

        try {
          window.open(targetUrl, "_blank");
        } catch (err) {
          console.error("Popup window blocked", err);
        }
      }

      const responses = !isPlayMode
        ? [
            `Arre! Maine "${mediaToPlay.query}" search kar diya hai YouTube par. Results dekh lijiye! 🔍`,
            `Haaanji, maine naye tab me search results open kar diye hai. Hope you find what you want! 🧐`,
            `Le bobby, tumhari farmaish par search results हाजिर है! Chuno jo chuno! 😉`
          ]
        : (isYt && videoIdToUse
          ? [
              `Arre wah! Maine direct YouTube par tumhara video chala diya hai background aur alag tab me. Gana enjoy kijiye! ✨`,
              `Le bhai, tumhare liye directly playing "${mediaToPlay.query}" song. No matching/search stress! 😉`,
              `Haaanji! Abhi chala diya tumhara choice, pure music feel! Lisa hamesha dhyan rakhti hai! 😎`
            ]
          : [
              `Arre wah! Maine background me aur alag tab me tumhara ${isYt ? "YouTube video" : "Spotify track"} chala diya hai. Gana enjoy kijiye! ✨`,
              `Le bhai, tumhare liye ${isYt ? "YouTube" : "Spotify"} par "${mediaToPlay.query}" ek naye tab me chala diya. Aur background me bhi activated hai! 😉`,
              `Haaanji! Chala diya tumhara "${mediaToPlay.query}" song alag tab me directly. Lisa hamesha active hai! 😎`
            ]);
      // Pick random sassy response for entertainment
      const responseText = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);

      await handleLisaSpeak(responseText);
      return;
    }

    // 1. Check for browser commands
    const commandResult = processCommand(finalTranscript);

    let responseText = "";

    if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);

      await handleLisaSpeak(responseText);

      setTimeout(() => {
        if (commandResult.url) {
          window.open(commandResult.url, "_blank");
        }
      }, 1500);
    } else {
      // 2. General Chit-Chat via Gemini (incorporating Unified History, custom memory, persona, topic, and camera snapshot if available)
      console.log("[LISA CHAT] Request started");
      const unifiedContextStr = getUnifiedHistoryContextString();
      const customMemoryStr = currentUser ? (localStorage.getItem(`lisa_memory_${currentUser.email}`) || "") : "";

      // Check for user-driven persona switch or reset intent in transcript
      const personaIntent = AdaptivePersonaEngine.detectPersonaIntent(finalTranscript);
      let turnPersona = activePersona;

      if (personaIntent.intent === "reset_to_default" && personaIntent.persona) {
        setActivePersona(personaIntent.persona);
        localStorage.setItem("lisa_active_persona", JSON.stringify(personaIntent.persona));
        liveSessionRef.current?.updateContext({ activePersona: personaIntent.persona });
        turnPersona = personaIntent.persona;
        triggerPersonaToast("Lisa Core Mode", "Sassy & Caring", "Sparkles", "fuchsia");
      } else if (personaIntent.intent === "persistent_switch" && personaIntent.persona) {
        setActivePersona(personaIntent.persona);
        localStorage.setItem("lisa_active_persona", JSON.stringify(personaIntent.persona));
        liveSessionRef.current?.updateContext({ activePersona: personaIntent.persona });
        turnPersona = personaIntent.persona;
        const roleTitle = personaIntent.targetRoleName || personaIntent.persona.role || personaIntent.persona.name;
        triggerPersonaToast(
          `${roleTitle} Mode Activated`,
          personaIntent.persona.domain || "Specialized Role",
          personaIntent.persona.visualProfile?.icon,
          personaIntent.persona.visualProfile?.themeColor
        );
      } else if (personaIntent.intent === "temporary_override" && personaIntent.persona) {
        turnPersona = personaIntent.persona;
        const roleTitle = personaIntent.targetRoleName || personaIntent.persona.role || personaIntent.persona.name;
        triggerPersonaToast(
          `${roleTitle} Style (Temporary)`,
          "Answering in this role style",
          personaIntent.persona.visualProfile?.icon,
          personaIntent.persona.visualProfile?.themeColor
        );
      }

      try {
        const startTime = Date.now();
        analytics.track("message_sent", { feature: "chat", conversationId: activeConversationId });

        if (activeDocument) {
          analytics.track("document_question", { documentId: activeDocument.documentId, documentType: activeDocument.fileType });
        }

        const chatResult = await sendLisaMessageWithRetry({
          prompt: finalTranscript,
          history: messagesRef.current,
          userName: currentUser?.name || "",
          voiceHistoryContext: unifiedContextStr,
          customMemory: customMemoryStr,
          image: chatCapturedImage || undefined,
          mimeType: chatCapturedImage ? "image/jpeg" : undefined,
          conversationId: activeConversationId,
          activePersona: turnPersona,
          currentTopic: currentTopic,
          maxRetries: 3,
          activeDocumentId: activeDocument?.documentId,
          userAgeTier: (localStorage.getItem("lisa_user_age_tier") as any) || "adult"
        });
        console.log("[LISA CHAT] /api/gemini/chat response received");

        responseText = chatResult.text || "Ugh, fine. I have nothing to say.";
        characterManager.setExpression(pickExpressionFromText(responseText));
        analytics.track("message_completed", {
          feature: "chat",
          latency: Date.now() - startTime,
          success: true,
          conversationId: activeConversationId
        });

        // If backend returned an updated persona, synchronize state
        if (chatResult.updatedPersona) {
          setActivePersona(chatResult.updatedPersona);
          localStorage.setItem("lisa_active_persona", JSON.stringify(chatResult.updatedPersona));
          liveSessionRef.current?.updateContext({ activePersona: chatResult.updatedPersona });
          analytics.track("persona_activated", { persona: chatResult.updatedPersona.name });
        }

        const lisaMessage: ChatMessage = { id: Date.now().toString() + "-l", sender: "lisa", text: responseText };
        setMessages((prev) => [...prev, lisaMessage]);
        console.log("[LISA CHAT] Assistant message appended to UI");

        console.log("[LISA CHAT] Assistant history sync started");
        addMessageToHistory(lisaMessage).catch((e) => {
          console.warn("[LISA CHAT] Assistant history sync failed:", e);
        });

        setChatCapturedImage(null);

        console.log("[LISA CHAT] TTS started");
        try {
          await handleLisaSpeak(responseText);
          console.log("[LISA CHAT] TTS completed");
        } catch (ttsError) {
          console.warn("[LISA CHAT] TTS failed:", ttsError);
        }
      } catch (error) {
        console.error("[LISA CHAT] Request failed:", error);
        analytics.track("error_occurred", {
          feature: "chat",
          errorCategory: "api_failure",
          error: String(error)
        });
        const errorMsgText = typeof error === "object" && error && "message" in error
          ? (error as any).message
          : "Uff, mera dimaag kharab ho gaya hai. Try again later!";
        const errorLisaMessage: ChatMessage = {
          id: Date.now().toString() + "-l",
          sender: "lisa",
          text: `[Error] ${errorMsgText}`
        };
        setMessages((prev) => [...prev, errorLisaMessage]);
      } finally {
        setAppState("idle");
      }
    }
  }, [isMuted, isSessionActive, currentUser, getUnifiedHistoryContextString, chatCapturedImage, activeConversationId, activePersona, currentTopic]);

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      setConnectionStatus("offline");
      resetLisaSession();
    } else {
      try {
        setIsSessionActive(true);
        resetLisaSession();

        // Pass unified history context, custom memory, persona, and conversation context to the manager
        const unifiedContextStr = getUnifiedHistoryContextString();
        const customMemoryStr = currentUser ? (localStorage.getItem(`lisa_memory_${currentUser.email}`) || "") : "";
        const preferredVoiceStr = getLisaPreferredVoice(currentUser);

        const session = new LiveSessionManager({
          userName: currentUser?.name || "",
          voiceHistoryContext: unifiedContextStr,
          customMemory: customMemoryStr,
          voice: preferredVoiceStr,
          conversationId: activeConversationId,
          activePersona: activePersona,
          currentTopic: currentTopic
        });
        session.isMuted = isMuted;
        liveSessionRef.current = session;

        session.onPermissionDenied = () => {
          console.warn("[LISA LIVE] Microphone permission denied");
          setShowPermissionModal(true);
          setIsSessionActive(false);
          setAppState("idle");
          if (liveSessionRef.current) {
            liveSessionRef.current.stop();
            liveSessionRef.current = null;
          }
        };

        session.onStateChange = (state) => {
          setAppState(state);
        };

        session.onConnectionStatusChange = (status, attempt) => {
          setConnectionStatus(status);
          if (attempt !== undefined) {
            setReconnectAttempt(attempt);
          }
        };

        session.onRestored = () => {
          setConnectionStatus("restored");
          setTimeout(() => {
            setConnectionStatus("connected");
          }, 3500);
        };

        session.onPersonaChange = (newPersona) => {
          setActivePersona(newPersona);
          localStorage.setItem("lisa_active_persona", JSON.stringify(newPersona));
          const isDefault = newPersona.id === "default";
          const title = isDefault ? "Lisa Core Mode" : `${newPersona.role || newPersona.name} Mode Activated`;
          triggerPersonaToast(
            title,
            isDefault ? "Sassy & Caring" : (newPersona.domain || "Specialized Role"),
            newPersona.visualProfile?.icon,
            newPersona.visualProfile?.themeColor
          );
        };

        session.onMessage = async (sender, text) => {
          // Add to current conversation thread
          const newMsg: ChatMessage = { id: Date.now().toString() + "-" + sender, sender: sender === "user" ? "user" : "lisa", text };
          setMessages((prev) => [...prev, newMsg]);

          // Persist all messages from Live session to Firestore immediately for recovery
          addMessageToHistory(newMsg).catch(e => console.warn("[LISA MEMORY] Failed to sync Live turn:", e));

          // Check if user spoke a command to stop the current media
          if (sender === "user") {
            const norm = text.toLowerCase().trim();
            const stopWords = ["stop", "roko", "band kro", "band karo", "band kar", "band krdo", "band kar do", "stop song", "stop video", "stop music", "gaana roko", "gana roko", "gaana band", "gana band", "pause song", "gaana band karo", "gana band karo", "gaana band kro", "gana band kro"];
            if (stopWords.some(word => norm.includes(word))) {
              setActiveMedia(null);
            }
          }
        };

        session.onComputerAction = (actionCall: any) => {
          console.log("🖥️ [LIVE COMPUTER ACTION VISUAL SYNC]", actionCall);
          const queryText = actionCall.spokenIntent || `${actionCall.appName || ""} ${actionCall.tool || ""}`;
          const plan = ComputerTaskPlanner.createPlan(queryText);
          setComputerPlan(plan);
          setComputerStatus("executing");
        };

        session.onCommand = (url) => {
          if (url.includes("whatsapp")) {
            let phone = "";
            let text = "";
            try {
              const urlObj = new URL(url);
              phone = urlObj.searchParams.get("phone") || "";
              text = urlObj.searchParams.get("text") || "";
            } catch (e) {
              const parts = url.split("?");
              if (parts.length > 1) {
                const searchParams = new URLSearchParams(parts[1]);
                phone = searchParams.get("phone") || "";
                text = searchParams.get("text") || "";
              }
            }
            // Trigger launching with fallbacks
            triggerWhatsAppLaunch("Contact", text || "Namaste", phone);
            return;
          }

          if (url.includes("youtube") || url.includes("spotify")) {
            const isYt = url.includes("youtube");
            let queryText = "";
            try {
              if (isYt) {
                const searchParams = new URLSearchParams(new URL(url).search);
                queryText = searchParams.get("search_query") || "";
              } else {
                const parts = url.split("/search/");
                if (parts.length > 1) {
                  queryText = decodeURIComponent(parts[1]);
                }
              }
            } catch (e) {
              console.error("Error decoding session URL", e);
            }
            if (queryText) {
              setActiveMedia({
                type: isYt ? "youtube" : "spotify",
                query: queryText
              });
              // Launch in separate browser tab so it plays in background/outside
              try {
                window.open(url, "_blank");
              } catch (e) {
                console.error("Popup blocked by browser", e);
              }
              return;
            }
          }
          setTimeout(() => {
            window.open(url, "_blank");
          }, 1000);
        };

        await session.start();
      } catch (e) {
        console.warn("[LISA LIVE] Failed to start session:", e);
        setShowPermissionModal(true);
        setIsSessionActive(false);
        setAppState("idle");
        if (liveSessionRef.current) {
          liveSessionRef.current.stop();
          liveSessionRef.current = null;
        }
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() && !chatCapturedImage) return;

    const finalText = textInput.trim() || "(Look at this picture!)";
    handleTextCommand(finalText);
    setTextInput("");
    setShowTextInput(false);
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#070708] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden m-0 p-0">
      {/* Dynamic Login Overlay */}
      {currentUser === null ? (
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            const pinLock = localStorage.getItem(`lisa_pin_lock_${user.email}`) === "true";
            setIsAppUnlocked(!pinLock);
            resetLisaSession();
            setTimeout(() => {
              GreetingEngine.evaluateAndTriggerGreeting({
                currentUser: user,
                activeConversationId,
                isResumed: false,
                isNewSession: true,
                force: true,
                activePersona,
                userAgeTier: (localStorage.getItem("lisa_user_age_tier") as any) || "adult",
                messages: messagesRef.current,
                onGreetingDelivered: handleGreetingDelivered,
                handleLisaSpeak
              });
            }, 600);
          }}
          onLisaSpeak={handleLisaSpeak}
        />
      ) : null}

      {/* Biometric Scan / Passcode Lock Screen Overlay */}
      {currentUser !== null && !isAppUnlocked ? (
        <BiometricLockScreen
          currentUser={currentUser}
          palette={activePalette}
          onUnlockSuccess={() => {
            setIsAppUnlocked(true);
            GreetingEngine.evaluateAndTriggerGreeting({
              currentUser,
              activeConversationId,
              isResumed: messages.length > 0,
              activePersona,
              userAgeTier: (localStorage.getItem("lisa_user_age_tier") as any) || "adult",
              messages: messagesRef.current,
              onGreetingDelivered: handleGreetingDelivered,
              handleLisaSpeak
            });
          }}
          onLisaSpeak={handleLisaSpeak}
        />
      ) : null}

      {/* Dynamic Profile Settings Modal */}
      {showProfileModal && currentUser && (
        <ProfileModal
          palette={activePalette}
          currentUser={currentUser}
          onUpdateAvatar={() => setCurrentUserAvatar(getUserAvatarUrl(currentUser.email, currentUser.name))}
          isDarkMode={isDarkMode}
          setIsDarkMode={(dark) => {
            setIsDarkMode(dark);
            localStorage.setItem("lisa_global_dark_mode", dark ? "true" : "false");
          }}
          onClose={() => setShowProfileModal(false)}
          onUpdateName={(newName) => {
            const updatedUser = { ...currentUser, name: newName };
            setCurrentUser(updatedUser);

            // Sync registry
            const list = localStorage.getItem("lisa_registered_users");
            if (list) {
              try {
                const users = JSON.parse(list);
                const updatedList = users.map((u: any) =>
                  u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, name: newName } : u
                );
                localStorage.setItem("lisa_registered_users", JSON.stringify(updatedList));
              } catch (e) {
                console.error("Profile name sync failed", e);
              }
            }

            resetLisaSession();
            setTimeout(() => {
              handleLisaSpeak(`Wah re wah! Aaj se tumhara naam ${newName} hua. Sunder hai, chalo ab kaam karo.`);
            }, 300);
          }}
          onLogout={() => {
            stopChatWebcam();
            if (liveSessionRef.current) {
              liveSessionRef.current.stop();
              liveSessionRef.current = null;
            }
            setIsSessionActive(false);
            resetLisaSession();
            setCurrentUser(null);
            setIsAppUnlocked(false);
            setShowProfileModal(false);
            setTimeout(() => {
              handleLisaSpeak("Arre! Chale gaye? Chalo, thoda shanti milegi dimaag ko. Alvida!");
            }, 300);
          }}
        />
      )}

      {/* Temporary Persona Activation Toast */}
      <PersonaActivationToast toast={personaToast} onDismiss={() => setPersonaToast(null)} />

      {/* PDF Maker Modal */}
      {isPDFMakerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPDFMakerOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0d121c] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-serif tracking-wide">PDF Maker</h2>
              <button onClick={() => setIsPDFMakerOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <PDFMaker />
          </motion.div>
        </div>
      )}

      {showPermissionModal && (
        <PermissionModal
          onClose={() => setShowPermissionModal(false)}
        />
      )}

      {/* Floating Eye (Main Screen Camera Stream) */}
      <AnimatePresence>
        {isChatWebcamActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed right-6 md:right-12 bottom-36 w-[320px] md:w-[360px] bg-black/90 border border-rose-500/40 rounded-3xl p-3.5 z-40 shadow-[0_0_30px_rgba(244,63,94,0.25)] flex flex-col gap-3.5 backdrop-blur-xl transition-all duration-300 pointer-events-auto"
          >
            {/* Camera Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">LISA VISION: ACTIVE 👁️</span>
              </div>
              <button
                type="button"
                onClick={stopChatWebcam}
                className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Video Feed */}
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 group">
              <video
                ref={chatWebcamRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {/* Animated scanning bar */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-[bounce_5s_infinite] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* Camera Controls */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  captureChatPhoto();
                  const dialogues = [
                    "Waaah, sssuperb capture! Maine snapshot le liya hai. Ab text me likho ya mic se pucho aur main iske upar gyaan dungi! 😉",
                    "Aha! Snapshot clickable ho gaya hai. Ab aap mujhse is tasveer ke baare me kuch bhi discuss kar sakte hain! 🌸",
                    "Chalo, scan done! Meri nazrein bohot tej hain. Ab pucho, kya jaanna hai is baare me? ✨"
                  ];
                  handleLisaSpeak(dialogues[Math.floor(Math.random() * dialogues.length)]);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-transform"
              >
                <Camera size={14} />
                <span>Snap Photo 📸</span>
              </button>
              <button
                type="button"
                onClick={stopChatWebcam}
                className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] ${activePalette.glowTop} blur-[120px] rounded-full transition-all duration-700`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] ${activePalette.glowBottom} blur-[120px] rounded-full transition-all duration-700`} />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center z-20 shrink-0 px-6 py-4 md:px-10 md:py-5 backdrop-blur-md bg-white/[0.02] border-b border-white/[0.05]">
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={toggleListening}>
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${activePalette.avatarBg} flex items-center justify-center font-bold text-sm shadow-xl shadow-black/20 group-hover:scale-105 transition-transform border border-white/10 shrink-0`}>
            L
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-serif font-medium tracking-wide text-white/90 group-hover:text-emerald-400 transition-colors leading-tight">Lisa</h1>
            <span className="text-[10px] sm:text-[11px] font-sans font-normal tracking-wide text-zinc-400/80 group-hover:text-zinc-300 transition-colors whitespace-nowrap select-none leading-tight mt-0.5">
              Zodiactech Software & IT Services Pvt. Ltd.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => {
                setShowProfileModal(true);
                analytics.track("feature_opened", { feature: "profile_settings" });
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10 text-xs font-mono tracking-wide cursor-pointer"
              title="View Profile Settings"
            >
              {currentUserAvatar ? (
                <img
                  src={currentUserAvatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${activePalette.avatarBg} flex items-center justify-center font-sans font-bold text-[9px] text-white uppercase`}>
                  {currentUser.name.trim().charAt(0)}
                </div>
              )}
              <span className="hidden sm:inline max-w-[80px] truncate opacity-80">{currentUser.name}</span>
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (!isChatOpen) {
                  analytics.track("feature_opened", { feature: "lisa_hub" });
                }
              }}
              className={`p-2 rounded-full transition-all border cursor-pointer ${
                isChatOpen
                  ? `bg-white/15 text-white ${activePalette.accentBorder}`
                  : "bg-white/5 text-white/70 hover:bg-white/10 border-white/10"
              }`}
              title={isChatOpen ? "Hide Lisa Hub" : "Open Lisa Hub (Chat, History, Personas)"}
            >
              <MessageSquare size={18} />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear the chat history?")) {
                  setMessages([]);
                  resetLisaSession();
                  analytics.track("feature_opened", { feature: "clear_chat" });
                }
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10"
              title="Clear Chat History"
            >
              <Trash2 size={18} className="opacity-70" />
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => {
                setIsDocModalOpen(true);
                analytics.track("feature_opened", { feature: "document_intelligence" });
              }}
              className={`p-2 rounded-full transition-all border cursor-pointer flex items-center justify-center relative ${
                isDocModalOpen || activeDocument || isStudyOpen || isPDFMakerOpen
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border-white/10"
              }`}
              title="Document & Presentation Hub (Intelligence, Study, Presentations, PDF Maker)"
            >
              <FileSearch size={18} />
              {(activeDocument) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          )}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowPaletteDropdown(!showPaletteDropdown);
                  if (!showPaletteDropdown) {
                    analytics.track("feature_opened", { feature: "theme_palette" });
                  }
                }}
                className={`p-2 rounded-full transition-all border cursor-pointer flex items-center justify-center ${
                  showPaletteDropdown
                    ? `bg-white/15 text-white ${activePalette.accentBorder}`
                    : "bg-white/5 text-white/70 hover:bg-white/10 border-white/10"
                }`}
                title="Change Color Palette"
              >
                <Palette size={18} className={showPaletteDropdown ? "animate-spin" : ""} style={{ animationDuration: "3s" }} />
              </button>

              <AnimatePresence>
                {showPaletteDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-950/95 border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl flex flex-col gap-1 pointer-events-auto"
                  >
                    <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-white/40 border-b border-white/5 mb-1">
                      UI Palette
                    </div>
                    {Object.values(THEME_PALETTES).map((pal) => {
                      const isSelected = activePalette.id === pal.id;
                      return (
                        <button
                          key={pal.id}
                          onClick={() => {
                            setActivePalette(pal);
                            setShowPaletteDropdown(false);
                            analytics.track("feature_opened", { feature: `theme_selected_${pal.id}` });
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs font-serif transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-white/15 text-white font-medium"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${pal.accentGradient}`} />
                            <span>{pal.name}</span>
                          </div>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 animate-fade-in cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX size={18} className="opacity-70" />
            ) : (
              <Volume2 size={18} className="opacity-70" />
            )}
          </button>
        </div>
      </header>

      {/* Connection & Auto-Recovery Status Indicator */}
      <div className="absolute top-[68px] md:top-[76px] left-0 right-0 z-20 pointer-events-auto">
        <ConnectionStatusBar
          status={connectionStatus}
          attempt={reconnectAttempt}
          maxAttempts={5}
          onRetry={() => {
            if (liveSessionRef.current) {
              liveSessionRef.current.triggerAutoReconnect();
            } else {
              toggleListening();
            }
          }}
          personaName={activePersona.name}
          isVoiceActive={isSessionActive}
        />
      </div>

      {/* Subscription Notification Banner */}
      <AnimatePresence>
        {subscriptionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-md w-[90%]"
          >
            <div
              className={`p-3.5 rounded-2xl backdrop-blur-xl border flex items-center justify-between gap-3 shadow-2xl ${
                subscriptionBanner.type === "activating"
                  ? "bg-violet-950/80 border-violet-500/40 text-violet-100"
                  : subscriptionBanner.type === "success"
                  ? "bg-emerald-950/85 border-emerald-500/50 text-emerald-100"
                  : "bg-slate-900/90 border-white/20 text-white/80"
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                {subscriptionBanner.type === "activating" && (
                  <RefreshCw size={16} className="animate-spin text-violet-400 shrink-0" />
                )}
                {subscriptionBanner.type === "success" && (
                  <Crown size={16} className="text-yellow-400 shrink-0" />
                )}
                {subscriptionBanner.type === "canceled" && (
                  <span className="shrink-0">ℹ️</span>
                )}
                <span>{subscriptionBanner.message}</span>
              </div>
              <button
                onClick={() => setSubscriptionBanner(null)}
                className="text-white/50 hover:text-white transition-colors text-xs px-1.5 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Visualizer & Chat */}
      <main className="absolute inset-0 flex flex-row items-center justify-between w-full h-full z-10 overflow-hidden pt-20 pb-24 px-4 md:px-12 pointer-events-none">

        {/* Left Column: Lisa Status */}
        <div className="flex w-[30%] lg:w-[25%] h-full flex-col justify-center gap-4 z-10">
          <div className="h-6">
            <AnimatePresence>
              {appState === "processing" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 text-cyan-300/80 text-sm md:text-base italic font-serif"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Replying...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Visualizer (Fixed Full Screen Background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <Visualizer state={appState} palette={activePalette} onToggleListening={toggleListening} />
        </div>

        {/* Right Column: User Status */}
        <div className="flex w-[30%] lg:w-[25%] h-full flex-col justify-center gap-4 z-10">
          <div className="h-6 flex justify-end">
            <AnimatePresence>
              {appState === "listening" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-violet-300/80 text-sm md:text-base italic"
                >
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  Listening...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* Controls */}
      <footer className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-center pb-6 md:pb-8 z-20 shrink-0 gap-4">
        <AnimatePresence>
          {chatCapturedImage && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="p-2 bg-[#0b0c10]/95 border border-emerald-500/35 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-3 backdrop-blur-xl pointer-events-auto max-w-xs relative z-40 mb-1"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0 relative">
                <img
                  src={chatCapturedImage}
                  alt="Captured Snap"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5 justify-center mr-1">
                <span className="text-[9px] font-mono text-[#10b981] uppercase tracking-wider font-semibold">LISA CAPTURED EYE ✨</span>
                <span className="text-[10px] text-white/50 leading-none">Press Mic or Type to ask!</span>
              </div>
              <button
                type="button"
                onClick={() => setChatCapturedImage(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 border border-white/5 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X size={10} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTextInput && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleTextSubmit}
              className={`w-full max-w-md flex items-center gap-2 bg-white/5 border ${activePalette.glassBorder} rounded-full p-1 pl-4 backdrop-blur-md shadow-2xl transition-all duration-300`}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message to Lisa..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={!textInput.trim() && !chatCapturedImage}
                className={`p-2 rounded-full ${activePalette.accentBg} text-white disabled:opacity-50 transition-colors`}
              >
                <Send size={16} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          {currentUser && (
            <button
              onClick={() => {
                if (isChatWebcamActive) {
                  stopChatWebcam();
                } else {
                  startChatWebcam();
                }
              }}
              className={`p-4 rounded-full transition-all border cursor-pointer ${
                isChatWebcamActive
                  ? "bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  : `bg-white/5 border ${activePalette.glassBorder} text-white/70 hover:bg-white/10`
              }`}
              title="Toggle Floating Camera Lens (Vision) 👁️"
            >
              <Camera size={20} className={isChatWebcamActive ? "animate-pulse" : ""} />
            </button>
          )}

          {!isSessionActive && (
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`p-4 rounded-full bg-white/5 border ${activePalette.glassBorder} hover:bg-white/10 transition-colors shadow-2xl cursor-pointer`}
              title="Type instead"
            >
              <Keyboard size={20} className="opacity-70" />
            </button>
          )}
        </div>
      </footer>

      {/* Floating Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed right-4 top-24 bottom-32 w-[calc(100vw-32px)] sm:w-[380px] bg-[#0b0c10]/95 border ${activePalette.sidebarBorder} rounded-3xl z-30 ${activePalette.ambientShadow} flex flex-col overflow-hidden backdrop-blur-xl pointer-events-auto transition-all duration-500`}
          >
            {/* Header of Chat Panel */}
            <div className={`flex justify-between items-center px-5 py-4 border-b ${activePalette.sidebarBorder} bg-white/[0.02]`}>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className={activePalette.accentText} />
                <span className="font-serif font-semibold tracking-wider text-sm mt-0.5 uppercase">Lisa Hub</span>
              </div>
              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Rukko! Kya sach me saari conversation history udaani hai? Lisa sab kuch bhool jayegi!")) {
                        setMessages([]);
                        resetLisaSession();
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer border border-red-500/15"
                    title="Clear Everything"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="px-2 py-1 rounded-lg hover:bg-white/5 border border-white/5 text-white/50 hover:text-white transition-colors cursor-pointer text-[10px] uppercase font-mono tracking-widest"
                >
                  Hide
                </button>
              </div>
            </div>

            {/* Subheader: Tab Switcher */}
            <div className={`flex border-b ${activePalette.sidebarBorder} bg-white/[0.01] shrink-0 overflow-x-auto no-scrollbar`}>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 min-w-[70px] py-3 text-[9px] font-mono uppercase tracking-widest border-b-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "chat"
                    ? `text-white font-semibold bg-white/[0.03]`
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
                style={activeTab === "chat" ? { borderBottomColor: activePalette.visColors.listening.color } : {}}
              >
                <MessageSquare size={11} />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 min-w-[70px] py-3 text-[9px] font-mono uppercase tracking-widest border-b-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "history"
                    ? `text-white font-semibold bg-white/[0.03]`
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
                style={activeTab === "history" ? { borderBottomColor: activePalette.visColors.processing.color } : {}}
              >
                <Clock size={11} />
                <span>History</span>
              </button>
              <button
                onClick={() => setActiveTab("personas")}
                className={`flex-1 min-w-[70px] py-3 text-[9px] font-mono uppercase tracking-widest border-b-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "personas"
                    ? `text-white font-semibold bg-white/[0.03]`
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
                style={activeTab === "personas" ? { borderBottomColor: "#a855f7" } : {}}
              >
                <UserCheck size={11} />
                <span>Persona</span>
              </button>
              <button
                onClick={() => setActiveTab("memory")}
                className={`flex-1 min-w-[70px] py-3 text-[9px] font-mono uppercase tracking-widest border-b-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "memory"
                    ? `text-white font-semibold bg-white/[0.03]`
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
                style={activeTab === "memory" ? { borderBottomColor: "#f59e0b" } : {}}
              >
                <Sparkles size={11} />
                <span>Memory</span>
              </button>
              <button
                onClick={() => setActiveTab("voice")}
                className={`flex-1 min-w-[70px] py-3 text-[9px] font-mono uppercase tracking-widest border-b-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  activeTab === "voice"
                    ? `text-white font-semibold bg-white/[0.03]`
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
                style={activeTab === "voice" ? { borderBottomColor: activePalette.visColors.speaking.color } : {}}
              >
                <Mic size={11} />
                <span>Voice</span>
              </button>
            </div>

            {/* Fixed Persona Selection (Only when personas tab is active) */}
            {activeTab === "personas" && (
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.01] shrink-0">
                <form onSubmit={handleHubSynthesizePersona} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Wand2 size={12} className="text-fuchsia-400" /> Adopt Any Persona</label>
                  <div className="flex gap-2">
                    <input type="text" value={customPersonaQuery} onChange={(e) => setCustomPersonaQuery(e.target.value)} placeholder="e.g. ICU Nurse, Physics Prof..." className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
                    <button type="submit" disabled={isSynthesizingPersona} className="px-3 bg-fuchsia-500 rounded-lg text-white text-[10px] font-bold uppercase">{isSynthesizingPersona ? "..." : "ADOPT"}</button>
                  </div>
                </form>
              </div>
            )}

            {/* Dynamic Body Logs based on active tab */}
            <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 ${activeTab === 'personas' ? 'lisa-scrollbar' : 'scrollbar-hide'}`}>
              {activeTab === "chat" || activeTab === "voice" ? (
                messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30 gap-3">
                    <div className={`w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center ${activePalette.accentText} opacity-60 animate-pulse`}>
                      <MessageSquare size={20} />
                    </div>
                    <p className="text-xs font-mono max-w-[220px] mx-auto text-white/40">
                      Conversation khali hai... Kuch likho ya voice se baat kijiye!
                    </p>
                  </div>
                ) : (
                  (activeTab === "chat" ? messages : messages.filter(m => m.id.includes("-v-") || m.id.includes("voice"))).map((msg, idx) => {
                    const isLisa = msg.sender === "lisa";
                    const isVoice = msg.id.includes("-v-") || msg.id.includes("voice");
                    return (
                      <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col max-w-[85%] ${isLisa ? "self-start items-start" : "self-end items-end"}`}>
                        <span className={`text-[9px] font-mono uppercase tracking-widest mb-1 px-1 flex items-center gap-1 ${isVoice ? "text-emerald-400/70" : "text-white/35"}`}>
                          {isLisa ? `Lisa ${isVoice ? "🎙️" : "✨"}` : `${currentUser.name} ${isVoice ? "👤" : ""}`}
                        </span>
                        <div className="group relative flex items-center gap-2">
                          <div className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed whitespace-pre-wrap break-words ${isLisa ? (isVoice ? "bg-zinc-950/90 text-white border border-zinc-800" : "bg-gradient-to-br from-zinc-900 to-zinc-950 text-white/95 border border-white/5") : (isVoice ? "bg-gradient-to-r from-emerald-950/50 to-teal-950/50 text-emerald-100 border border-emerald-900/30" : `bg-gradient-to-r ${activePalette.accentGradient} text-white`)}`}>
                            {msg.text}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )
              ) : activeTab === "history" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder="Search chats or topics..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-[11px] text-white outline-none focus:border-white/20 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newId = "conv_" + Date.now();
                        setActiveConversationId(newId);
                        setMessages([]);
                        resetLisaSession();
                        GreetingEngine.triggerNewConversationGreeting({
                          currentUser,
                          conversationId: newId,
                          activePersona,
                          userAgeTier: (localStorage.getItem("lisa_user_age_tier") as any) || "adult",
                          messages: [],
                          onGreetingDelivered: handleGreetingDelivered,
                          handleLisaSpeak
                        });
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-all cursor-pointer"
                      title="New Chat"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 lisa-scrollbar">
                    {filteredConversations.length === 0 ? (
                      <div className="text-center py-10 text-[11px] text-white/30 italic">No matching history found.</div>
                    ) : (
                      filteredConversations.map(conv => (
                        <div key={conv.id} onClick={() => handleHubSelectConversation(conv.id)} className={`p-3 rounded-xl border transition-all cursor-pointer group ${conv.id === activeConversationId ? `bg-white/10 ${activePalette.accentBorder}` : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-white truncate max-w-[170px]">{conv.title || "Untitled Session"}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); handleHubDeleteConversation(conv.id); }} className="p-1 text-white/40 hover:text-red-400"><Trash2 size={11} /></button>
                            </div>
                          </div>

                          {conv.summary && (
                            <div className="text-[10px] text-white/40 line-clamp-1 mb-2 italic">
                              {conv.summary}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mb-2">
                            {conv.topics?.slice(0, 3).map((t, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] text-white/50 uppercase tracking-tight">
                                {t}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-white/30 font-mono">
                            <div className="flex items-center gap-2">
                              <span>{formatHubTimestamp(conv.updatedAt)}</span>
                              {conv.messageCount && <span>• {conv.messageCount} msgs</span>}
                            </div>
                            {conv.activePersona && (
                              <span className="text-fuchsia-400/60 uppercase">{conv.activePersona.name}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : activeTab === "personas" ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 lisa-scrollbar">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.values(ARCHETYPE_CATALOG).map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActivePersona(p);
                          localStorage.setItem("lisa_active_persona", JSON.stringify(p));
                          if (liveSessionRef.current) liveSessionRef.current.updateContext({ activePersona: p });
                          const isDefault = p.id === "default";
                          triggerPersonaToast(
                            isDefault ? "Lisa Core Mode" : `${p.role || p.name} Mode Activated`,
                            isDefault ? "Sassy & Caring" : (p.domain || "Specialized Role"),
                            p.visualProfile?.icon,
                            p.visualProfile?.themeColor
                          );
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${activePersona.id === p.id ? `bg-white/10 ${activePalette.accentBorder}` : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06]"}`}
                      >
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">{getHubPersonaIcon(p.id, p.icon)}</div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">{p.name}</div>
                          <div className="text-[9px] text-zinc-500 line-clamp-1">{p.roleDescription}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === "memory" ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-[10px] text-amber-200/80 leading-relaxed flex items-start gap-3">
                    <Brain size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-400 mb-0.5">Permanent Memory Active</p>
                      Lisa extracts key facts, preferences, and goals from chats to remember you across sessions.
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        value={memorySearchQuery}
                        onChange={(e) => setMemorySearchQuery(e.target.value)}
                        placeholder="Search your memories..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-[11px] text-white outline-none focus:border-white/20 transition-all"
                      />
                    </div>
                    <button onClick={handleHubDeleteAllFacts} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all" title="Clear All Memory"><RotateCcw size={14} /></button>
                  </div>

                  <form onSubmit={handleHubAddFact} className="flex gap-2">
                    <input type="text" value={newFactInput} onChange={(e) => setNewFactInput(e.target.value)} placeholder="Add a fact to remember..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/20" />
                    <button type="submit" disabled={isAddingFact} className="px-4 bg-white/10 hover:bg-white/15 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider transition-all">ADD</button>
                  </form>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 lisa-scrollbar">
                    {filteredFacts.length === 0 ? (
                      <div className="text-center py-10 text-[11px] text-white/30 italic">No matching memories found.</div>
                    ) : (
                      filteredFacts.map(f => (
                        <div key={f.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-3 group hover:bg-white/[0.05] transition-all">
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-white/90 leading-normal">{f.content}</div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-tighter ${
                                f.category === 'profile' ? 'bg-blue-500/20 text-blue-300' :
                                f.category === 'project' ? 'bg-emerald-500/20 text-emerald-300' :
                                f.category === 'preference' ? 'bg-amber-500/20 text-amber-300' :
                                'bg-zinc-500/20 text-zinc-300'
                              }`}>
                                {f.category || 'other'}
                              </span>
                              <span className="text-[8px] text-white/20 font-mono">{formatHubTimestamp(f.createdAt)}</span>
                            </div>
                          </div>
                          <button onClick={() => handleHubDeleteFact(f.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0"><Trash2 size={12} /></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chat Input at bottom of drawer */}
            <form onSubmit={handleTextSubmit} className={`p-3 border-t ${activePalette.sidebarBorder} bg-white/[0.01] flex items-center gap-2 shrink-0`}>
              {activeTab === "chat" && (
                <button
                  type="button"
                  onClick={() => {
                    if (isChatWebcamActive) {
                      stopChatWebcam();
                    } else {
                      startChatWebcam();
                    }
                  }}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-center shrink-0 ${
                    isChatWebcamActive
                      ? "bg-rose-500/15 border-rose-500 text-rose-400 animate-pulse"
                      : "bg-white/[0.03] border-white/5 text-white/50 hover:text-white"
                  }`}
                  title="Toggle Camera"
                >
                  <Camera size={12} />
                </button>
              )}

              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={activeTab === "chat" ? "Lisa se chit-chat karein..." : "Write a voice memo to inject..."}
                className={`flex-1 bg-white/[0.03] border border-white/5 hover:border-white/10 focus-within:${activePalette.accentRing} rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none transition-all font-sans`}
              />
              <button
                type="submit"
                disabled={!textInput.trim() && !chatCapturedImage}
                className={`p-2 rounded-xl ${activePalette.accentBg} text-white disabled:opacity-40 transition-colors pointer-events-auto cursor-pointer flex items-center justify-center shrink-0`}
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lisa Study Studio Modal overlay */}
      <StudyStudio
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
        palette={activePalette}
        userName={currentUser?.name || "Student"}
      />

      <AnimatePresence>
        {activeMedia && (
          <MediaWidget
            type={activeMedia.type}
            query={activeMedia.query}
            videoId={activeMedia.videoId}
            palette={activePalette}
            onClose={() => setActiveMedia(null)}
          />
        )}
      </AnimatePresence>

      {/* WhatsApp Linker Quick Popup Modal / Prompter Overlay */}
      <AnimatePresence>
        {pendingWaMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-sm bg-[#0d0e12]/95 border border-[#10b981]/25 rounded-[2rem] shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Decorative green top light bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#10b981]" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 flex items-center justify-center text-[#10b981] shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-serif font-bold text-white leading-tight">
                    WhatsApp Link Connector
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    RESOLVING SHORTCUT FOR: "{pendingWaMessage.name.toUpperCase()}"
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <p className="text-xs text-white/70 leading-relaxed">
                  Aap <b>{pendingWaMessage.name}</b> ko WhatsApp message bhejna chahte hain, but directory me unka phone number linked nahi hai! 📱
                </p>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono tracking-widest text-[#10b981] uppercase block">
                    WhatsApp Number (with country code):
                  </label>
                  <input
                    type="text"
                    value={inputWaNum}
                    onChange={(e) => setInputWaNum(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full bg-black/40 border border-white/10 focus:border-[#10b981] rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all font-mono"
                  />
                  <span className="text-[9px] text-zinc-500 block italic leading-tight">
                    *Tip: Ek baar dalkar save kar denge, toh Lisa is contact name ko permanently yaad rakhegi!
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (!inputWaNum.trim()) {
                        alert("Oye! Phone number toh enter kijiye pehle.");
                        return;
                      }
                      if (currentUser) {
                        // Register number in contact directory
                        linkWhatsAppContact(currentUser.email, pendingWaMessage.name, inputWaNum);
                        // Trigger WhatsApp launch immediately
                        triggerWhatsAppLaunch(pendingWaMessage.name, pendingWaMessage.message, inputWaNum);
                      }
                      setPendingWaMessage(null);
                    }}
                    className="w-full py-3 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer font-sans uppercase tracking-wider"
                  >
                    Save Contact & Send Message
                  </button>

                  <button
                    onClick={() => {
                      // Trigger direct picker share URL by sending with NO number set
                      const universalShareUrl = getWhatsAppUrl("", pendingWaMessage.message);
                      try {
                        window.open(universalShareUrl, "_blank");
                      } catch (e) {
                        console.error("Popup blocked", e);
                      }
                      setPendingWaMessage(null);
                    }}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl transition-all border border-white/10 cursor-pointer font-sans"
                  >
                    Send via Manual Contact Picker
                  </button>

                  <button
                    onClick={() => setPendingWaMessage(null)}
                    className="w-full py-2 text-zinc-500 hover:text-white text-[11px] font-mono uppercase tracking-wide transition-all cursor-pointer text-center"
                  >
                    Cancel Action
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DocumentInspectorModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        activeDocument={activeDocument}
        onDocumentLoaded={(doc) => {
          setActiveDocument(doc);
          setIsDocModalOpen(false);
          analytics.track("document_processed", { feature: "documents", fileType: doc.fileType, success: true });
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: "lisa",
            text: `📄 Successfully uploaded & analyzed "${doc.fileName}" (${doc.fileType})! Summary: ${doc.summary}. You can now ask me any follow-up questions about this document!`
          }]);
        }}
        parseDocument={async (fileData, fileName, fileType, mimeType) => {
          analytics.track("document_uploaded", { feature: "documents", fileName, fileType });
          const startTime = Date.now();
          try {
            const res = await parseDocumentApi(fileData, fileName, fileType, mimeType, activeConversationId);
            if (!res) {
              analytics.track("error_occurred", { feature: "documents", errorCategory: "parse_failure" });
            }
            return res;
          } catch (e) {
            analytics.track("error_occurred", { feature: "documents", errorCategory: "parse_exception", error: String(e) });
            throw e;
          }
        }}
        activePalette={activePalette}
        userName={currentUser?.name || "Guest"}
      />

      <ComputerAgentWidget
        plan={computerPlan}
        status={computerStatus}
        palette={activePalette}
        onConfirm={async (approved) => {
          setAppState("processing");
          const reply = await ComputerAgent.confirmAndResumeTask(approved, {
            onStatusChange: (st, pl) => {
              setComputerStatus(st);
              if (pl) setComputerPlan({ ...pl });
            },
            onStepProgress: (step, idx, total) => {
              if (computerPlan) setComputerPlan({ ...computerPlan });
            },
            onLisaSpeak: async (phrase) => {
              await handleLisaSpeak(phrase);
            }
          }, {
            uid: currentUser?.uid,
            userName: currentUser?.name
          });
          const replyMsg: ChatMessage = { id: Date.now().toString() + "-l-comp", sender: "lisa", text: reply };
          setMessages((prev) => [...prev, replyMsg]);
          addMessageToHistory(replyMsg).catch(console.warn);
          setAppState("idle");
        }}
        onCancel={() => {
          ComputerAgent.cancelTask({
            onStatusChange: (st, pl) => {
              setComputerStatus(st);
              if (pl) setComputerPlan({ ...pl });
            },
            onLisaSpeak: async (phrase) => {
              await handleLisaSpeak(phrase);
            }
          });
        }}
        onResume={async () => {
          setAppState("processing");
          const res = await ComputerAgent.resumeInterruptedTask({
            onStatusChange: (st, pl) => {
              setComputerStatus(st);
              if (pl) setComputerPlan({ ...pl });
            },
            onLisaSpeak: async (phrase) => {
              await handleLisaSpeak(phrase);
            }
          }, {
            uid: currentUser?.uid,
            userName: currentUser?.name
          });
          if (res.response) {
            const resumeMsg: ChatMessage = { id: Date.now().toString() + "-l-comp", sender: "lisa", text: res.response };
            setMessages((prev) => [...prev, resumeMsg]);
            addMessageToHistory(resumeMsg).catch(console.warn);
          }
          setAppState("idle");
        }}
        onClose={() => {
          setComputerPlan(null);
          setComputerStatus("idle");
        }}
      />
    </div>
  );
}
