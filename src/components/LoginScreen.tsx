import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Lock, Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";
import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string }) => void;
  onLisaSpeak: (text: string) => void;
}

interface UserAccount {
  email: string;
  name: string;
  passwordHash: string; // Stored directly per local storage requirements
}

export default function LoginScreen({ onLoginSuccess, onLisaSpeak }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to fetch registered users
  const getRegisteredUsers = (): UserAccount[] => {
    const list = localStorage.getItem("lisa_registered_users");
    if (list) {
      try {
        return JSON.parse(list);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Handle Form actions
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email && user.displayName) {
        onLoginSuccess({ email: user.email, name: user.displayName });
      } else {
        // Fallback for missing display name
        onLoginSuccess({ email: user.email || "", name: user.email?.split('@')[0] || "User" });
      }
    } catch (err: any) {
      setErrorMsg("Google login failed.");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg("Arey! Khali chhod diya? Dono fields bharo!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const users = getRegisteredUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === loginEmail.toLowerCase().trim()
      );

      if (!user) {
        setErrorMsg("Uff! Aisa koi user milahi nahi. Register kiya kya?");
        setIsSubmitting(false);
        return;
      }

      if (user.passwordHash !== loginPassword) {
        setErrorMsg("Oho! Galat password. Kahin bhool toh nahi gaye?");
        setIsSubmitting(false);
        return;
      }

      // Success
      setSuccessMsg(`Aha! Sahi dakhila mila.`);
      setIsSubmitting(false);
      
      // Trigger voice greeting via App
      onLoginSuccess({ email: user.email, name: user.name });
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
      setErrorMsg("Sari details dalo ji! Kuch bhi chhodna mana hai.");
      return;
    }

    if (regName.trim().length < 2) {
      setErrorMsg("Aisa kaisa chhota naam? At least 2 letters daalo!");
      return;
    }

    if (!regEmail.includes("@") || !regEmail.includes(".")) {
      setErrorMsg("Yeh email hai ya mazak? Sahi email thoko!");
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg("Uff, secret code thoda lamba dalo! (At least 4 keys)");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Password matches nahi ho rahe! Check karo phirse.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const users = getRegisteredUsers();
      const alreadyExists = users.some(
        (u) => u.email.toLowerCase() === regEmail.toLowerCase().trim()
      );

      if (alreadyExists) {
        setErrorMsg("Arey! Yeh email toh already registered hai. Log in karo!");
        setIsSubmitting(false);
        return;
      }

      const newUser: UserAccount = {
        email: regEmail.toLowerCase().trim(),
        name: regName.trim(),
        passwordHash: regPassword,
      };

      const updatedList = [...users, newUser];
      localStorage.setItem("lisa_registered_users", JSON.stringify(updatedList));

      setSuccessMsg("Waah! Naya Account ban gaya. Ab jaldi se log in karo!");
      
      // Keep name & email filled in login
      setLoginEmail(newUser.email);
      setLoginPassword(newUser.passwordHash);
      
      setIsSubmitting(false);
      
      // Dynamic sassy spoken cue!
      onLisaSpeak(`Wah kshama, naya account toh ban gaya. Chalo ab fatfat login karo aur shubharambh kijiye!`);
      
      // Switch view after 1.5s
      setTimeout(() => {
        setActiveTab("login");
        setSuccessMsg("");
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#02080b]/90 backdrop-blur-xl p-4 overflow-y-auto">
      {/* Absolute animated background pulses */}
      <div className="absolute inset-x-0 top-[-20%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-x-0 bottom-[-20%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0b0c10]/80 border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col relative overflow-hidden backdrop-blur-md"
      >
        {/* Glow corner decorations */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-500/15 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-violet-500/15 blur-2xl rounded-full pointer-events-none" />

        {/* Header Ribbon */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

        {/* Robot/Sassy Logo Icon */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 p-[2px] mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold font-serif text-2xl text-white">
              L
            </div>
            <span className="absolute -bottom-1 -right-1 bg-violet-500 text-[10px] text-white px-2 py-0.5 rounded-full uppercase font-mono tracking-tight shadow">
              ONLINE
            </span>
          </div>
          <h2 className="text-3xl font-serif font-semibold tracking-wider text-white">
            Lisa AI
          </h2>
          <p className="text-white/50 text-xs mt-1 font-mono uppercase tracking-widest">
            Witty Voice Partner
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mb-6 relative">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2.5 text-center text-sm font-semibold tracking-wide rounded-xl relative z-10 transition-all ${
              activeTab === "login" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {activeTab === "login" && (
              <motion.div
                layoutId="activeTabUnderlay"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{ type: "smooth", duration: 0.2 }}
              />
            )}
            Dakhil Ho (Log In)
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-2.5 text-center text-sm font-semibold tracking-wide rounded-xl relative z-10 transition-all ${
              activeTab === "register" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {activeTab === "register" && (
              <motion.div
                layoutId="activeTabUnderlay"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{ type: "smooth", duration: 0.2 }}
              />
            )}
            Naya Account (Register)
          </button>
        </div>

        {/* Lisa's Sassy Subtext Box */}
        <div className="bg-gradient-to-r from-violet-950/40 to-pink-950/40 border border-violet-500/10 rounded-2xl p-4 mb-6 relative">
          <p className="text-[10px] font-mono uppercase tracking-widest text-violet-300 font-semibold mb-1 flex items-center gap-1">
            <Sparkles size={10} className="text-pink-400 animate-spin" />
            Lisa's Tip
          </p>
          <p className="text-xs text-white/80 italic leading-relaxed">
            {activeTab === "login"
              ? "“Uff, credentials dalo aur ghuso fatfat! Password bhulane ki aadat thodi kam karo please.”"
              : "“Apna wahi stylish nickname dalo jise pukarne me mujhe thodi feeling aaye. Sunder sa, okay?”"}
          </p>
        </div>

        {/* Feedback Alert banners */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl p-3 mb-4 text-center leading-relaxed font-mono shadow-[0_0_10px_rgba(239,68,68,0.1)]"
            >
              ⚠️ {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl p-3 mb-4 text-center leading-relaxed font-mono shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              ✨ {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form area */}
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.form
              key="loginForm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLoginSubmit}
              className="flex flex-col gap-4"
            >
              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Email ID
                </label>
                <div className="relative flex items-center">
                  <Mail
                    size={16}
                    className="absolute left-3.5 text-white/30 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter email ID"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.05] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock
                    size={16}
                    className="absolute left-3.5 text-white/30 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.05] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 rounded-lg text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-6 rounded-xl font-semibold tracking-wide bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-500 hover:to-pink-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Checking user details...
                  </>
                ) : (
                  <>
                    <span>Chal, Shuru Ho! (Log In)</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-[10px] text-white/30 uppercase font-mono tracking-widest">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl font-semibold tracking-wide bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
              >
                <span>Continue with Google</span>
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="registerForm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegisterSubmit}
              className="flex flex-col gap-4 overflow-y-auto max-h-[280px] pr-1 scrollbar-hide"
            >
              {/* Nickname / Display Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Sassy Name (AI will address you by this)
                </label>
                <div className="relative flex items-center">
                  <User
                    size={16}
                    className="absolute left-3.5 text-white/30 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rahul, Tanya, Simran"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.05] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Register Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Email URL / Account Identifier
                </label>
                <div className="relative flex items-center">
                  <Mail
                    size={16}
                    className="absolute left-3.5 text-white/30 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Enter real or alias email"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.05] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Pin / Password
                </label>
                <div className="relative flex items-center">
                  <Lock
                    size={16}
                    className="absolute left-3.5 text-white/30 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Set private PIN/Password"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.05] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 rounded-lg text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                  Confirm Code
                </label>
                <div className="relative flex items-center">
                  <Lock
                    size={16}
                    className="absolute left-3.5 text-white/30 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Verify code"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-violet-500 focus:bg-white/[0.05] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-6 rounded-xl font-semibold tracking-wide bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-500 hover:to-pink-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <span>Account Khata Kholen (Register)</span>
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-white/25 text-[10px] text-center mt-6 tracking-wide font-mono">
          Made with ❤️ for Voice Companion Systems • Secures client-side
        </p>
      </motion.div>
    </div>
  );
}
