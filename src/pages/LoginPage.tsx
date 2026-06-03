import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { auth, googleProvider } from "../config/firebase";
import logo from "../assets/favicon.ico";

const STORAGE_KEYS = {
  account: "lisa_saved_account",
  session: "lisa_user_session",
};

const SETTINGS_STORAGE_KEYS = {
  email: "lisa_user_email",
  name: "lisa_user_name",
  loggedIn: "lisa_user_logged_in",
};

// Sync login data to settings personal details
const syncToSettings = (email: string, username: string) => {
  localStorage.setItem(SETTINGS_STORAGE_KEYS.email, email);
  localStorage.setItem(SETTINGS_STORAGE_KEYS.name, username);
  localStorage.setItem(SETTINGS_STORAGE_KEYS.loggedIn, "true");
};

type Account = {
  email: string;
  username: string;
  password: string;
  provider: "local" | "google";
};

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
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

  useEffect(() => {
    const isActiveSession = localStorage.getItem(STORAGE_KEYS.session) === "true";
    const savedAccount = localStorage.getItem(STORAGE_KEYS.account);
    if (isActiveSession && savedAccount) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const saveAccount = (account: Account) => {
    localStorage.setItem(STORAGE_KEYS.account, JSON.stringify(account));
    localStorage.setItem(STORAGE_KEYS.session, "true");
  };

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please complete all fields before continuing.");
      return;
    }

    const savedAccountJson = localStorage.getItem(STORAGE_KEYS.account);
    if (!savedAccountJson) {
      setError("No saved account found. Please create an account first.");
      return;
    }

    const savedAccount = JSON.parse(savedAccountJson) as Account;
    if (savedAccount.provider === "google") {
      setError("This account is managed by Google sign in. Use the Google button.");
      return;
    }

    if (savedAccount.email.toLowerCase() !== email.toLowerCase() || savedAccount.password !== btoa(password)) {
      setError("Invalid email or password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      saveAccount(savedAccount);
      setLoading(false);
      onLoginSuccess();
    }, 700);
  };

  const handleSignup = async () => {
    setError("");

    if (!username.trim() || !signupEmail.trim() || !signupPassword.trim() || !confirmPassword.trim()) {
      setError("Please complete every field to create your account.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    const account: Account = {
      email: signupEmail.trim().toLowerCase(),
      username: username.trim(),
      password: btoa(signupPassword),
      provider: "local",
    };

    setLoading(true);
    setTimeout(() => {
      saveAccount(account);
      // Sync to settings personal details
      syncToSettings(account.email, account.username);
      setLoading(false);
      onLoginSuccess();
    }, 700);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const account: Account = {
        email: result.user.email || "",
        username: result.user.displayName || "Lisa User",
        password: "",
        provider: "google",
      };

      saveAccount(account);
      // Sync to settings personal details
      syncToSettings(account.email, account.username);
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || "Google sign in failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_28%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/95 shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl"
      >
        <div className="grid gap-6 md:grid-cols-[360px_1fr]">
          <div className="space-y-8 bg-slate-950/95 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <img src={logo} alt="Lisa" className="h-20 w-20 rounded-3xl border border-white/10 bg-slate-900" />
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
                onClick={() => setIsSignup((value) => !value)}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                {isSignup ? "Switch to sign in" : "Switch to sign up"}
              </button>
            </div>

            {error ? (
              <div className="mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {isSignup && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Full name</span>
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      placeholder="Your name"
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
                    className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/90 py-4 px-4 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
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
            </div>

            <div className="mt-8 grid gap-3">
              <button
                type="button"
                onClick={isSignup ? handleSignup : handleLogin}
                disabled={loading}
                className="inline-flex h-14 items-center justify-center rounded-3xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Processing…" : isSignup ? "Create account" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="inline-flex h-14 items-center justify-center rounded-3xl border border-white/10 bg-white/10 px-5 text-base font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue with Google
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>{isSignup ? "Already have an account?" : "New to Lisa?"}</span>
              <button
                type="button"
                onClick={() => setIsSignup((value) => !value)}
                className="font-medium text-slate-100 transition hover:text-white"
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
