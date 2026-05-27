import React from "react";
import { motion } from "framer-motion";

export default function ApkDownload() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src="/icon-512.png"
            alt="Lisa AI"
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-bold">Lisa AI</h1>
            <p className="text-zinc-400">Personal Assistant</p>
            <span className="inline-block bg-green-900/50 text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-800 mt-1">
              Verified
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-6 border-y border-zinc-800 mb-8">
          <div className="text-center">
            <p className="text-zinc-500 text-[10px] uppercase">Downloads</p>
            <p className="font-bold text-sm">50K+</p>
          </div>
          <div className="text-center border-l border-zinc-800">
            <p className="text-zinc-500 text-[10px] uppercase">Rating</p>
            <p className="font-bold text-sm">4.8 ★</p>
          </div>
          <div className="text-center border-l border-zinc-800">
            <p className="text-zinc-500 text-[10px] uppercase">Size</p>
            <p className="font-bold text-sm">12MB</p>
          </div>
        </div>

        {/* Download Button with Animation */}
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://github.com/rauta8522-lang/Lisa-Ai-Assistant-/releases/download/v1.0.1/app-release.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-orange-600 hover:bg-orange-700 transition-all text-white font-bold py-4 rounded-xl text-center text-lg shadow-lg mb-8"
        >
          DOWNLOAD APK
        </motion.a>

        {/* Screenshots Gallery */}
        <div className="py-4 mb-8">
          <h2 className="text-white font-bold mb-4">Screenshots</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            <img src="/screenshot1.jpg" alt="Screenshot 1" className="w-64 h-36 object-cover rounded-xl border border-zinc-700 flex-shrink-0 snap-start" />
            <img src="/screenshot2.jpg" alt="Screenshot 2" className="w-64 h-36 object-cover rounded-xl border border-zinc-700 flex-shrink-0 snap-start" />
            <img src="/screenshot3.jpg" alt="Screenshot 3" className="w-64 h-36 object-cover rounded-xl border border-zinc-700 flex-shrink-0 snap-start" />
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-black/30 p-4 rounded-xl border border-zinc-800">
          <h2 className="font-bold text-sm mb-1">Version 1.0.0</h2>
          <p className="text-[11px] text-zinc-400">Last updated: May 2026</p>
          <p className="text-[12px] text-zinc-300 mt-2">
            What's new: Performance improvements, bug fixes, and enhanced AI voice response.
          </p>
        </div>

      </div>
    </div>
  );
}