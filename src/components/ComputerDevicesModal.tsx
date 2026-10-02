import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Monitor,
  Laptop,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  ExternalLink,
  Power,
  Wifi,
  Settings
} from "lucide-react";
import { auth } from "../config/firebase";

export interface PairedDevice {
  deviceId: string;
  deviceName: string;
  os: string;
  agentVersion: string;
  userEmail: string;
  pairedAt: number;
  lastSeen: number;
  macAddress?: string;
  broadcastIp?: string;
  isOnline: boolean;
}

interface ComputerDevicesModalProps {
  onClose?: () => void;
}

export const ComputerDevicesModal: React.FC<ComputerDevicesModalProps> = ({ onClose }) => {
  const [devices, setDevices] = useState<PairedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingExpiry, setPairingExpiry] = useState<number>(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Wake-on-LAN configuration state
  const [editingWolDeviceId, setEditingWolDeviceId] = useState<string | null>(null);
  const [wolMacInput, setWolMacInput] = useState<string>("");
  const [wolIpInput, setWolIpInput] = useState<string>("255.255.255.255");
  const [isWaking, setIsWaking] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      let token: string | undefined = undefined;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const res = await fetch("/api/computer/devices", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch (e) {
      console.error("Failed to load computer devices:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleGeneratePairingCode = async () => {
    setIsGeneratingCode(true);
    setActionError(null);
    try {
      let token: string | undefined = undefined;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const res = await fetch("/api/computer/devices/pair-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPairingCode(data.code);
        setPairingExpiry(600); // 10 minutes
      }
    } catch (e: any) {
      setActionError("Failed to generate pairing code: " + (e?.message || String(e)));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (pairingExpiry <= 0) return;
    const timer = setInterval(() => {
      setPairingExpiry((prev) => {
        if (prev <= 1) {
          setPairingCode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pairingExpiry]);

  const handleCopyCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to disconnect and revoke this computer?")) return;
    try {
      let token: string | undefined = undefined;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const res = await fetch("/api/computer/devices/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ deviceId })
      });
      if (res.ok) {
        setActionSuccess("Device revoked successfully.");
        fetchDevices();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error("Error revoking device:", e);
    }
  };

  const handleSaveWol = async (deviceId: string) => {
    try {
      let token: string | undefined = undefined;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const res = await fetch("/api/computer/devices/update-wol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          deviceId,
          macAddress: wolMacInput,
          broadcastIp: wolIpInput || "255.255.255.255"
        })
      });
      if (res.ok) {
        setActionSuccess("Wake-on-LAN settings updated.");
        setEditingWolDeviceId(null);
        fetchDevices();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e: any) {
      setActionError("Failed to update Wake-on-LAN settings: " + (e?.message || String(e)));
    }
  };

  const handleTestWakeOnLan = async (device: PairedDevice) => {
    setIsWaking(device.deviceId);
    setActionError(null);
    setActionSuccess(null);
    try {
      let token: string | undefined = undefined;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const res = await fetch("/api/computer/wake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ deviceId: device.deviceId })
      });
      const data = await res.json();
      if (data.isOnline) {
        setActionSuccess(data.message || "Computer is online and connected!");
      } else {
        setActionError(data.message || "Wake packet sent, but agent did not come online.");
      }
      fetchDevices();
    } catch (e: any) {
      setActionError("Error sending wake signal: " + (e?.message || String(e)));
    } finally {
      setIsWaking(null);
    }
  };

  return (
    <div className="space-y-6 text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-fuchsia-400" />
            <span>Paired Windows PC & Desktop Devices</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Connect your real Windows computer to execute VS Code, Chrome, Terminal, and desktop actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDevices}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleGeneratePairingCode}
            disabled={isGeneratingCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold shadow-md shadow-fuchsia-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Pair New Windows PC</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Pairing Code Box */}
      {pairingCode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-r from-fuchsia-950/40 to-indigo-950/40 border border-fuchsia-500/40 rounded-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-fuchsia-200">
              <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
              <span>One-Time Device Pairing Code</span>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Expires in: {Math.floor(pairingExpiry / 60)}:{(pairingExpiry % 60).toString().padStart(2, "0")}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-mono font-bold tracking-widest px-4 py-2 bg-black/60 rounded-xl border border-fuchsia-500/40 text-fuchsia-300 selection:bg-fuchsia-500">
              {pairingCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>

          <div className="text-xs text-zinc-300 space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-white/5 font-mono text-[11px]">
            <div className="text-zinc-400 font-sans font-semibold mb-1">To connect your Windows PC:</div>
            <div>1. Open terminal in the <span className="text-fuchsia-300">desktop-agent</span> directory</div>
            <div>2. Run: <span className="text-emerald-400">npm install && npm start</span></div>
            <div>3. Enter code: <span className="text-fuchsia-300 font-bold">{pairingCode}</span></div>
          </div>
        </motion.div>
      )}

      {/* Paired Devices List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Registered Desktop Machines ({devices.length})
        </div>

        {devices.length === 0 ? (
          <div className="p-8 bg-zinc-900/40 border border-white/10 rounded-2xl text-center space-y-3">
            <Laptop className="w-10 h-10 mx-auto text-zinc-600" />
            <div className="text-sm font-semibold text-zinc-300">No Desktop Agent Connected Yet</div>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Click "Pair New Windows PC" above and run the local desktop agent on your computer to enable voice control for VS Code, Chrome, and desktop tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.deviceId}
                className="p-4 bg-zinc-900/60 border border-white/10 rounded-xl space-y-3 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        device.isOnline
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : "bg-zinc-800/80 border-zinc-700/50 text-zinc-500"
                      }`}
                    >
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{device.deviceName}</span>
                        <span
                          className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            device.isOnline
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-semibold"
                              : "bg-zinc-800 text-zinc-500 border-zinc-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              device.isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                            }`}
                          />
                          {device.isOnline ? "ONLINE" : "OFFLINE"}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{device.os}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-zinc-500">v{device.agentVersion}</span>
                        <span>•</span>
                        <span className="text-[11px] text-zinc-500">
                          Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!device.isOnline && (
                      <button
                        onClick={() => handleTestWakeOnLan(device)}
                        disabled={isWaking === device.deviceId}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                        title="Send Wake-on-LAN magic packet"
                      >
                        <Power className={`w-3.5 h-3.5 ${isWaking === device.deviceId ? "animate-spin" : ""}`} />
                        <span>{isWaking === device.deviceId ? "Waking..." : "Wake PC"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (editingWolDeviceId === device.deviceId) {
                          setEditingWolDeviceId(null);
                        } else {
                          setEditingWolDeviceId(device.deviceId);
                          setWolMacInput(device.macAddress || "");
                          setWolIpInput(device.broadcastIp || "255.255.255.255");
                        }
                      }}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                      title="Configure Wake-on-LAN"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRevokeDevice(device.deviceId)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer"
                      title="Revoke and Disconnect Device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Wake-on-LAN settings editor */}
                {editingWolDeviceId === device.deviceId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3"
                  >
                    <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Power className="w-3.5 h-3.5 text-amber-400" />
                      <span>Wake-on-LAN Configuration (Optional)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Enter your PC's network card MAC address to allow Lisa to wake your sleeping computer when you say "Desktop on karo".
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">MAC Address (e.g. AA:BB:CC:DD:EE:FF)</label>
                        <input
                          type="text"
                          value={wolMacInput}
                          onChange={(e) => setWolMacInput(e.target.value)}
                          placeholder="00:11:22:33:44:55"
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-xs focus:border-fuchsia-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Broadcast IP (Default: 255.255.255.255)</label>
                        <input
                          type="text"
                          value={wolIpInput}
                          onChange={(e) => setWolIpInput(e.target.value)}
                          placeholder="255.255.255.255"
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-xs focus:border-fuchsia-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingWolDeviceId(null)}
                        className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveWol(device.deviceId)}
                        className="px-3 py-1 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-xs font-semibold text-white"
                      >
                        Save WOL Config
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety & Workspace Info */}
      <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl space-y-1.5 text-xs text-zinc-400">
        <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Windows Execution Guardrails</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          The agent executes commands strictly on your local Windows PC within the approved{" "}
          <code className="text-zinc-200 bg-white/5 px-1 py-0.5 rounded font-mono">
            %USERPROFILE%\Documents\LisaProjects
          </code>{" "}
          workspace directory. Sensitive system directories and root operations are strictly blocked.
        </p>
      </div>
    </div>
  );
};
