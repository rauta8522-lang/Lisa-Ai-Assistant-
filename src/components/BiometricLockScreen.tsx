import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Fingerprint, Lock, ShieldCheck, Key, Sparkles, AlertCircle, RefreshCw, Delete } from "lucide-react";
import { ThemePalette } from "../utils/theme";

interface BiometricLockScreenProps {
  currentUser: { email: string; name: string };
  palette: ThemePalette;
  onUnlockSuccess: () => void;
  onLisaSpeak?: (text: string) => void;
}

export default function BiometricLockScreen({ 
  currentUser, 
  palette, 
  onUnlockSuccess, 
  onLisaSpeak 
}: BiometricLockScreenProps) {
  const [authMode, setAuthMode] = useState<"fingerprint" | "pin">("fingerprint");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [sassyMessage, setSassyMessage] = useState("Oho! Apna angutha (fingerprint) touch-sensor par dharo jaldi se!");
  
  // PIN lock variables
  const [pinCode, setPinCode] = useState("");
  const [pinError, setPinError] = useState("");
  const [registeredPassword, setRegisteredPassword] = useState("");

  // Retrieve correct user password for verification from registered users lists
  useEffect(() => {
    const list = localStorage.getItem("lisa_registered_users");
    if (list) {
      try {
        const users = JSON.parse(list);
        const record = users.find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (record) {
          setRegisteredPassword(record.passwordHash || "");
        }
      } catch (e) {
        console.error("Biometric PIN check error", e);
      }
    }
  }, [currentUser]);

  // Handle fingerprint simulation starting on touch down/mouse down
  const startFingerprintScan = () => {
    if (scanState === "success") return;
    
    setIsScanning(true);
    setScanProgress(0);
    setScanState("scanning");
    setSassyMessage("Ruko! Lines analyze ho rahi hain... hilaana mat ungli!");
    
    // Play cool sound effects or speak simulation lines
    if (onLisaSpeak) {
      // Small randomized spoken cue or text tips
      const sassTips = [
        "Scanning lines... tumhare anguthe ka chakra dekhne do!",
        "Chori chakkari toh nahi kar rahe na? Sensor analysis on!",
        "Shaant bilkul shaant! Server key decrypt ho rahi hai."
      ];
      const randomText = sassTips[Math.floor(Math.random() * sassTips.length)];
      // Speak occasional cues asynchronously if needed
    }
  };

  // Run progress ticks when scanning
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning && scanProgress < 100) {
      timer = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 8) + 6;
          if (next >= 100) {
            clearInterval(timer);
            setIsScanning(false);
            verifyFingerprintSuccess();
            return 100;
          }
          return next;
        });
      }, 120);
    }
    return () => clearInterval(timer);
  }, [isScanning, scanProgress]);

  // Cancel scan if released early (forces persistent press simulation experience)
  const cancelFingerprintScan = () => {
    if (scanState === "scanning" && scanProgress < 100) {
      setIsScanning(false);
      setScanProgress(0);
      setScanState("idle");
      setSassyMessage("Arre beech me hi chhod diya? Dabaakar rakho dhande se!");
    }
  };

  // Perform virtual verification completion
  const verifyFingerprintSuccess = () => {
    // Check against authorized fingerprints
    const storedFingerprints = localStorage.getItem(`lisa_fingerprints_${currentUser.email}`);
    const authorized = storedFingerprints ? JSON.parse(storedFingerprints) : ["Default"]; // Default fingerprint for new users
    
    // Simulate fingerprint check - it matches if any fingerprint exists.
    // In a real app, this would use a biometric API.
    const isMockMatch = authorized.length > 0;

    if (isMockMatch) {
      setScanState("success");
      setSassyMessage(`Fingerprint match: ${authorized[Math.floor(Math.random() * authorized.length)]}. Khul ja sim sim! ✨`);
      if (onLisaSpeak) {
        onLisaSpeak(`Shashtha! Fingerprint authentic ho gayi, andr aao meri jaan.`);
      }
      setTimeout(() => {
        onUnlockSuccess();
      }, 1200);
    } else {
      setScanState("error");
      setSassyMessage("Oye! Koi bhi ungli match nahi hui. Sahi wala angutha tikao phirse!");
      setTimeout(() => {
        setScanState("idle");
        setScanProgress(0);
      }, 2000);
    }
  };

  // Handle PIN verification submission
  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError("");

    if (!pinCode) {
      setPinError("Ghabrao mat, PIN daalo!");
      return;
    }

    if (registeredPassword && pinCode === registeredPassword) {
      setScanState("success");
      setSassyMessage("Ah! Sahi PIN dakhil kiya. Room unlock kiya ja raha hai...");
      setTimeout(() => {
        onUnlockSuccess();
      }, 1000);
    } else {
      setPinError("Oho! Galat PIN code thoka hai. Dhyan se koshish karo!");
      setPinCode("");
    }
  };

  const handleKeypadPress = (val: string) => {
    setPinError("");
    if (pinCode.length < 8) {
      setPinCode((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setPinCode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020508]/96 backdrop-blur-2xl p-4 select-none">
      {/* Background radial glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-tr ${palette.glowTop} opacity-15 blur-[120px] rounded-full pointer-events-none`} />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.96 }}
        className="w-full max-w-sm bg-[#0a0c10]/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-md text-center"
      >
        {/* Glow accent frame strips */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 animate-pulse" />

        {/* Security badge icon header */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            {scanState === "success" ? (
              <ShieldCheck size={22} className="animate-bounce" />
            ) : (
              <Lock size={20} className="animate-pulse" />
            )}
          </div>
          <h2 className="text-xl font-serif text-white font-bold tracking-wide">
            Sovereign Shield Activator
          </h2>
          <p className="text-[10px] text-white/40 tracking-widest font-mono uppercase mt-0.5">
            Secured Sandbox Access Room
          </p>
        </div>

        {/* Sassy Instruction bubble */}
        <div className="min-h-[56px] px-3.5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 flex items-center justify-center">
          <p className="text-xs text-white/80 leading-relaxed italic">
            💡 “{sassyMessage}”
          </p>
        </div>

        {/* Main Verification Interface Area */}
        <AnimatePresence mode="wait">
          {authMode === "fingerprint" ? (
            <motion.div
              key="fingerprintMode"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col items-center py-4"
            >
              {/* Glowing Interactive Fingerprint Scanner Button */}
              <div className="relative mb-6">
                {/* Simulated concentric loading lines */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke={scanState === "success" ? "#10b981" : scanState === "error" ? "#ef4444" : "#10b981"}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - scanProgress / 100)}
                    className="transition-all duration-100 ease-out"
                  />
                </svg>

                {/* Simulated circular push touch button */}
                <button
                  onMouseDown={startFingerprintScan}
                  onMouseUp={cancelFingerprintScan}
                  onMouseLeave={cancelFingerprintScan}
                  onTouchStart={startFingerprintScan}
                  onTouchEnd={cancelFingerprintScan}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex flex-col items-center justify-center border transition-all cursor-pointer select-none active:scale-95 ${
                    isScanning 
                      ? "bg-emerald-500/10 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse" 
                      : scanState === "success"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                      : "bg-white/[0.02] border-white/15 hover:border-white/30 text-white/70 active:bg-white/[0.05]"
                  }`}
                  style={{ touchAction: "none" }}
                  title="HOLD TO SCAN"
                >
                  <Fingerprint size={42} className={isScanning ? "animate-ping scale-90" : "animate-un-pulse"} />
                  {isScanning && (
                    <span className="absolute bottom-3 font-mono font-bold text-[9px] text-[#10b981] uppercase tracking-widest">
                      {scanProgress}%
                    </span>
                  )}
                </button>

                {/* Laser scan line effect during scanning */}
                {isScanning && (
                  <motion.div 
                    initial={{ top: "15%" }}
                    animate={{ top: "85%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-x-0 w-[70%] mx-auto h-[2px] bg-cyan-400/80 shadow-[0_0_8px_#22d3ee] pointer-events-none rounded-full z-10" 
                  />
                )}
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono tracking-widest text-[#10b981] uppercase font-bold">
                  {isScanning ? "RECOGNIZING BIOMETRICS..." : "HOLD GLASS SENSOR PLACE"}
                </span>
                <p className="text-[9px] text-white/30 font-sans max-w-[200px] leading-relaxed mx-auto">
                  Click and keep holding the fingerprint to verify Touch ID credential tokens.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pinMode"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col items-center"
            >
              {/* Password Dots representation */}
              <div className="flex justify-center items-center gap-2 mb-4 h-6">
                {Array.from({ length: Math.max(pinCode.length, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border transition-all duration-200 ${
                      i < pinCode.length
                        ? `bg-gradient-to-r ${palette.accentGradient} border-transparent scale-110 shadow`
                        : "border-white/20 bg-transparent"
                    }`}
                  />
                ))}
              </div>

              {/* Pin Error messages */}
              {pinError && (
                <div className="text-[10px] text-red-400 font-mono mb-3 bg-red-500/10 px-2 py-1 rounded">
                  ⚠️ {pinError}
                </div>
              )}

              {/* Pin Grid keypad buttons */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mb-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-11 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-sm font-semibold tracking-wider transition-colors border border-white/5 flex items-center justify-center text-white cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Backspace utility */}
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 rounded-xl bg-white/[0.02] hover:bg-white/10 active:scale-95 text-red-400 text-xs transition-colors border border-white/5 flex items-center justify-center cursor-pointer"
                  title="Mitao (Backspace)"
                >
                  <Delete size={15} />
                </button>
                
                {/* 0 digit */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="h-11 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-sm font-semibold tracking-wider transition-colors border border-white/5 flex items-center justify-center text-white cursor-pointer"
                >
                  0
                </button>

                {/* Confirm OK code button */}
                <button
                  type="button"
                  onClick={() => handlePinSubmit()}
                  disabled={pinCode.length === 0}
                  className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 active:scale-95 text-black font-extrabold text-xs transition-all border border-transparent flex items-center justify-center disabled:opacity-30 cursor-pointer shadow-md"
                >
                  PROCEED
                </button>
              </div>
              <button 
                onClick={() => {
                  const email = prompt("Enter your registered email to reset PIN:");
                  if (email && email.toLowerCase() === currentUser.email.toLowerCase()) {
                    // Reset PIN in local storage
                    const list = localStorage.getItem("lisa_registered_users");
                    if (list) {
                      const users = JSON.parse(list);
                      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
                      if (userIndex !== -1) {
                        users[userIndex].passwordHash = ""; // Clear existing PIN
                        localStorage.setItem("lisa_registered_users", JSON.stringify(users));
                        alert("PIN reset successfully. Please register a new PIN when logging in.");
                        window.location.reload();
                      }
                    }
                  } else if (email) {
                    alert("Incorrect email.");
                  }
                }}
                className="text-[10px] text-white/50 hover:text-emerald-400 mt-2 underline"
              >
                Forgot PIN?
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Mode Access Link */}
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-center items-center">
          <button
            onClick={() => {
              setAuthMode(authMode === "fingerprint" ? "pin" : "fingerprint");
              setPinCode("");
              setPinError("");
              setSassyMessage(
                authMode === "fingerprint"
                  ? "Sahi hai! Agar ungli kanch par chipak rahi thi, toh PIN type karo!"
                  : "Chalo, vapis biometric finger security scanner par aate hain!"
              );
            }}
            className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Key size={10} />
            <span>Switch to {authMode === "fingerprint" ? "PIN Passcode" : "Biometrics Touch Scan"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
