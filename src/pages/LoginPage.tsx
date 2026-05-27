import React, { useState } from "react";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
} from "lucide-react";

import { auth, googleProvider } from "../config/firebase";
import logo from "../assets/favicon.ico";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({
  onLoginSuccess,
}: LoginPageProps) {

  // LOGIN / SIGNUP TOGGLE
  const [isSignup, setIsSignup] = useState(false);

  // LOGIN STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SIGNUP STATES
  const [username, setUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // PASSWORD SHOW/HIDE
  const [showPassword, setShowPassword] = useState(false);

  // LOADING
  const [loading, setLoading] = useState(false);

  // LOGIN FUNCTION
  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  // SIGNUP FUNCTION
  const handleSignup = async () => {

    if (
      !username ||
      !signupEmail ||
      !signupPassword ||
      !confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (signupPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Account Created Successfully");
      onLoginSuccess();
    }, 1500);
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await signInWithPopup(auth, googleProvider);

      setLoading(false);

      onLoginSuccess();
    } catch (error: any) {
      setLoading(false);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-y-auto overflow-x-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-purple-700/30 rounded-full blur-3xl"></div>

      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-pink-700/20 rounded-full blur-3xl"></div>

      {/* Language */}
      <div className="pt-10 flex justify-center text-neutral-400 text-sm z-10">
        English (India)
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 z-10">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >

          {/* Logo */}
          <div className="flex justify-center mb-6">

            <div className="relative">

              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-40 rounded-full"></div>

              <img
                src={logo}
                alt="Lisa"
                className="relative w-24 h-24 object-contain rounded-3xl shadow-2xl"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Lisa
          </h1>

          {/* Subtitle */}
          <p className="text-center text-neutral-400 mb-10">
            {isSignup
              ? "Create your Lisa AI account"
              : "Welcome back to Lisa AI"}
          </p>

          {/* Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

            {/* Back Button */}
            {isSignup && (
              <button
                onClick={() => setIsSignup(false)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition"
              >
                <ArrowLeft size={18} />
                Back to Login
              </button>
            )}

            <div className="space-y-4">

              {/* SIGNUP USERNAME */}
              {isSignup && (
                <div className="relative">

                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />

                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* EMAIL */}
              <div className="relative">

                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={isSignup ? signupEmail : email}
                  onChange={(e) =>
                    isSignup
                      ? setSignupEmail(e.target.value)
                      : setEmail(e.target.value)
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={isSignup ? signupPassword : password}
                  onChange={(e) =>
                    isSignup
                      ? setSignupPassword(e.target.value)
                      : setPassword(e.target.value)
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-purple-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              {isSignup && (
                <div className="relative">

                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* FORGOT PASSWORD */}
              {!isSignup && (
                <div className="text-right">
                  <button className="text-sm text-neutral-400 hover:text-white transition">
                    Forgotten password?
                  </button>
                </div>
              )}

              {/* MAIN BUTTON */}
              <button
                onClick={
                  isSignup
                    ? handleSignup
                    : handleLogin
                }
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 py-4 rounded-2xl text-lg font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                  ? "Create Account"
                  : "Login to Lisa"}
              </button>

              {/* GOOGLE */}
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white text-black py-4 rounded-2xl text-lg font-semibold hover:bg-neutral-200 transition-all"
              >
                Continue with Google
              </button>

              {/* TOGGLE */}
              <div className="text-center pt-2">

                {isSignup ? (
                  <button
                    onClick={() => setIsSignup(false)}
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    Already have an account? Login
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSignup(true)}
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    Create New Account
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-neutral-500 text-sm">
            Powered by Lisa AI
          </div>
        </motion.div>
      </div>
    </div>
  );
}
