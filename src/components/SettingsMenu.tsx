import React, { useState, useEffect } from 'react';
import { User, LogOut, Shield, Moon, MoreVertical, ChevronRight } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface SettingsMenuProps {
  onLogout?: () => void;
}

const STORAGE_KEYS = {
  email: 'lisa_user_email',
  name: 'lisa_user_name',
  darkMode: 'lisa_dark_mode',
  loggedIn: 'lisa_user_logged_in',
};

export default function SettingsMenu({ onLogout }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('Guest User');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem(STORAGE_KEYS.email);
    const name = localStorage.getItem(STORAGE_KEYS.name);
    const darkMode = localStorage.getItem(STORAGE_KEYS.darkMode) === 'true';
    const loggedIn = localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true';

    if (email) setEmailInput(email);
    if (name) setDisplayNameInput(name);
    setIsDarkMode(darkMode);
    setIsAuthenticated(loggedIn);

    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const persistProfile = (email: string, name: string, loggedIn: boolean) => {
    localStorage.setItem(STORAGE_KEYS.email, email);
    localStorage.setItem(STORAGE_KEYS.name, name);
    localStorage.setItem(STORAGE_KEYS.loggedIn, loggedIn ? 'true' : 'false');
    setEmailInput(email);
    setDisplayNameInput(name);
    setIsAuthenticated(loggedIn);
  };

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem(STORAGE_KEYS.darkMode, String(nextMode));
    document.documentElement.classList.toggle('dark', nextMode);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';
      const name = result.user.displayName || 'Lisa User';
      persistProfile(email, name, true);
      setShowProfileModal(true);
    } catch (error: any) {
      console.error('Login Error:', error.message);
      alert(`Login failed: ${error.message}`);
    }
  };

  const handleSaveDetails = () => {
    persistProfile(emailInput, displayNameInput, isAuthenticated);
    setShowProfileModal(false);
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.email);
    localStorage.removeItem(STORAGE_KEYS.name);
    localStorage.removeItem(STORAGE_KEYS.loggedIn);
    setIsAuthenticated(false);
    setEmailInput('');
    setDisplayNameInput('Guest User');
    if (onLogout) onLogout();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
        title="Options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-neutral-950 border border-white/10 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Account</p>
                <p className="mt-1 text-sm font-semibold text-white truncate">{displayNameInput || 'Guest User'}</p>
                <p className="text-xs text-neutral-400 truncate">{emailInput || 'Not signed in'}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${isAuthenticated ? 'bg-emerald-500/15 text-emerald-200' : 'bg-slate-700/60 text-slate-300'}`}>
                {isAuthenticated ? 'Signed In' : 'Guest'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { setShowProfileModal(true); setIsOpen(false); }}
            className="flex w-full items-center px-4 py-3 text-sm text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <User className="mr-3 h-4 w-4 text-neutral-400" />
            Personal Details
            <ChevronRight className="ml-auto h-4 w-4 text-neutral-400" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="flex w-full items-center px-4 py-3 text-sm text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Moon className="mr-3 h-4 w-4 text-neutral-400" />
            {isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
            <span className="ml-auto text-xs text-neutral-400">{isDarkMode ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => { setShowPrivacyModal(true); setIsOpen(false); }}
            className="flex w-full items-center px-4 py-3 text-sm text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Shield className="mr-3 h-4 w-4 text-neutral-400" />
            Privacy & Security
            <ChevronRight className="ml-auto h-4 w-4 text-neutral-400" />
          </button>

          <div className="border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-400" />
              Log Out
            </button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-neutral-950 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Profile</p>
                <h3 className="text-xl font-semibold text-white">Personal Details</h3>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-neutral-400 hover:text-white transition-colors">Close</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 uppercase tracking-[0.2em] mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {!isAuthenticated && (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors sm:w-auto"
                >
                  Sign in with Google
                </button>
              )}
              <button
                onClick={handleSaveDetails}
                className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition-colors sm:w-auto"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-neutral-950 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Security</p>
                <h3 className="text-xl font-semibold text-white">Privacy & Security</h3>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-neutral-400 hover:text-white transition-colors">Close</button>
            </div>

            <div className="space-y-4 text-sm text-neutral-300">
              <div>
                <p className="font-semibold text-white">Data retention</p>
                <p>Login data is stored locally in your browser so personal details remain available when you return. No chat history is preserved unless you explicitly save it.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Security</p>
                <p>Authentication is managed using Google sign-in. The app does not store your password, only your account display name and email to personalize the app experience.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Professional experience</p>
                <p>This menu is now organized with a clean account section, theme controls, and an explicit privacy panel for a more business-ready UI.</p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button onClick={() => setShowPrivacyModal(false)} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
