import React from "react";
import { motion } from "framer-motion";

export default function ApkDownload() {
  return (
    // Premium Gradient Background
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white flex items-center justify-center p-6">
      
      {/* Glassmorphism Card */}
      <div className="max-w-md w-full bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/10 blur-[100px] rounded-full" />

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src="/icon-512.png"
            alt="Lisa AI"
            className="w-20 h-20 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Lisa AI</h1>
            <p className="text-zinc-400 text-sm tracking-wide">Personal Assistant</p>
            <span className="inline-block bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/20 mt-1 uppercase tracking-widest">
              Verified
            </span>
          </div>
        </div>

        {/* Stats Grid - Premium Look */}
        <div className="grid grid-cols-3 gap-2 py-6 border-y border-white/5 mb-8">
          <div className="text-center">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Downloads</p>
            <p className="font-bold text-sm text-zinc-200">50K+</p>
          </div>
          <div className="text-center border-l border-white/5">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Rating</p>
            <p className="font-bold text-sm text-zinc-200">4.8 ★</p>
          </div>
          <div className="text-center border-l border-white/5">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Size</p>
            <p className="font-bold text-sm text-zinc-200">12MB</p>
          </div>
        </div>

        {/* Download Button with Golden Gradient Glow */}
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://github.com/rauta8522-lang/Lisa-Ai-Assistant-/releases/download/v1.0.1/app-release.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition-all text-white font-bold py-4 rounded-xl text-center text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] mb-8"
        >
          DOWNLOAD APK
        </motion.a>

        {/* Screenshots Gallery */}
        <div className="py-4 mb-8">
          <h2 className="text-zinc-300 font-semibold text-sm mb-4 tracking-wider">PREVIEW</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <img src="/screenshot1.jpg" alt="Screenshot 1" className="w-64 h-36 object-cover rounded-xl border border-white/10 hover:border-orange-500/50 transition-all flex-shrink-0" />
            <img src="/screenshot2.jpg" alt="Screenshot 2" className="w-64 h-36 object-cover rounded-xl border border-white/10 hover:border-orange-500/50 transition-all flex-shrink-0" />
            <img src="/screenshot3.jpg" alt="Screenshot 3" className="w-64 h-36 object-cover rounded-xl border border-white/10 hover:border-orange-500/50 transition-all flex-shrink-0" />
          </div>
        </div>

      </div>
    </div>
  );
}