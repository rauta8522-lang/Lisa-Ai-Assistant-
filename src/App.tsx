import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2, VolumeX, Keyboard, Send, Trash2, User, Settings, MessageSquare, Palette, BookOpen, MessageCircle, FileText, X, Play, Camera } from "lucide-react";
import { getLisaResponse, getLisaAudio, resetLisaSession } from "./services/geminiService";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import PermissionModal from "./components/PermissionModal";
import LoginScreen from "./components/LoginScreen";
import ProfileModal from "./components/ProfileModal";
import StudyStudio from "./components/StudyStudio";
import PDFMaker from "./components/PDFMaker";
import BiometricLockScreen from "./components/BiometricLockScreen";
import { playPCM, speakWithWebSpeech } from "./utils/audioUtils";
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
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ email: user.email || "", name: user.displayName || "" });
      } else {
        setCurrentUser(null);
      }
    });
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
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isPDFMakerOpen, setIsPDFMakerOpen] = useState(false);

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

  // Synchronize history when active user changes or updates
  useEffect(() => {
    if (currentUser) {
      // Fetch messages from Firestore
      const fetchMessages = async () => {
        try {
          const q = query(
            collection(db, "users", currentUser.email, "chatHistory")
          );
          const querySnapshot = await getDocs(q);
          const loadedMessages: ChatMessage[] = [];
          querySnapshot.forEach((doc) => {
            loadedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
          });
          // Sort by ID or timestamp if possible. Using id (which is Date.now()) as a proxy for timestamp.
          loadedMessages.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          setMessages(loadedMessages);
        } catch (e) {
          console.error("Failed to fetch chat history for " + currentUser.email, e);
          setMessages([]);
        }
      };

      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [currentUser]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Dedicated state and ref for the new Voice History feature
  const [voiceMessages, setVoiceMessages] = useState<ChatMessage[]>([]);
  const voiceMessagesRef = useRef(voiceMessages);
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat");

  // Load and sync voice history for the logged-in user
  useEffect(() => {
    if (currentUser) {
      const savedVoiceHistory = localStorage.getItem(`lisa_voice_history_${currentUser.email}`);
      if (savedVoiceHistory) {
        try {
          const parsed = JSON.parse(savedVoiceHistory);
          setVoiceMessages(parsed);
          voiceMessagesRef.current = parsed;
        } catch (e) {
          console.error("Failed to parse voice history for " + currentUser.email, e);
          setVoiceMessages([]);
          voiceMessagesRef.current = [];
        }
      } else {
        setVoiceMessages([]);
        voiceMessagesRef.current = [];
      }
    } else {
      setVoiceMessages([]);
      voiceMessagesRef.current = [];
    }
  }, [currentUser]);

  useEffect(() => {
    voiceMessagesRef.current = voiceMessages;
    if (currentUser) {
      localStorage.setItem(`lisa_voice_history_${currentUser.email}`, JSON.stringify(voiceMessages));
    }
  }, [voiceMessages, currentUser]);

  // Generate memory-context to feed into Gemini so she remembers everything discussed in previous voice sessions
  const getVoiceHistoryContextString = useCallback(() => {
    if (voiceMessages.length === 0) return "";
    // Pass the last 30 messages in Voice History to remain within token boundaries comfortably
    const recentVoice = voiceMessages.slice(-30);
    return recentVoice
      .map((msg) => `${msg.sender === "user" ? "User Spoke" : "Lisa's Voice Answer"}: "${msg.text}"`)
      .join("\n");
  }, [voiceMessages]);

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
    if (isMuted) return;
    setAppState("speaking");
    try {
      const preferredVoiceStr = currentUser ? (localStorage.getItem(`lisa_preferred_voice_${currentUser.email}`) || "Kore") : "Kore";
      const audioBase64 = await getLisaAudio(phrase, preferredVoiceStr);
      if (audioBase64) {
        await playPCM(audioBase64);
      } else {
        // Fallback to browser TTS if no audio returned
        await speakWithWebSpeech(phrase);
      }
    } catch (e) {
      console.error("Speak helper failed, falling back to Web Speech:", e);
      try {
        await speakWithWebSpeech(phrase);
      } catch (err) {
        console.error("Web Speech fallback also failed:", err);
      }
    }
    setAppState("idle");
  }, [isMuted, currentUser]);

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

  const addMessageToHistory = async (message: ChatMessage) => {
    if (currentUser) {
      await setDoc(doc(db, "users", currentUser.email, "chatHistory", message.id), message);
    }
  };

  const addVoiceMessageToHistory = async (message: ChatMessage) => {
    if (currentUser) {
      await setDoc(doc(db, "users", currentUser.email, "voiceHistory", message.id), message);
    }
  };

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
      setAppState("idle");
      return;
    }

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: "user", text: finalTranscript };
    setMessages((prev) => [...prev, newUserMessage]);
    await addMessageToHistory(newUserMessage);
    
    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    // Intercept "stop", "roko", "band kro", etc. commands first
    const norm = finalTranscript.toLowerCase().trim();
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
      
      const targetUrl = isYt 
        ? (videoIdToUse ? `https://www.youtube.com/watch?v=${videoIdToUse}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(mediaToPlay.query)}`)
        : `https://open.spotify.com/search/${encodeURIComponent(mediaToPlay.query)}`;
      
      try {
        window.open(targetUrl, "_blank");
      } catch (err) {
        console.error("Popup window blocked", err);
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
      // 2. General Chit-Chat via Gemini (incorporating Voice History, custom memory, and camera snapshot if available)
      const voiceContextStr = getVoiceHistoryContextString();
      const customMemoryStr = currentUser ? (localStorage.getItem(`lisa_memory_${currentUser.email}`) || "") : "";
      responseText = await getLisaResponse(
        finalTranscript, 
        messagesRef.current, 
        currentUser?.name || "", 
        voiceContextStr, 
        customMemoryStr,
        chatCapturedImage || undefined,
        chatCapturedImage ? "image/jpeg" : undefined
      );
      setMessages((prev) => [...prev, { id: Date.now().toString() + "-l", sender: "lisa", text: responseText }]);
      setChatCapturedImage(null);
      
      await handleLisaSpeak(responseText);
    }
  }, [isMuted, isSessionActive, currentUser, getVoiceHistoryContextString, chatCapturedImage]);

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
      resetLisaSession();
    } else {
      try {
        setIsSessionActive(true);
        resetLisaSession();
        
        // Pass voice history context and custom memory to the constructor so Lisa reads it during system instructions
        const voiceContextStr = getVoiceHistoryContextString();
        const customMemoryStr = currentUser ? (localStorage.getItem(`lisa_memory_${currentUser.email}`) || "") : "";
        const preferredVoiceStr = currentUser ? (localStorage.getItem(`lisa_preferred_voice_${currentUser.email}`) || "Kore") : "Kore";
        const session = new LiveSessionManager(currentUser?.name || "", voiceContextStr, customMemoryStr, preferredVoiceStr);
        session.isMuted = isMuted;
        liveSessionRef.current = session;
        
        session.onStateChange = (state) => {
          setAppState(state);
        };
        
        session.onMessage = (sender, text) => {
          // Add to current chat panel
          setMessages((prev) => [...prev, { id: Date.now().toString() + "-" + sender, sender, text }]);
          // Also save in Voice History
          setVoiceMessages((prev) => [...prev, { id: Date.now().toString() + "-v-" + sender, sender, text }]);

          // Check if user spoke a command to stop the current media
          if (sender === "user") {
            const norm = text.toLowerCase().trim();
            const stopWords = ["stop", "roko", "band kro", "band karo", "band kar", "band krdo", "band kar do", "stop song", "stop video", "stop music", "gaana roko", "gana roko", "gaana band", "gana band", "pause song", "gaana band karo", "gana band karo", "gaana band kro", "gana band kro"];
            if (stopWords.some(word => norm.includes(word))) {
              setActiveMedia(null);
            }
          }
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
        console.error("Failed to start session", e);
        setShowPermissionModal(true);
        setIsSessionActive(false);
        setAppState("idle");
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
              handleLisaSpeak(`Aha! Toh tum ho ${user.name}. Baitho baitho, badi der lagayi aane me! Chalo, ab batao kya khichdi pakani hai?`);
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
          onUnlockSuccess={() => setIsAppUnlocked(true)}
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
        <div className="flex items-center gap-4 cursor-pointer group" onClick={toggleListening}>
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${activePalette.avatarBg} flex items-center justify-center font-bold text-sm shadow-xl shadow-black/20 group-hover:scale-105 transition-transform border border-white/10`}>
            L
          </div>
          <h1 className="text-xl font-serif font-medium tracking-wide text-white/90 group-hover:text-emerald-400 transition-colors">Lisa</h1>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => setShowProfileModal(true)}
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
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear the chat history?")) {
                  setMessages([]);
                  resetLisaSession();
                }
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10"
              title="Clear Chat History"
            >
              <Trash2 size={18} className="opacity-70" />
            </button>
          )}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowPaletteDropdown(!showPaletteDropdown)}
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
          {currentUser && (
            <button
              onClick={() => setIsStudyOpen(true)}
              className="p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 active:scale-95 transition-all cursor-pointer relative group flex items-center justify-center animate-pulse"
              style={{ animationDuration: "3s" }}
              title="Lisa's Study & Handwritten Notes Studio 📝"
            >
              <BookOpen size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#020509]" />
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-full transition-all border cursor-pointer ${
                isChatOpen 
                  ? `bg-white/15 text-white ${activePalette.accentBorder}` 
                  : "bg-white/5 text-white/70 hover:bg-white/10 border-white/10"
              }`}
              title={isChatOpen ? "Hide Chat Conversation" : "Show Chat Conversation"}
            >
              <MessageSquare size={18} />
            </button>
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
          <button
            onClick={() => setIsPDFMakerOpen(true)}
            className={`p-4 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer`}
            title="Open PDF Maker"
          >
            <FileText size={20} />
          </button>

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
                {(activeTab === "chat" ? messages : voiceMessages).length > 0 && (
                  <button
                    onClick={() => {
                      if (activeTab === "chat") {
                        if (confirm("Rukko! Kya sach me saari chat history udaani hai?")) {
                          setMessages([]);
                          resetLisaSession();
                        }
                      } else {
                        if (confirm("Kya aap saari Voice History (Speak memory) mitaana chahte hain? Isse Lisa purani voice baatein bhool jayegi!")) {
                          setVoiceMessages([]);
                        }
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer border border-red-500/15"
                    title={activeTab === "chat" ? "Clear Chat History" : "Clear Voice History"}
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
            <div className={`flex border-b ${activePalette.sidebarBorder} bg-white/[0.01] shrink-0`}>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "chat"
                    ? `text-white font-semibold bg-white/[0.03]`
                    : "border-transparent text-white/40 hover:text-white/60 hover:bg-white/[0.005]"
                }`}
                style={activeTab === "chat" ? { borderBottomColor: activePalette.visColors.listening.color } : {}}
              >
                <MessageSquare size={12} />
                <span>Chit-Chat ({messages.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("voice")}
                className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "voice"
                    ? `text-white font-semibold bg-white/[0.03]`
                    : "border-transparent text-white/40 hover:text-white/60 hover:bg-white/[0.005]"
                }`}
                style={activeTab === "voice" ? { borderBottomColor: activePalette.visColors.speaking.color } : {}}
              >
                <Mic size={12} />
                <span>Voice History ({voiceMessages.length})</span>
              </button>
            </div>

            {/* Dynamic Body Logs based on active tab */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
              {activeTab === "chat" ? (
                messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30 gap-3">
                    <div className={`w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center ${activePalette.accentText} opacity-60 animate-pulse`}>
                      <MessageSquare size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif italic text-sm text-white/60">"Chit-Chat khali padi hai..."</p>
                      <p className="text-xs font-mono max-w-[220px] leading-relaxed mx-auto text-white/40">
                        Kuch likho ya start session karke voice se baat kijiye! Lisa is text chat ko yaad rakhegi.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isLisa = msg.sender === "lisa";
                    return (
                      <motion.div
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col max-w-[85%] ${
                          isLisa ? "self-start items-start" : "self-end items-end"
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase tracking-widest text-white/35 mb-1 px-1">
                          {isLisa ? "Lisa ✨" : currentUser.name}
                        </span>
                        
                        <div className="group relative flex items-center gap-2">
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed whitespace-pre-wrap break-words ${
                              isLisa
                                ? "bg-gradient-to-br from-zinc-900 to-zinc-950 text-white/95 border border-white/5"
                                : `bg-gradient-to-r ${activePalette.accentGradient} text-white font-medium`
                            }`}
                          >
                            {msg.text}
                          </div>

                          <button
                            onClick={() => {
                              setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/85 text-red-500 hover:text-red-400 hover:bg-black transition-all absolute top-1/2 -translate-y-1/2 -left-9 cursor-pointer shadow-lg border border-red-500/10"
                            title="Mitao (Delete Chat Line)"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )
              ) : (
                voiceMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30 gap-3">
                    <div className={`w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center text-rose-400 opacity-60 animate-pulse`}>
                      <Mic size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif italic text-sm text-white/60">"Voice History khali hai..."</p>
                      <p className="text-xs font-mono max-w-[220px] leading-relaxed mx-auto text-white/40">
                        Start Session karke bolen. Jab aap baat karenge, Lisa voice notes save karegi and next time dynamic summaries se aapko purani baatein yaad dilayegi!
                      </p>
                    </div>
                  </div>
                ) : (
                  voiceMessages.map((msg, idx) => {
                    const isLisa = msg.sender === "lisa";
                    return (
                      <motion.div
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col max-w-[85%] ${
                          isLisa ? "self-start items-start" : "self-end items-end"
                        }`}
                      >
                        <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/55 mb-1 px-1 flex items-center gap-1">
                          <span>{isLisa ? "Lisa (Vocal) 🎙️" : `${currentUser.name} (Vocal) 👤`}</span>
                        </span>
                        
                        <div className="group relative flex items-center gap-2">
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed whitespace-pre-wrap break-words border ${
                              isLisa
                                ? "bg-zinc-950/90 text-white border-zinc-800"
                                : "bg-gradient-to-r from-emerald-950/50 to-teal-950/50 text-emerald-100 border-emerald-900/30 font-medium"
                            }`}
                          >
                            {msg.text}
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 absolute top-1/2 -translate-y-1/2 -left-9 transition-all">
                            <button
                              onClick={() => handleLisaSpeak(msg.text)}
                              className="p-1.5 rounded-lg bg-black/85 text-emerald-400 hover:text-emerald-300 hover:bg-black transition-all cursor-pointer shadow-lg border border-emerald-500/10"
                              title="Sunao (Play)"
                            >
                              <Play size={11} />
                            </button>
                            <button
                              onClick={() => {
                                setVoiceMessages((prev) => prev.filter((m) => m.id !== msg.id));
                              }}
                              className="p-1.5 rounded-lg bg-black/85 text-red-500 hover:text-red-400 hover:bg-black transition-all cursor-pointer shadow-lg border border-red-500/10"
                              title="Memory se mitaayein"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )
              )}
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
    </div>
  );
}
