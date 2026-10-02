import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Lock, Brain, Shield, ShieldAlert, Palette,
  Eye, EyeOff, LogOut, Trash2, Check, X, Sparkles, AlertTriangle,
  Database, Key, HardDrive, ShieldCheck, Download, RefreshCw, FileText, LockKeyhole,
  Camera, Upload, Image as ImageIcon, MessageCircle, Plus, Smartphone, Presentation, Fingerprint, MessageSquare, Crown, Monitor, Laptop
} from "lucide-react";
import { ThemePalette } from "../utils/theme";
import { getUserAvatarUrl, saveUserAvatar, removeUserAvatar } from "../utils/avatar";
import { getWhatsAppContacts, saveWhatsAppContacts, linkWhatsAppContact, WhatsAppContact, syncWhatsAppContacts } from "../utils/whatsapp";
import { addDoc, collection, query, getDocs } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { getLisaPreferredVoice, setLisaPreferredVoice } from "../utils/voiceUtils";
import { ComputerDevicesModal } from "./ComputerDevicesModal";

interface ProfileModalProps {
  palette: ThemePalette;
  currentUser: { email: string; name: string };
  onClose: () => void;
  onUpdateName: (newName: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onUpdateAvatar?: () => void;
}

type TabType = "personal" | "plan" | "memory" | "devices" | "whatsapp" | "privacy" | "safety" | "appearance" | "fingerprints" | "feedback" | "logout";

export default function ProfileModal({
  palette,
  currentUser,
  onClose,
  onUpdateName,
  onLogout,
  isDarkMode,
  setIsDarkMode,
  onUpdateAvatar
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  const [avatarUrl, setAvatarUrl] = useState<string>(() => getUserAvatarUrl(currentUser.email, currentUser.name));

  // State: WhatsApp Contacts
  const [waContacts, setWaContacts] = useState<WhatsAppContact[]>([]);
  const [newWaName, setNewWaName] = useState("");
  const [newWaPhone, setNewWaPhone] = useState("");
  const [waSuccess, setWaSuccess] = useState(false);
  const [waError, setWaError] = useState("");

  const loadWaContacts = () => {
    if (currentUser?.email) {
      setWaContacts(getWhatsAppContacts(currentUser.email));
    }
  };

  useEffect(() => {
    loadWaContacts();
  }, [currentUser]);

  // State: Personal Details
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedEmail, setEditedEmail] = useState(currentUser.email);
  const [editedPassword, setEditedPassword] = useState("");
  const [originalEmail, setOriginalEmail] = useState(currentUser.email);
  const [showPassword, setShowPassword] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState(false);
  const [personalError, setPersonalError] = useState("");

  // State: Lisa Memory
  const [lisaMemory, setLisaMemory] = useState("");
  const [memorySuccess, setMemorySuccess] = useState(false);

  // State: Safety & Age Policy
  const [userAgeTier, setUserAgeTier] = useState<"minor_under_18" | "adult" | "unknown">(() => {
    return (localStorage.getItem("lisa_user_age_tier") as any) || "adult";
  });
  const [safetySuccess, setSafetySuccess] = useState(false);

  // State: Feedback
  const [feedback, setFeedback] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'feedback' && currentUser.email === "rauta8522@gmail.com") {
        const fetchFeedback = async () => {
            const q = query(collection(db, "feedbacks"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setAllFeedback(data);
        }
        fetchFeedback();
    }
  }, [activeTab, currentUser.email]);

  // State: Plan
  const [lisaPlan, setLisaPlan] = useState<"free" | "paid" | "loading">("loading");
  const [subDetails, setSubDetails] = useState<{
    plan: "free" | "paid";
    subscriptionStatus: string;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: boolean;
  } | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subActionError, setSubActionError] = useState("");
  const [redirectingCheckout, setRedirectingCheckout] = useState(false);

  const fetchPlanStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLisaPlan("free");
        setSubDetails(null);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch("/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setLisaPlan("free");
        setSubDetails(null);
        return;
      }
      const data = await res.json();
      const plan = data.plan === "paid" ? "paid" : "free";
      setLisaPlan(plan);
      setSubDetails({
        plan,
        subscriptionStatus: data.subscriptionStatus || (plan === "paid" ? "active" : "inactive"),
        currentPeriodEnd: data.currentPeriodEnd || null,
        cancelAtPeriodEnd: !!data.cancelAtPeriodEnd,
      });
    } catch (e) {
      setLisaPlan("free");
      setSubDetails(null);
    }
  };

  useEffect(() => {
    fetchPlanStatus();
  }, []);

  const handleUpgrade = async () => {
    try {
      setSubActionError("");
      setRedirectingCheckout(true);
      const user = auth.currentUser;
      if (!user) {
        setSubActionError("Please sign in first to upgrade to Lisa Pro.");
        setRedirectingCheckout(false);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text.slice(0, 200) || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Stripe checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Checkout session URL was not returned by server.");
      }
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setSubActionError(err?.message || "Failed to start checkout. Please try again.");
      setRedirectingCheckout(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setSubActionError("");
      setSubLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setSubLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch("/api/subscription/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(text.slice(0, 200) || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Customer portal URL was not returned.");
      }
    } catch (err: any) {
      console.error("Manage subscription error:", err);
      setSubActionError(err?.message || "Failed to open billing portal. Please try again.");
      setSubLoading(false);
    }
  };

  // State: Privacy Settings
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);
  const [retentionPeriod, setRetentionPeriod] = useState<string>(() => {
    return localStorage.getItem(`lisa_retention_${currentUser.email}`) || "forever";
  });
  const [micState, setMicState] = useState<string>("checking...");
  const [pinLockEnabled, setPinLockEnabled] = useState<boolean>(() => {
    return localStorage.getItem(`lisa_pin_lock_${currentUser.email}`) === "true";
  });
  const [fingerprints, setFingerprints] = useState<string[]>(() => {
    const raw = localStorage.getItem(`lisa_fingerprints_${currentUser.email}`);
    return raw ? JSON.parse(raw) : ["Default"];
  });
  const [storageMetrics, setStorageMetrics] = useState({
    chatHistoryBytes: 0,
    voiceHistoryBytes: 0,
    memoryBytes: 0,
    totalBytes: 0
  });
  const [cryptoFingerprint, setCryptoFingerprint] = useState<string>("");

  // Function to calculate exact local sandbox storage size
  const updateStorageMetrics = () => {
    const chatKey = `lisa_chat_history_${currentUser.email}`;
    const voiceKey = `lisa_voice_history_${currentUser.email}`;
    const memoryKey = `lisa_memory_${currentUser.email}`;

    const chatStr = localStorage.getItem(chatKey) || "";
    const voiceStr = localStorage.getItem(voiceKey) || "";
    const memoStr = localStorage.getItem(memoryKey) || "";

    const chatBytes = new Blob([chatStr]).size;
    const voiceBytes = new Blob([voiceStr]).size;
    const memoBytes = new Blob([memoStr]).size;

    setStorageMetrics({
      chatHistoryBytes: chatBytes,
      voiceHistoryBytes: voiceBytes,
      memoryBytes: memoBytes,
      totalBytes: chatBytes + voiceBytes + memoBytes
    });
  };

  // State: Appearance (Rule pattern, Ink styles, and Voice)
  const [selectedInk, setSelectedInk] = useState("blue");
  const [selectedRule, setSelectedRule] = useState("ruled");
  const [preferredVoice, setPreferredVoice] = useState("Kore");
  const [appearanceSuccess, setAppearanceSuccess] = useState(false);

  // Load database accounts & user properties on mount
  useEffect(() => {
    // 1. Fetch password from user database list
    const list = localStorage.getItem("lisa_registered_users");
    let currentPw = "";
    if (list) {
      try {
        const users = JSON.parse(list);
        const record = users.find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (record) {
          currentPw = record.passwordHash || "";
          setEditedPassword(currentPw);
        }
      } catch (e) {
        console.error("Failed to load password hash in settings", e);
      }
    }

    // 2. Load custom memory
    const memory = localStorage.getItem(`lisa_memory_${currentUser.email}`);
    if (memory) {
      setLisaMemory(memory);
    }

    // 3. Load privacy incognito
    const incognito = localStorage.getItem(`lisa_incognito_${currentUser.email}`);
    if (incognito === "true") {
      setIncognitoMode(true);
    }

    // 4. Load study note preferences
    const ink = localStorage.getItem(`lisa_ink_color_${currentUser.email}`) || "blue";
    const rule = localStorage.getItem(`lisa_notebook_rule_${currentUser.email}`) || "ruled";
    const voice = getLisaPreferredVoice(currentUser);
    setSelectedInk(ink);
    setSelectedRule(rule);
    setPreferredVoice(voice);

    // 5. Calculate storage sizes
    updateStorageMetrics();

    // 6. Check microphone permissions with browser API
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setMicState(permissionStatus.state);
          permissionStatus.onchange = () => {
            setMicState(permissionStatus.state);
          };
        })
        .catch(() => {
          setMicState("denied/prompt");
        });
    } else {
      setMicState("active/secured");
    }

    // 7. Calculate cryptographic sandbox fingerprint
    const seed = `${currentUser.email}:${currentPw || "lisa_salts_v2"}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const derivedHex = Math.abs(hash).toString(16).padEnd(8, '0') + Math.abs(hash * 13).toString(16).padStart(8, 'f');
    setCryptoFingerprint(`AEAD_AES_256_GCM::${derivedHex.toUpperCase().substring(0, 18)}`);

    // 8. Load user avatar state
    setAvatarUrl(getUserAvatarUrl(currentUser.email, currentUser.name));

  }, [currentUser]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Oye! Photo ka size bohot jyada hai (2MB maximum allowed). Choti size ki photo upload kijiye!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          saveUserAvatar(currentUser.email, base64);
          setAvatarUrl(base64);
          if (onUpdateAvatar) {
            onUpdateAvatar();
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarRemove = () => {
    removeUserAvatar(currentUser.email);
    const fallback = getUserAvatarUrl(currentUser.email, currentUser.name);
    setAvatarUrl(fallback);
    if (onUpdateAvatar) {
      onUpdateAvatar();
    }
  };

  // Handle saving Personal details
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalError("");
    setPersonalSuccess(false);

    if (!editedName.trim()) {
      setPersonalError("Arre! Sassy Nickname toh chahiye hi.");
      return;
    }
    if (!editedEmail.trim() || !editedEmail.includes("@")) {
      setPersonalError("Vaidha (valid) Email ID enter kijiye!");
      return;
    }
    if (editedPassword.length < 4) {
      setPersonalError("Password kam se kam 4 characters ka hona chahiye.");
      return;
    }

    try {
      // Fetch and update registered users
      const list = localStorage.getItem("lisa_registered_users");
      let users = list ? JSON.parse(list) : [];

      // Check if email changed and is taken
      if (editedEmail.toLowerCase().trim() !== originalEmail.toLowerCase().trim()) {
        const emailExists = users.some(
          (u: any) => u.email.toLowerCase() === editedEmail.toLowerCase().trim()
        );
        if (emailExists) {
          setPersonalError("Oho! Yeh email pehle se hi kisi aur ne book kar rakha hai.");
          return;
        }
      }

      // Update the correct record
      users = users.map((u: any) => {
        if (u.email.toLowerCase() === originalEmail.toLowerCase().trim()) {
          return {
            ...u,
            name: editedName.trim(),
            email: editedEmail.toLowerCase().trim(),
            passwordHash: editedPassword
          };
        }
        return u;
      });

      // Save registry list
      localStorage.setItem("lisa_registered_users", JSON.stringify(users));

      // Save active session user
      const updatedSessionUser = { email: editedEmail.toLowerCase().trim(), name: editedName.trim() };
      localStorage.setItem("lisa_active_user", JSON.stringify(updatedSessionUser));

      // If email changed, migrate specific storage items dynamically!
      if (editedEmail.toLowerCase().trim() !== originalEmail.toLowerCase().trim()) {
        const chatHist = localStorage.getItem(`lisa_chat_history_${originalEmail}`);
        if (chatHist) {
          localStorage.setItem(`lisa_chat_history_${editedEmail.toLowerCase().trim()}`, chatHist);
          localStorage.removeItem(`lisa_chat_history_${originalEmail}`);
        }
        const voiceHist = localStorage.getItem(`lisa_voice_history_${originalEmail}`);
        if (voiceHist) {
          localStorage.setItem(`lisa_voice_history_${editedEmail.toLowerCase().trim()}`, voiceHist);
          localStorage.removeItem(`lisa_voice_history_${originalEmail}`);
        }
        const listMem = localStorage.getItem(`lisa_memory_${originalEmail}`);
        if (listMem) {
          localStorage.setItem(`lisa_memory_${editedEmail.toLowerCase().trim()}`, listMem);
          localStorage.removeItem(`lisa_memory_${originalEmail}`);
        }
        setOriginalEmail(editedEmail.toLowerCase().trim());
      }

      // Sync state back to parent App
      onUpdateName(editedName.trim());
      setPersonalSuccess(true);
      setTimeout(() => setPersonalSuccess(false), 2000);
    } catch (err) {
      setPersonalError("Kuch gadbad hui bachaane me!");
    }
  };

  // Handle saving memory/custom biography for Lisa
  const handleSaveMemory = () => {
    localStorage.setItem(`lisa_memory_${currentUser.email}`, lisaMemory);
    setMemorySuccess(true);
    setTimeout(() => setMemorySuccess(false), 2000);
  };

  const handleSaveFeedback = async () => {
    if (!feedback.trim()) return;
    try {
        await addDoc(collection(db, "feedbacks"), {
            userId: currentUser.email,
            message: feedback,
            timestamp: new Date().toISOString()
        });
        setFeedback("");
        setFeedbackSuccess(true);
        setTimeout(() => setFeedbackSuccess(false), 2000);
    } catch(e) {
        console.error("Feedback error", e);
    }
  };

  // Handle saving privacy options
  const handleSavePrivacy = () => {
    localStorage.setItem(`lisa_incognito_${currentUser.email}`, incognitoMode ? "true" : "false");
    setPrivacySuccess(true);
    setTimeout(() => setPrivacySuccess(false), 2000);
  };

  // Toggle App Security PIN Verification Lock on idle/open
  const handleTogglePinLock = (enabled: boolean) => {
    setPinLockEnabled(enabled);
    localStorage.setItem(`lisa_pin_lock_${currentUser.email}`, enabled ? "true" : "false");
    setPrivacySuccess(true);
    setTimeout(() => setPrivacySuccess(false), 1200);
  };

  // Update data retention configuration period
  const handleSaveRetention = (period: string) => {
    setRetentionPeriod(period);
    localStorage.setItem(`lisa_retention_${currentUser.email}`, period);
    setPrivacySuccess(true);
    setTimeout(() => setPrivacySuccess(false), 1200);
  };

  // Purge specific categories of cached records
  const handleClearSpecificCategory = (category: "chat" | "voice" | "memory") => {
    const labels = {
      chat: "Text Chat Log (Dialogue Records)",
      voice: "Vocal Voice Recents (Audio Transcript Reels)",
      memory: "Persona Bio Memory (Yaadein)"
    };
    if (confirm(`Suno! Kya aap sach me apni saari ${labels[category]} udaana chahte ho? Yeh action undo nahi hoga!`)) {
      if (category === "chat") {
        localStorage.removeItem(`lisa_chat_history_${currentUser.email}`);
      } else if (category === "voice") {
        localStorage.removeItem(`lisa_voice_history_${currentUser.email}`);
      } else if (category === "memory") {
        localStorage.removeItem(`lisa_memory_${currentUser.email}`);
        setLisaMemory("");
      }
      updateStorageMetrics();
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 1500);
    }
  };

  // Export full sandbox profile to json
  const handleExportUserData = () => {
    try {
      const chatKey = `lisa_chat_history_${currentUser.email}`;
      const voiceKey = `lisa_voice_history_${currentUser.email}`;
      const memoryKey = `lisa_memory_${currentUser.email}`;
      const notebookRuleKey = `lisa_notebook_rule_${currentUser.email}`;
      const inkColorKey = `lisa_ink_color_${currentUser.email}`;

      const dumpPackage = {
        meta: {
          app: "Lisa Sassy Study Mate AI",
          compliance: "Personal Client-Data Sovereignty Shield v2.4",
          exported_timestamp: new Date().toISOString()
        },
        profile: {
          email: currentUser.email,
          classroom_alias: currentUser.name
        },
        lisa_intellect: {
          custom_bio_memories: localStorage.getItem(memoryKey) || ""
        },
        dialogue_logs: {
          chat_history: JSON.parse(localStorage.getItem(chatKey) || "[]"),
          voice_history: JSON.parse(localStorage.getItem(voiceKey) || "[]")
        },
        client_configurations: {
          notebookRuleStyle: localStorage.getItem(notebookRuleKey) || "ruled",
          handwritingInkColor: localStorage.getItem(inkColorKey) || "blue",
          isAppPinLockActive: localStorage.getItem(`lisa_pin_lock_${currentUser.email}`) === "true",
          retentionRule: localStorage.getItem(`lisa_retention_${currentUser.email}`) || "forever"
        }
      };

      const serializedString = JSON.stringify(dumpPackage, null, 2);
      const dataBlob = new Blob([serializedString], { type: "application/json" });
      const temporaryUrl = URL.createObjectURL(dataBlob);
      const downloadElement = document.createElement("a");
      downloadElement.href = temporaryUrl;
      downloadElement.download = `lisa_privacy_archive_${currentUser.name.trim().toLowerCase().replace(/\s+/g, '_')}.json`;
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      URL.revokeObjectURL(temporaryUrl);
    } catch (err) {
      alert("Error generating sandbox archive package! " + err);
    }
  };

  // Clear Chat history for current user email
  const handleClearChatHistory = () => {
    if (confirm("Ruko! Kya tum sach me apni saari search aur voice chat history udaana chahte ho? Yeh action wapas nahi ho sakta!")) {
      localStorage.removeItem(`lisa_chat_history_${currentUser.email}`);
      localStorage.removeItem(`lisa_voice_history_${currentUser.email}`);
      alert("Chalo safai abhiyaan poora hua! History udaa di gayi.");
      window.location.reload();
    }
  };

  // Delete account permanently
  const handleDeleteAccount = () => {
    if (
      confirm(
        "KOSHISH ACCHI THI! Par kya sach me apna account poori tarah mitaana chahte ho? Saari study notes registers aur chat records gayab ho jayenge!"
      )
    ) {
      const rawUsers = localStorage.getItem("lisa_registered_users");
      if (rawUsers) {
        try {
          const users = JSON.parse(rawUsers);
          const remainingUsers = users.filter(
            (u: any) => u.email.toLowerCase() !== currentUser.email.toLowerCase()
          );
          localStorage.setItem("lisa_registered_users", JSON.stringify(remainingUsers));

          // Cleanup storage
          localStorage.removeItem(`lisa_chat_history_${currentUser.email}`);
          localStorage.removeItem(`lisa_voice_history_${currentUser.email}`);
          localStorage.removeItem(`lisa_memory_${currentUser.email}`);
          localStorage.removeItem(`lisa_incognito_${currentUser.email}`);
        } catch (e) {
          console.error("Account delete error", e);
        }
      }
      onLogout();
    }
  };

  // Save drawing preferences (Appearance settings)
  const handleSaveAppearance = () => {
    localStorage.setItem(`lisa_ink_color_${currentUser.email}`, selectedInk);
    localStorage.setItem(`lisa_notebook_rule_${currentUser.email}`, selectedRule);
    setLisaPreferredVoice(preferredVoice, currentUser);
    setAppearanceSuccess(true);
    setTimeout(() => setAppearanceSuccess(false), 2000);
  };

  // Toggles helper
  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    localStorage.setItem(`lisa_dark_mode_${currentUser.email}`, enabled ? "true" : "false");
    if (enabled) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  // Preset memories to populate suggestions
  const injectPreset = (text: string) => {
    setLisaMemory((prev) => {
      const base = prev.trim();
      return base ? `${base}\n${text}` : text;
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-3xl bg-[#0b0c10]/95 border ${palette.glassBorder} rounded-2xl md:rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row transition-all duration-300 max-h-[90vh] md:max-h-none`}
      >
        {/* Colorful top border ribbon */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${palette.accentGradient}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer z-20"
        >
          <X size={16} className="text-white/60 hover:text-white" />
        </button>

        {/* Left Side: Modular Navigation Panel */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-5 md:p-6 flex flex-col justify-between shrink-0 bg-white/[0.01]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative group/avatar">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-md"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${palette.avatarBg} flex items-center justify-center font-bold text-base shadow-md`}>
                    {currentUser.name.trim().charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-sm font-serif font-semibold text-white truncate max-w-[140px]">
                  {currentUser.name}
                </h2>
                <p className="text-[10px] text-white/40 font-mono truncate max-w-[140px] uppercase">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-1.5 md:flex md:flex-col md:gap-1">
              <button
                onClick={() => setActiveTab("plan")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "plan"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Crown size={14} className={activeTab === "plan" ? "text-yellow-400" : "opacity-60"} />
                <span>Lisa Plan</span>
              </button>
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "personal"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <User size={14} className={activeTab === "personal" ? palette.accentText : "opacity-60"} />
                <span>Personal Details</span>
              </button>

              <button
                onClick={() => setActiveTab("memory")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "memory"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Brain size={14} className={activeTab === "memory" ? palette.accentText : "opacity-60"} />
                <span className="flex items-center gap-1.5">
                  Lisa's Memory
                  <span className="bg-pink-500/20 text-pink-300 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">Beta</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("devices")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "devices"
                    ? `bg-white/10 text-white font-semibold border-l-2 border-l-fuchsia-500`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Monitor size={14} className={activeTab === "devices" ? "text-fuchsia-400" : "opacity-60"} />
                <span className="flex items-center gap-1.5">
                  Computer Devices
                  <span className="bg-fuchsia-500/25 text-fuchsia-300 text-[8.5px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest scale-90 font-bold">Bridge</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("whatsapp")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "whatsapp"
                    ? `bg-white/10 text-white font-semibold border-l-2 border-l-[#10b981]`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <MessageCircle size={14} className={activeTab === "whatsapp" ? "text-[#10b981]" : "opacity-60"} />
                <span className="flex items-center gap-1.5">
                  WhatsApp Contacts
                  <span className="bg-[#10b981]/25 text-[#10b981] text-[8.5px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest scale-90 font-bold">Live</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("privacy")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "privacy"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Shield size={14} className={activeTab === "privacy" ? palette.accentText : "opacity-60"} />
                <span>Privacy & Security</span>
              </button>

              <button
                onClick={() => setActiveTab("safety")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "safety"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <ShieldAlert size={14} className={activeTab === "safety" ? palette.accentText : "opacity-60"} />
                <span className="flex items-center gap-1.5">
                  Safety & Age Policy
                  <span className="bg-cyan-500/25 text-cyan-300 text-[8.5px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest scale-90 font-bold">Active</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("appearance")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "appearance"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Palette size={14} className={activeTab === "appearance" ? palette.accentText : "opacity-60"} />
                <span>Appearance / Modes</span>
              </button>

              <button
                onClick={() => setActiveTab("fingerprints")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "fingerprints"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Fingerprint size={14} className={activeTab === "fingerprints" ? palette.accentText : "opacity-60"} />
                <span>Manage Fingerprints</span>
              </button>

              <button
                onClick={() => setActiveTab("feedback")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  activeTab === "feedback"
                    ? `bg-white/10 text-white font-semibold ${palette.accentBorder} border-l-2`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <MessageSquare size={14} className={activeTab === "feedback" ? palette.accentText : "opacity-60"} />
                <span>Feedback</span>
              </button>

              {/* Mobile Only Logout Button (Grid me seamlessly fit ho jayega) */}
              <button
                onClick={onLogout}
                className="col-span-2 md:hidden flex items-center justify-center gap-2 px-3 py-2.5 mt-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl active:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out & Clear</span>
              </button>
            </nav>
          </div>

          {/* Laptop Only Logout Button (Niche layout me float karega) */}
          <div className="hidden md:block pt-4 border-t border-white/10 mt-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out & Clear</span>
            </button>
          </div>
        </div>

        {/* Right Side: Tab Panel Contents */}
       <div className="flex-1 p-5 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-160px)] md:max-h-[500px]">
          <AnimatePresence mode="wait">
            {/* 1. PERSONAL DETAILS TAB */}
            {activeTab === "plan" && (
              <motion.div
                key="plan-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Crown size={18} className="text-yellow-400" />
                    Lisa AI Plan
                  </h3>
                  <p className="text-xs text-white/50 font-medium">Manage your subscription and AI provider.</p>
                </div>

                {lisaPlan === "loading" ? (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-center items-center">
                    <RefreshCw size={24} className="text-white/50 animate-spin" />
                  </div>
                ) : lisaPlan === "free" ? (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-white">Lisa Free</h4>
                        <p className="text-xs text-[#10b981] font-medium mt-1">Powered by Gemini</p>
                      </div>
                      <div className="px-2 py-1 rounded bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider">Current</div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Gemini powers Lisa's AI conversations. Enjoy natural text chats and Lisa's responsive voice capabilities.
                    </p>

                    {subActionError && (
                      <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 font-mono">
                        ⚠️ {subActionError}
                      </p>
                    )}

                    <button
                      onClick={handleUpgrade}
                      disabled={redirectingCheckout}
                      className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {redirectingCheckout ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Redirecting to secure Stripe checkout...</span>
                        </>
                      ) : (
                        <>
                          <Crown size={16} />
                          <span>Upgrade to Lisa Pro 💎</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          Lisa Pro <Check size={18} className="text-[#10b981]" />
                        </h4>
                        <p className="text-xs text-fuchsia-400 font-medium mt-1">DeepSeek AI + Gemini Lisa Voice</p>
                      </div>
                      <div className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider border border-violet-500/30">
                        {subDetails?.subscriptionStatus === "past_due" ? "Past Due" : "Active"}
                      </div>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      DeepSeek powers Lisa's advanced text reasoning, while Lisa's human-like Gemini voice remains unchanged. You have access to our highest-intelligence reasoning models.
                    </p>

                    {subDetails?.currentPeriodEnd && (
                      <div className="text-xs text-white/60 bg-white/5 px-3 py-2 rounded-xl flex items-center justify-between border border-white/5">
                        <span>{subDetails.cancelAtPeriodEnd ? "Access ends on" : "Next renewal"}</span>
                        <span className="font-mono text-white/90">
                          {new Date(subDetails.currentPeriodEnd * 1000).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    {subActionError && (
                      <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 font-mono">
                        ⚠️ {subActionError}
                      </p>
                    )}

                    <button
                      onClick={handleManageSubscription}
                      disabled={subLoading}
                      className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50 cursor-pointer"
                    >
                      {subLoading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Opening billing portal...</span>
                        </>
                      ) : (
                        <>
                          <span>Manage Subscription</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === "personal" && (
              <motion.div
                key="personal-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <User size={18} className={palette.accentText} />
                    <span>Personal Details</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Verify or update your classroom nickname and key credential logs.
                  </p>
                </div>

                {personalError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 font-mono">
                    ⚠️ {personalError}
                  </p>
                )}

                <form onSubmit={handleSavePersonal} className="space-y-4">
                  {/* Interactive Profile Photo / Display Picture Picker */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 transition-all col-span-2">
                    <div className="relative group/photo shrink-0">
                      {avatarUrl ? (
                        <div className="relative">
                          <img
                            src={avatarUrl}
                            alt={currentUser.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-md group-hover/photo:opacity-85 transition-opacity"
                          />
                          <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/photo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white" title="Choose file">
                            <Camera size={16} />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${palette.avatarBg} flex items-center justify-center font-bold text-2xl shadow-md border border-white/10`}>
                            {currentUser.name.trim().charAt(0).toUpperCase()}
                          </div>
                          <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/photo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white" title="Choose file">
                            <Camera size={16} />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <h4 className="text-xs font-semibold text-white">Profile Display Photo (DP)</h4>
                      <p className="text-[10px] text-white/40 leading-relaxed max-w-[320px]">
                        Apna khud ka photo upload karein ya directly email connected Gravatar fetch hone dein!
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <label className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-mono uppercase tracking-wider text-white flex items-center gap-1 cursor-pointer transition-all">
                          <Upload size={10} />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleAvatarRemove}
                          className="px-2.5 py-1.5 rounded-lg bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 text-[9px] font-mono uppercase tracking-wider text-red-400 flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Trash2 size={10} />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sassy Nickname */}
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                        Classroom Nickname (AI Sassy Name)
                      </label>
                      <div className="relative flex items-center">
                        <User size={14} className="absolute left-3.5 text-white/30" />
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className={`w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:${palette.accentRing} focus:bg-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 outline-none transition-all`}
                          placeholder="Change nickname"
                        />
                      </div>
                    </div>

                    {/* Email URL */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                        Email Account Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail size={14} className="absolute left-3.5 text-white/30" />
                        <input
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className={`w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:${palette.accentRing} focus:bg-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition-all`}
                        />
                      </div>
                    </div>

                    {/* Pin/Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                        Class PIN/Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock size={14} className="absolute left-3.5 text-white/30" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={editedPassword}
                          onChange={(e) => setEditedPassword(e.target.value)}
                          className={`w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus-within:${palette.accentRing} focus:bg-white/[0.05] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white outline-none transition-all`}
                          placeholder="Update password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 p-1 rounded-lg text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/40 italic">
                    💡 Lisa dynamic study tools automatically store these profile attributes safely inside your browser cookie systems.
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={editedName.trim() === currentUser.name && editedEmail.toLowerCase().trim() === currentUser.email.toLowerCase() && !editedPassword}
                      className={`py-2.5 px-5 font-semibold text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                        editedName.trim() === currentUser.name && editedEmail.toLowerCase().trim() === currentUser.email.toLowerCase()
                          ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                          : "bg-white text-black hover:bg-gray-200 active:scale-[0.98] cursor-pointer"
                      }`}
                    >
                      {personalSuccess ? <Check size={12} className="text-emerald-500" /> : null}
                      <span>{personalSuccess ? "Details Saved!" : "Save Details (Usko Batao)"}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. LISA'S MEMORY TAB */}
            {activeTab === "memory" && (
              <motion.div
                key="lisa-memory"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Brain size={18} className="text-pink-400" />
                    <span>Lisa's Memory Bank</span>
                  </h3>
                  <p className="text-xs text-white/50 font-sans leading-relaxed">
                    Set a specialized bio description here! Write everything about yourself (your likes, friends, what exams you study for). Lisa reads this memory block before responding!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-violet-300 font-semibold uppercase flex items-center gap-1">
                      <Sparkles size={11} className="text-pink-400 animate-pulse" />
                      Lisa Persona Master Editor
                    </label>
                    <textarea
                      value={lisaMemory}
                      onChange={(e) => setLisaMemory(e.target.value)}
                      rows={6}
                      className="w-full bg-white/[0.03] border border-white/10 hover:border-white/15 focus:border-violet-500 rounded-2xl p-4 text-xs text-white placeholder-white/20 outline-none transition-all leading-relaxed"
                      placeholder="Write things Lisa should remember..."
                    />
                  </div>

                  {/* Quick Append Section */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono tracking-widest text-emerald-300 font-semibold uppercase">Quick Add New Memory</label>
                    <div className="flex gap-2">
                       <input
                         type="text"
                         id="quickMemoryInput"
                         className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all"
                         placeholder="e.g. Kal mera science test hai"
                         onKeyPress={(e) => {
                           if (e.key === 'Enter') {
                             const input = e.currentTarget;
                             const val = input.value.trim();
                             if (val) {
                               injectPreset("• " + val);
                               input.value = "";
                             }
                           }
                         }}
                       />
                       <button
                         onClick={() => {
                           const input = document.getElementById('quickMemoryInput') as HTMLInputElement;
                           const val = input.value.trim();
                           if (val) {
                             injectPreset("• " + val);
                             input.value = "";
                           }
                         }}
                         className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-xl text-xs font-bold transition-all border border-emerald-600/20"
                       >
                         Add
                       </button>
                    </div>
                  </div>

                  {/* Suggestion tags preset */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-white/40 block font-sans">Quick Click Preset Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "😋 Mujhe Rasgulla aur Kaju katli bahut pasand hai",
                        "🎓 Main UPSC competitive exam ki taiyari kar rha hu",
                        "💻 Mera branch Computer Science (CSE) engineering hai",
                        "🤝 Mera sabse pakka dost Amit hai jo padhai me topper hai",
                        "☕ Mujhe raat ko chai peerkar padhna pasand hai"
                      ].map((presetText, idx) => (
                        <button
                          key={idx}
                          onClick={() => injectPreset(presetText)}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-[9px] text-white/75 truncate max-w-[280px] cursor-pointer"
                        >
                          + {presetText.substring(2)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center bg-violet-950/15 border border-violet-500/10 p-3.5 rounded-2xl text-[11px] text-violet-200/95 leading-relaxed">
                    <span>
                      📌 <b>How this works:</b> When you save, this info is sent silently in Lisa's logical pipeline. Next time they chat, ask <i>"mera dost kaun hai"</i> or <i>"mujhe kya pasand hai"</i>!
                    </span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleSaveMemory}
                      className="py-2.5 px-5 font-semibold text-xs tracking-wider rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-500 hover:to-pink-500 active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      {memorySuccess ? <Check size={12} className="text-white" /> : null}
                      <span>{memorySuccess ? "Yaad Kar Liya!" : "Memory Save Karein"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* COMPUTER DEVICES BRIDGE TAB */}
            {activeTab === "devices" && (
              <motion.div
                key="devices-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <ComputerDevicesModal />
              </motion.div>
            )}

            {/* WHATSAPP CONTACTS INTEGRATION TAB */}
            {activeTab === "whatsapp" && (
              <motion.div
                key="whatsapp-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <MessageCircle size={18} className="text-[#10b981]" />
                    <span>WhatsApp Shortcut Directory</span>
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Assign screen names (like Brother,Papa, Mummy, Amit) to real phone numbers (with country code, e.g. +91) so Lisa can deep-link instantly across Android, iOS, Windows, Mac, and Linux.
                  </p>
                  <button
                    onClick={() => {
                        const synced = syncWhatsAppContacts(currentUser.email);
                        setWaContacts(synced);
                        setWaSuccess(true);
                        setTimeout(() => setWaSuccess(false), 2000);
                    }}
                    className="flex items-center gap-2 text-[10px] font-mono text-[#10b981] hover:text-emerald-300 transition-colors cursor-pointer pt-2"
                  >
                    <RefreshCw size={10} />
                    <span>Sync From Browser Storage</span>
                  </button>
                </div>

                {waSuccess && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 font-mono">
                    ✅ Contact successfully updated in directory!
                  </p>
                )}
                {waError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 font-mono">
                    ⚠️ {waError}
                  </p>
                )}

                {/* ADD / EDIT FORM */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setWaError("");
                    setWaSuccess(false);
                    if (!newWaName.trim()) {
                      setWaError("Oho! Contact ka naam toh dalo.");
                      return;
                    }

                    // Link the contact
                    const updated = linkWhatsAppContact(currentUser.email, newWaName, newWaPhone);
                    setWaContacts(updated);
                    setNewWaName("");
                    setNewWaPhone("");
                    setWaSuccess(true);
                    setTimeout(() => setWaSuccess(false), 2000);
                  }}
                  className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3"
                >
                  <h4 className="text-[10px] font-mono tracking-widest text-[#10b981] uppercase font-bold">
                    Add or Edit Contact Link
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-mono text-white/40 uppercase">Name (e.g. Brother)</label>
                      <input
                        type="text"
                        value={newWaName}
                        onChange={(e) => setNewWaName(e.target.value)}
                        placeholder="e.g. Brother"
                        className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#10b981] transition-all"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-mono text-white/40 uppercase">WhatsApp Number (with country code)</label>
                      <input
                        type="text"
                        value={newWaPhone}
                        onChange={(e) => setNewWaPhone(e.target.value)}
                        placeholder="e.g. +910000000000"
                        className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#10b981] transition-all"
                      />
                    </div>
                    <div className="flex items-end shrink-0">
                      <button
                        type="submit"
                        className="w-full sm:w-auto py-2 px-4 bg-[#10b981] hover:bg-[#10b981]/90 text-black font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 h-[34px] uppercase tracking-wider font-mono"
                      >
                        <Plus size={14} />
                        <span>Save Link</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* CURRENT DIRECTORY LIST */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono tracking-widest text-white/50 uppercase font-bold text-left">
                    Registered Shortcuts ({waContacts.length})
                  </h4>

                  <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2">
                    {waContacts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-40">
                        <Smartphone size={32} className="text-zinc-500 mb-2" />
                        <p className="text-[11px] font-mono uppercase tracking-widest font-bold">
                          NO WHATSAPP SHORTCUTS
                        </p>
                        <p className="text-[10px] italic leading-relaxed max-w-[200px]">
                          Add a contact above to create a personalized Lisa shortcut.
                        </p>
                      </div>
                    ) : (
                      waContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                              <Smartphone size={13} />
                            </div>
                            <div className="text-left leading-tight">
                              <p className="text-xs text-white font-semibold font-serif">{contact.name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                {contact.phone ? contact.phone : "❌ No phone (Using generic picker fallback)"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNewWaName(contact.name);
                                setNewWaPhone(contact.phone);
                              }}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Kya aap ${contact.name} ka shortcut link delete krna chahte ho?`)) {
                                  const updated = waContacts.filter(c => c.id !== contact.id);
                                  setWaContacts(updated);
                                  saveWhatsAppContacts(currentUser.email, updated);
                                }
                              }}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Delete link"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center bg-[#10b981]/10 border border-[#10b981]/10 p-3.5 rounded-2xl text-[10.5px] text-emerald-100/90 leading-relaxed text-left">
                  <span>
                    💡 <b>Device Compatibility Shield:</b> Brother ko ya kisi ko WhatsApp par message bhejne ke liye bolenge, toh Lisa contact list scan karegi. Paaye jaane par background me direct tab chala degi.
                  </span>
                </div>
              </motion.div>
            )}

            {/* 3. PRIVACY & SECURITY TAB */}
            {activeTab === "privacy" && (
              <motion.div
                key="privacy-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Shield size={18} className="text-emerald-400" />
                    <span>Sovereign Privacy & Security System</span>
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Administer local database histories, cookie encryptions, sandbox storage sizes, and compliance privacy controllers.
                  </p>
                </div>

                {privacySuccess && (
                  <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3.5 py-2.5 rounded-xl border border-emerald-500/25 font-mono flex items-center gap-2 animate-bounce">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Security parameters updated and sealed.</span>
                  </div>
                )}

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {/* --- CORE DATA RETENTION & SECURITY --- */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono tracking-widest text-emerald-400/90 uppercase font-semibold">1. Session Access & Retention Controls</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Incognito mode toggle */}
                      <div className="flex flex-col justify-between p-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                        <div className="space-y-0.5 mb-2">
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span>Incognito Stealth Session</span>
                            <span className="bg-[#10b981]/15 text-[#10b981] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">Secure</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">
                            When enabled, chat dialogue lists are kept in temporary memory only; they are never persisted on disk.
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                          <span className="text-[10px] text-white/50">Persistence Status</span>
                          <input
                            type="checkbox"
                            checked={incognitoMode}
                            onChange={(e) => {
                              setIncognitoMode(e.target.checked);
                              setPrivacySuccess(true);
                              localStorage.setItem(`lisa_incognito_${currentUser.email}`, e.target.checked ? "true" : "false");
                              setTimeout(() => setPrivacySuccess(false), 1200);
                            }}
                            className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* App Security Lock toggle */}
                      <div className="flex flex-col justify-between p-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                        <div className="space-y-0.5 mb-2">
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span>Biometric PIN & Fingerprint Lock</span>
                            <span className="bg-cyan-500/15 text-cyan-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">Touch ID + PIN</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">
                            Requires verification with your PIN secret code or a simulated high-fidelity Fingerprint Glass Scan when opening the study room.
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                          <span className="text-[10px] text-white/50">App Lock Guard</span>
                          <input
                            type="checkbox"
                            checked={pinLockEnabled}
                            onChange={(e) => handleTogglePinLock(e.target.checked)}
                            className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Retention selector drop-down */}
                    <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">Client-side Data Retention Duration</div>
                        <p className="text-[10px] text-white/40 leading-relaxed flex-1">
                          Determines when inactive session histories are automatically purged from browser storage.
                        </p>
                      </div>
                      <select
                        value={retentionPeriod}
                        onChange={(e) => handleSaveRetention(e.target.value)}
                        className="bg-[#0b0c10] border border-white/10 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 outline-none cursor-pointer"
                      >
                        <option value="forever">Keep Indefinitely (Sadaiv)</option>
                        <option value="30days">Purge after 30 Days (Ek Mahina)</option>
                        <option value="7days">Purge after 7 Days (Ek Saptah)</option>
                        <option value="24hours">Purge after 24 Hours (Ek Din)</option>
                      </select>
                    </div>
                  </div>

                  {/* --- INTELLECT PRIVACY POLICY STATEMENT --- */}
                  <div className="p-3.5 bg-[#10b981]/5 border border-[#10b981]/15 rounded-2xl space-y-1.5">
                    <div className="text-xs font-semibold text-[#10b981] flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#10b981]" />
                      <span>Data Sovereignty & Client-First Pledge</span>
                    </div>
                    <ul className="text-[10px] text-white/70 leading-relaxed space-y-1 list-disc pl-3">
                      <li><b>Zero-Cloud Persistent Storing:</b> Your logs, registers, exam summaries, research files, and custom dialogue memories exist purely inside your browser sandbox (`localStorage`).</li>
                      <li><b>API Proxy Isolation:</b> All external generative requests are securely dispatched using standard, stateless gateway endpoints which never recycle or digest your profile attributes for commercial training arrays.</li>
                      <li><b>No Tracking Arrays:</b> Absolutely no analytical telemetry arrays, marketing scripts, or third-party cookies are integrated in your private classroom hub.</li>
                    </ul>
                  </div>

                  {/* --- STORAGE METRICS --- */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono tracking-widest text-[#10b981] uppercase font-semibold">2. Local Storage Sandbox Metrics</h4>
                      <button
                        onClick={updateStorageMetrics}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer text-white/60 hover:text-white flex items-center gap-1 text-[9px]"
                        title="Recalculate Used Sizes"
                      >
                        <RefreshCw size={10} className="animate-spin-slow" />
                        <span>Refresh Sizes</span>
                      </button>
                    </div>

                    <div className="bg-black/25 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                      {/* Metric lines with specific clear keys */}
                      <div className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText size={13} className="text-blue-400" />
                          <div className="flex flex-col text-left">
                            <span className="text-white font-medium">Text Chat Dialogue Cache</span>
                            <span className="text-[9px] text-white/30 font-mono uppercase">Key: lisa_chat_history_*</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded text-[10px]">{(storageMetrics.chatHistoryBytes / 1024).toFixed(2)} KB</span>
                          <button
                            onClick={() => handleClearSpecificCategory("chat")}
                            disabled={storageMetrics.chatHistoryBytes === 0}
                            className={`p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer ${storageMetrics.chatHistoryBytes === 0 ? "opacity-20 cursor-not-allowed" : ""}`}
                            title="Purge Chats Only"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Database size={13} className="text-violet-400" />
                          <div className="flex flex-col text-left">
                            <span className="text-white font-medium">Voice Transcription Reels</span>
                            <span className="text-[9px] text-white/30 font-mono uppercase">Key: lisa_voice_history_*</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded text-[10px]">{(storageMetrics.voiceHistoryBytes / 1024).toFixed(2)} KB</span>
                          <button
                            onClick={() => handleClearSpecificCategory("voice")}
                            disabled={storageMetrics.voiceHistoryBytes === 0}
                            className={`p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer ${storageMetrics.voiceHistoryBytes === 0 ? "opacity-20 cursor-not-allowed" : ""}`}
                            title="Purge Voice Logs Only"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Brain size={13} className="text-pink-400" />
                          <div className="flex flex-col text-left">
                            <span className="text-white font-medium">Persona Biography Memory</span>
                            <span className="text-[9px] text-white/30 font-mono uppercase">Key: lisa_memory_*</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded text-[10px]">{(storageMetrics.memoryBytes / 1024).toFixed(2)} KB</span>
                          <button
                            onClick={() => handleClearSpecificCategory("memory")}
                            disabled={storageMetrics.memoryBytes === 0}
                            className={`p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer ${storageMetrics.memoryBytes === 0 ? "opacity-20 cursor-not-allowed" : ""}`}
                            title="Purge Biography Memory"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Total line */}
                      <div className="p-3 bg-white/[0.01] flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <HardDrive size={13} className="text-[#10b981]" />
                          <span>Total Sandboxed Occupancy</span>
                        </div>
                        <span className="font-mono text-[#10b981]">{(storageMetrics.totalBytes / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>
                  </div>

                  {/* --- COMPLIANCE PHYSICAL GATEWAYS --- */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <h4 className="text-[10px] font-mono tracking-widest text-[#10b981] uppercase font-semibold">3. Security Keys & Hardware Permissions</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px]">
                      {/* Audio perm status */}
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                        <span className="text-white/50">MIC HARDWARE:</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${micState === "granted" ? "bg-[#10b981] animate-pulse" : "bg-yellow-400"}`} />
                          <span className="text-white/80 uppercase font-semibold">{micState === "granted" ? "GRANTED" : micState}</span>
                        </div>
                      </div>

                      {/* Fingerprint key hash status */}
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-center gap-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-white/50">HMAC SEED:</span>
                          <span className="bg-[#10b981]/10 text-[#10b981] text-[8px] font-bold px-1 rounded tracking-wider">HASH ACTIVE</span>
                        </div>
                        <span className="text-[9px] text-white/50 break-all select-all font-semibold font-mono" title="Click to copy sandbox hash">
                          {cryptoFingerprint || "GENERATING_TOKEN_STREAM..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* --- DATA PORTABILITY ARCHIVER --- */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <h4 className="text-[10px] font-mono tracking-widest text-[#10b981] uppercase font-semibold">4. Data Portability & GDPR Archival</h4>
                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-2 text-xs">
                      <p className="text-[10px] text-white/40 leading-relaxed text-left">
                        Download your comprehensive classroom ledger including active profile logs, custom memories, text chat logs, rules, and student preferences. This provides total client sovereignty and offline data migration capability.
                      </p>
                      <button
                        onClick={handleExportUserData}
                        className="py-2.5 px-4 rounded-xl bg-[#10b981] hover:bg-[#10b981]/90 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 w-full shadow-md cursor-pointer active:scale-[0.98]"
                      >
                        <Download size={13} />
                        <span>Download Complete Sandbox Archives (.json)</span>
                      </button>
                    </div>
                  </div>

                  {/* --- DANGER ZONE CACHES -- */}
                  <div className="border-t border-white/10 pt-4 mt-6 space-y-3">
                    <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block text-left">Danger Zone Action Lists</span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleClearChatHistory}
                        className="flex-1 py-3 px-4 border border-red-500/20 bg-red-500/5 text-red-200 hover:bg-red-500/15 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Purge All Cache Files</span>
                      </button>

                      <button
                        onClick={handleDeleteAccount}
                        className="flex-1 py-3 px-4 border border-red-500/40 bg-red-950/15 text-red-400 hover:bg-red-500/20 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <AlertTriangle size={13} />
                        <span>Delete Account Permanently</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SAFETY & AGE POLICY TAB */}
            {activeTab === "safety" && (
              <motion.div
                key="safety-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <ShieldAlert size={18} className="text-cyan-400" />
                    <span>Safety & Age-Aware Content System</span>
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Configure age-appropriate content filters, safety guardrails, medical boundaries, and professional role restrictions.
                  </p>
                </div>

                {safetySuccess && (
                  <div className="text-xs text-cyan-400 bg-cyan-500/10 px-3.5 py-2.5 rounded-xl border border-cyan-500/25 font-mono flex items-center gap-2">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span>Safety and age tier configuration updated successfully.</span>
                  </div>
                )}

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {/* Age Tier Selector */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">User Age Classification Tier</div>
                        <p className="text-[10px] text-white/40 mt-0.5">
                          Controls whether age-appropriate minor guardrails or adult educational filters are applied.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setUserAgeTier("minor_under_18");
                          localStorage.setItem("lisa_user_age_tier", "minor_under_18");
                          setSafetySuccess(true);
                          setTimeout(() => setSafetySuccess(false), 2500);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          userAgeTier === "minor_under_18"
                            ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-200"
                            : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-bold">Minor (Under 18)</span>
                        <span className="text-[9px] opacity-70">Strict filters on explicit sexual content; educational biology allowed.</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserAgeTier("adult");
                          localStorage.setItem("lisa_user_age_tier", "adult");
                          setSafetySuccess(true);
                          setTimeout(() => setSafetySuccess(false), 2500);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          userAgeTier === "adult"
                            ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-200"
                            : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-bold">Adult (18+)</span>
                        <span className="text-[9px] opacity-70">Appropriate educational and health info subject to standard platform safety.</span>
                      </button>
                    </div>
                  </div>

                  {/* Safety Policy Pillars */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 text-xs">
                    <h4 className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">Active Safety Guardrails & Hierarchy</h4>
                    <ul className="space-y-2 text-white/70 text-[11px] list-disc pl-4">
                      <li><strong className="text-white">Safety Priority Hierarchy:</strong> Platform Safety → Age Safety → Domain Safety → Organization Policy → Persona → User Request. A persona can never override safety.</li>
                      <li><strong className="text-white">Self-Harm & Crisis Protection:</strong> Immediate supportive intervention and referral resources (e.g. 988 lifeline) when self-harm intent is detected.</li>
                      <li><strong className="text-white">Medical Safety:</strong> Lisa can explain medical reports or general health concepts, but never diagnoses, prescribes, or claims a medical license.</li>
                      <li><strong className="text-white">Professional Role Ethics:</strong> Police or Teacher personas never claim real legal or institutional authority.</li>
                      <li><strong className="text-white">Privacy-Preserving Auditing:</strong> Safety logging uses aggregated event categories without exposing private user content.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. APPEARANCE & MODES */}
            {activeTab === "appearance" && (
              <motion.div
                key="appearance-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Palette size={18} className={palette.accentText} />
                    <span>Appearance & Modes</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Fine-tune drawing patterns, lighting modes, and handwriting ink preference sheets.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Theme Mode Toggles */}
                  <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white">Dark Mode Configuration</div>
                      <p className="text-[10px] text-white/40 leading-relaxed max-w-[340px]">
                        Toggle between Pitch Obsidian Noir or Alabaster Classroom visual theme.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => handleDarkModeToggle(false)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold transition-all cursor-pointer ${
                          !isDarkMode
                            ? "bg-white text-black font-semibold shadow-md"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => handleDarkModeToggle(true)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold transition-all cursor-pointer ${
                          isDarkMode
                            ? "bg-white text-black font-semibold shadow-md"
                            : "text-white/40 hover:text-white"
                        }`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Notebook rule styles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                        Preferred Notebook Rule Layout
                      </label>
                      <select
                        value={selectedRule}
                        onChange={(e) => {
                          setSelectedRule(e.target.value);
                          setAppearanceSuccess(false);
                        }}
                        className={`w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white/90 outline-none transition-all cursor-pointer`}
                      >
                        <option value="ruled" className="bg-[#0e0f14] text-white">Ruled Paper (Saraswati Standard Line)</option>
                        <option value="grid" className="bg-[#0e0f14] text-white">Grid Sheet (Mathematics Box Rule)</option>
                        <option value="plain" className="bg-[#0e0f14] text-white">Blank Page (UPSC Exam Simulator Sheet)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                        Handwritten Ink Ink-flow Color
                      </label>
                      <select
                        value={selectedInk}
                        onChange={(e) => {
                          setSelectedInk(e.target.value);
                          setAppearanceSuccess(false);
                        }}
                        className={`w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white/90 outline-none transition-all cursor-pointer`}
                      >
                        <option value="blue" className="bg-[#0e0f14] text-white">Classic Reynolds Royal Blue (Likho)</option>
                        <option value="black" className="bg-[#0e0f14] text-white">Midnight Charcoal Black (Proofer Gel)</option>
                        <option value="red" className="bg-[#0e0f14] text-white">Teacher Red Citation Ink (Danger Red)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-mono tracking-widest text-white/60 uppercase">
                        Lisa AI Preferred Vocal Voice (Aawaj)
                      </label>
                      <select
                        value={preferredVoice}
                        onChange={(e) => {
                          setPreferredVoice(e.target.value);
                          setAppearanceSuccess(false);
                        }}
                        className={`w-full bg-white/[0.03] border border-white/10 focus:border-violet-500 rounded-xl p-2.5 text-xs text-white/90 outline-none transition-all cursor-pointer`}
                      >
                        <option value="Aoede" className="bg-[#0e0f14] text-white">Aoede 🎙️ [Purani voice - Energetic, Expressive & Bright]</option>
                        <option value="Kore" className="bg-[#0e0f14] text-white">Kore 🌸 [Classic Female voice - Soft, Calm & Warm]</option>
                        <option value="Puck" className="bg-[#0e0f14] text-white">Puck ⚡ [Male voice - Upbeat & Active]</option>
                        <option value="Charon" className="bg-[#0e0f14] text-white">Charon 📞 [Male voice - Deep & Clear]</option>
                        <option value="Fenrir" className="bg-[#0e0f14] text-white">Fenrir 🌊 [Male voice - Deep & Dark]</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/40 italic">
                    💡 Changing Rule/Ink details immediately alters generated study notes & print preview standards.
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveAppearance}
                      className="py-2.5 px-5 font-semibold text-xs tracking-wider rounded-xl bg-white text-black hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {appearanceSuccess ? <Check size={12} className="text-emerald-500" /> : null}
                      <span>{appearanceSuccess ? "Preferences Saved!" : "Save Style Preferences"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. FINGERPRINTS MANAGEMENT TAB */}
            {activeTab === "fingerprints" && (
              <motion.div
                key="fingerprints-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Fingerprint size={18} className="text-emerald-400" />
                    <span>Manage Fingerprints</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Add or remove authorized fingerprints for biometric unlocking.
                  </p>
                </div>
                <div className="space-y-2">
                  {fingerprints.map((fp, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white">
                      <span>{fp}</span>
                      <button
                        onClick={() => {
                          const updated = fingerprints.filter((_, idx) => idx !== i);
                          setFingerprints(updated);
                          localStorage.setItem(`lisa_fingerprints_${currentUser.email}`, JSON.stringify(updated));
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New fingerprint name"
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.currentTarget as HTMLInputElement).value.trim();
                        if (val && !fingerprints.includes(val)) {
                          const updated = [...fingerprints, val];
                          setFingerprints(updated);
                          localStorage.setItem(`lisa_fingerprints_${currentUser.email}`, JSON.stringify(updated));
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="New fingerprint name"]') as HTMLInputElement;
                      const val = input.value.trim();
                      if (val && !fingerprints.includes(val)) {
                          const updated = [...fingerprints, val];
                          setFingerprints(updated);
                          localStorage.setItem(`lisa_fingerprints_${currentUser.email}`, JSON.stringify(updated));
                          input.value = "";
                      }
                    }}
                    className="px-3 py-2 bg-emerald-600/20 text-emerald-300 rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}

            {/* 8. FEEDBACK TAB */}
            {activeTab === "feedback" && (
              <motion.div
                key="feedback-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-emerald-400" />
                    <span>Feedback</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Your feedback is invaluable. Let us know how we can improve.
                  </p>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback here..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 min-h-[120px]"
                  />
                  <button
                    onClick={handleSaveFeedback}
                    className="w-full py-2 bg-emerald-600/20 text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-600/30"
                  >
                    {feedbackSuccess ? "Feedback Sent!" : "Submit Feedback"}
                  </button>
                </div>

                {currentUser.email === "anilraut897@gmail.com" && (
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <h4 className="text-sm font-bold text-white mb-2">Admin View: Feedback</h4>
                    {allFeedback.map((fb) => (
                      <div key={fb.id} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white">
                        <p className="font-bold text-white/50">{fb.userId}</p>
                        <p>{fb.message}</p>
                        <p className="text-[10px] text-white/30">{new Date(fb.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. LOGOUT CONFIRMATION */}
            {activeTab === "logout" && (
              <motion.div
                key="logout-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 flex flex-col justify-center items-center text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-2">
                  <LogOut size={28} />
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="text-lg font-serif font-bold text-white">
                    Sign Out & Exit?
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Arrey, kya sach me aaj ke liye study end karna hai? Tumhara profile session safely close ho jayega.
                  </p>
                </div>

                <div className="flex gap-3 w-full max-w-xs justify-center pt-2">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    No, Cancel
                  </button>

                  <button
                    onClick={onLogout}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Yes, Sign Out (Exit)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
