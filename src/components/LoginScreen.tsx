import React, { useState } from "react";
import { motion } from "motion/react";
import { signInWithPopup } from "firebase/auth";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { auth, googleProvider } from "../config/firebase";

const logo = "/pwa-512x512.png";

interface LoginScreenProps {
  onLoginSuccess: (user: {uid: string; email: string; name: string;}) => void;
  onLisaSpeak: (text: string) => void;
}
export default function LoginScreen({ onLoginSuccess, onLisaSpeak }: LoginScreenProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const emailVal = email.trim();
    const passVal = password.trim();

    if (!emailVal || !passVal) {
      setError("Please complete all fields before continuing.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const list = localStorage.getItem("lisa_registered_users");
      let users = [];
      if (list) {
        try {
          users = JSON.parse(list);
        } catch (e) {
          users = [];
        }
      }

      const user = users.find(
        (u: any) => u.email.toLowerCase() === emailVal.toLowerCase()
      );

      if (!user) {
        setError("Uff! Aisa koi user milahi nahi. Register kiya kya?");
        setLoading(false);
        return;
      }

      if (user.passwordHash !== passVal) {
        setError("Oho! Galat password. Kahin bhool toh nahi gaye?");
        setLoading(false);
        return;
      }

      setLoading(false);
      onLoginSuccess({uid: user.uid, email: user.email!, name: user.displayName || "User"});
    }, 700);
  };

  const handleSignup = async () => {
    setError("");

    const nameVal = username.trim();
    const emailVal = signupEmail.trim();
    const passVal = signupPassword;
    const confirmVal = confirmPassword;

    if (!nameVal || !emailVal || !passVal || !confirmVal) {
      setError("Please complete every field to create your account.");
      return;
    }

    if (nameVal.length < 2) {
      setError("Aisa kaisa chhota naam? At least 2 letters daalo!");
      return;
    }

    if (!emailVal.includes("@") || !emailVal.includes(".")) {
      setError("Yeh email hai ya mazak? Sahi email thoko!");
      return;
    }

    if (passVal.length < 4) {
      setError("Uff, secret code thoda lamba dalo! (At least 4 keys)");
      return;
    }

    if (passVal !== confirmVal) {
      setError("Password matches nahi ho rahe! Check karo phirse.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const list = localStorage.getItem("lisa_registered_users") || "[]";
      let users = [];
      try {
        users = JSON.parse(list);
      } catch (e) {
        users = [];
      }

      const alreadyExists = users.some(
        (u: any) => u.email.toLowerCase() === emailVal.toLowerCase()
      );

      if (alreadyExists) {
        setError("Arey! Yeh email toh already registered hai. Log in karo!");
        setLoading(false);
        return;
      }

  const newUser = {
  uid: crypto.randomUUID(), // ya Date.now().toString()
  email: emailVal.toLowerCase(),
  name: nameVal,
  passwordHash: passVal,
};

      const updatedList = [...users, newUser];
      localStorage.setItem("lisa_registered_users", JSON.stringify(updatedList));

      setLoading(false);
      onLisaSpeak(`Wah kshama, naya account toh ban gaya. Chalo ab fatfat login karo aur shubharambh kijiye!`);
      onLoginSuccess({uid: newUser.uid, email: newUser.email, name: newUser.name,});
    }, 700);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const emailVal = user.email || "";
      const nameVal = user.displayName || user.email?.split("@")[0] || "Lisa User";

      // Register Google user locally to be sync compliant
      const list = localStorage.getItem("lisa_registered_users") || "[]";
      let users = [];
      try {
        users = JSON.parse(list);
      } catch (e) {
        users = [];
      }
      const alreadyExists = users.some(
        (u: any) => u.email.toLowerCase() === emailVal.toLowerCase()
      );
      if (!alreadyExists) {
        users.push({
          email: emailVal,
          name: nameVal,
          passwordHash: "",
        });
        localStorage.setItem("lisa_registered_users", JSON.stringify(users));
      }

      onLoginSuccess({uid: user.uid,email: emailVal,name: nameVal});
    } catch (err: any) {
      setError(err?.message || "Google sign in failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 text-white flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_28%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/95 shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl"
      >
        <div className="grid gap-6 md:grid-cols-[360px_1fr]">
          <div className="space-y-8 bg-slate-950 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <img src={logo} alt="Lisa" className="h-24 w-24 rounded-3xl border border-white/15 bg-slate-900 shadow-xl" />
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Access control</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">{isSignup ? "Create account" : "Sign in"}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsSignup((value) => !value);
                }}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 cursor-pointer"
              >
                {isSignup ? "Switch to sign in" : "Switch to sign up"}
              </button>
            </div>

            {error ? (
              <div className="mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isSignup) {
                  handleSignup();
                } else {
                  handleLogin();
                }
              }}
              className="mt-6 space-y-4"
            >
              {isSignup && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Sassy Name (Full name)</span>
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      placeholder="Your sassy name"
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 py-4 pl-12 pr-4 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-medium text-slate-300">Email address</span>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={isSignup ? signupEmail : email}
                    onChange={(e) => (isSignup ? setSignupEmail(e.target.value) : setEmail(e.target.value))}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 py-4 pl-12 pr-4 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">Password</span>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    value={isSignup ? signupPassword : password}
                    onChange={(e) => (isSignup ? setSignupPassword(e.target.value) : setPassword(e.target.value))}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 py-4 pl-12 pr-12 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {isSignup && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Confirm password</span>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/90 py-4 px-5 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />
                </label>
              )}

              {!isSignup && (
                <div className="text-right text-sm">
                  <button type="button" className="font-medium text-slate-400 hover:text-white transition">
                    Forgot password?
                  </button>
                </div>
              )}

              <div className="mt-8 grid gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 items-center justify-center rounded-3xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer animate-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing…</span>
                    </div>
                  ) : isSignup ? (
                    "Create account"
                  ) : (
                    "Sign in"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="inline-flex h-14 items-center justify-center rounded-3xl border border-white/10 bg-white/10 px-5 text-base font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  Continue with Google
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>{isSignup ? "Already have an account?" : "New to Lisa?"}</span>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsSignup((value) => !value);
                }}
                className="font-medium text-slate-100 transition hover:text-white cursor-pointer text-left"
              >
                {isSignup ? "Sign in instead" : "Create an account"}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-950/90 px-8 py-5 text-center text-sm text-slate-500">
          Trusted local access that keeps you signed in until you choose to log out.
        </div>
      </motion.div>
    </div>
  );
}
