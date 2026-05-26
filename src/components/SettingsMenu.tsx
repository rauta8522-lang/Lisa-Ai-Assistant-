import React, { useState } from 'react';
import { User, LogOut, Settings, Shield, Moon, MoreVertical } from 'lucide-react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import PermissionModal from './PermissionModal';

interface SettingsMenuProps {
  userEmail?: string;
  onLogout?: () => void;
}

export default function SettingsMenu({ userEmail = "anil@example.com", onLogout }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [displayNameInput, setDisplayNameInput] = useState("Anil Kumar Raut");

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const toggleDarkMode = () => {
  setIsDarkMode(!isDarkMode);
  document.documentElement.classList.toggle('dark');
  };

  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    alert(`Welcome ${result.user.displayName}!`);

    // Google se aaya hua real data state mein set karein
    if (result.user.email) setEmailInput(result.user.email);
    if (result.user.displayName) setDisplayNameInput(result.user.displayName);

  } catch (error: any) {
    console.error("Login Error: ", error.message);
    alert(`Login failed: ${error.message}`);
  }
};

  return (
    <div className="relative inline-block text-left">
      {/* Instagram style 3-Dots Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
        title="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-white/10 shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-white/10">
            <p className="text-xs text-neutral-400">{displayNameInput}</p>
            <p className="text-sm font-medium text-white truncate">{emailInput}</p>
          </div>

          <button
            onClick={() => { handleGoogleLogin(); setShowProfileModal(true); setIsOpen(false); }}
            className="flex w-full items-center px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 transition-colors"
          >
            <User className="mr-3 h-4 w-4 text-neutral-400" /> Personal Details
          </button>

          <button 
             onClick={toggleDarkMode} className="cursor-pointer flex items-center gap-2">
            <Moon className="mr-3 h-4 w-4 text-neutral-400" /> Dark Mode
           
          </button>

          <button 
            onClick={() => setShowPrivacyModal(true)} className="cursor-pointer flex items-center gap-2">
            <Shield className="mr-3 h-4 w-4 text-neutral-400" /> Privacy & Security
          
          </button>

          {showPrivacyModal && (
          <PermissionModal onClose={() => setShowPrivacyModal(false)} />
          )}

          <div className="border-t border-white/10 mt-2">
            <button
              onClick={onLogout}
              className="flex w-full items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-400" /> Log Out
            </button>
          </div>
        </div>
      )}

      {/* Personal Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-xl font-semibold text-white mb-4">Personal Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Email Address</label>
                <input
                 type="email"
                  value={emailInput} 
                  onChange={(e) => setEmailInput(e.target.value)}
                   className="w-full bg-neutral-800 text-white border border-neutral-700 rounded p-2 text-sm focus:outline-none"
                   />
                </div>   
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Display Name</label>
                <input
                 type="text"
                  value={displayNameInput} 
                  onChange={(e) => setDisplayNameInput(e.target.value)} 
                  className="w-full bg-neutral-800 text-white border border-neutral-700 rounded p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>  

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Close</button>
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}