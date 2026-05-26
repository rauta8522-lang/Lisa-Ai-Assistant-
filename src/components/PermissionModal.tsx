import React from 'react';
import { motion } from 'motion/react';
import { MicOff, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function PermissionModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <MicOff size={32} className="text-red-400" />
        </div>
        
        <h2 className="text-2xl font-serif font-medium text-white mb-3">Microphone Permission Required</h2>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          Your browser is blocking microphone access. Lisa needs your microphone to hear and respond to you.
        </p>
        
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 w-full">
          <div className="flex gap-2 text-left">
            <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white/90 font-medium mb-2">Steps to grant permission:</p>
              <ol className="text-xs text-white/70 space-y-2">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Click the <strong>padlock 🔒</strong> or <strong>settings ⚙️</strong> icon in the URL bar</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Find <strong>"Microphone"</strong> in the permissions list</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Change it from <strong>"Block"</strong> to <strong>"Allow"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Click button below to refresh</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Refresh Page
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 bg-white/5 text-white/70 font-medium rounded-xl hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
