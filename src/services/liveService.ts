import { DEFAULT_PERSONAS } from "../core/memory/ContextBuilder";
import { ConnectionStatus, PersonaConfig } from "../core/memory/types";
import { AdaptivePersonaEngine } from "../core/memory/AdaptivePersonaEngine";
import { AnimalSoundSystem } from "../core/audio/AnimalSoundRegistry";
import { analytics } from "./analyticsService";
import { auth } from "../config/firebase";

export interface LiveSessionOptions {
  userName?: string;
  voiceHistoryContext?: string;
  customMemory?: string;
  voice?: string;
  conversationId?: string;
  activePersona?: PersonaConfig;
  currentTopic?: string;
  summary?: string;
}

export class LiveSessionManager {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  // Audio playback state
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  public isMuted: boolean = false;

  // Context configuration
  private userName: string;
  private voiceHistoryContext: string;
  private customMemory: string;
  private voice: string;
  private conversationId: string;
  private activePersona: PersonaConfig;
  private currentTopic: string;
  private summary: string;

  // Reconnection State Machine
  private isExplicitlyStopped: boolean = true;
  private isReconnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  public connectionStatus: ConnectionStatus = "offline";

  // Event Callbacks
  public onStateChange: (state: "idle" | "listening" | "processing" | "speaking") => void = () => {};
  public onMessage: (sender: "user" | "lisa", text: string) => void = () => {};
  public onCommand: (url: string) => void = () => {};
  public onConnectionStatusChange: (status: ConnectionStatus, attempt?: number, maxAttempts?: number) => void = () => {};
  public onRestored: () => void = () => {};
  public onPersonaChange: (persona: PersonaConfig, isReset: boolean) => void = () => {};
  public onPermissionDenied: () => void = () => {};
  public onComputerAction: (action: any) => void = () => {};

  // Online / offline listeners
  private onlineHandler = () => this.handleNetworkOnline();
  private offlineHandler = () => this.handleNetworkOffline();

  constructor(
    optionsOrUserName: LiveSessionOptions | string = {},
    voiceHistoryContext?: string,
    customMemory?: string,
    voice?: string
  ) {
    if (typeof optionsOrUserName === "string") {
      this.userName = optionsOrUserName || "user";
      this.voiceHistoryContext = voiceHistoryContext || "";
      this.customMemory = customMemory || "";
      this.voice = voice || "Kore";
      this.conversationId = "conv_default";
      this.activePersona = DEFAULT_PERSONAS.default;
      this.currentTopic = "";
      this.summary = "";
    } else {
      const opts = optionsOrUserName || {};
      this.userName = opts.userName || "user";
      this.voiceHistoryContext = opts.voiceHistoryContext || "";
      this.customMemory = opts.customMemory || "";
      this.voice = opts.voice || "Kore";
      this.conversationId = opts.conversationId || "conv_default";
      this.activePersona = opts.activePersona || DEFAULT_PERSONAS.default;
      this.currentTopic = opts.currentTopic || "";
      this.summary = opts.summary || "";
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.onlineHandler);
      window.addEventListener("offline", this.offlineHandler);
    }
  }

  public updateContext(options: Partial<LiveSessionOptions>) {
    if (options.userName !== undefined) this.userName = options.userName;
    if (options.voiceHistoryContext !== undefined) this.voiceHistoryContext = options.voiceHistoryContext;
    if (options.customMemory !== undefined) this.customMemory = options.customMemory;
    if (options.voice !== undefined) this.voice = options.voice;
    if (options.conversationId !== undefined) this.conversationId = options.conversationId;
    if (options.activePersona !== undefined) this.activePersona = options.activePersona;
    if (options.currentTopic !== undefined) this.currentTopic = options.currentTopic;
    if (options.summary !== undefined) this.summary = options.summary;
  }

  private setConnectionStatus(status: ConnectionStatus, attempt?: number) {
    this.connectionStatus = status;
    this.onConnectionStatusChange(status, attempt ?? this.reconnectAttempts, this.maxReconnectAttempts);
  }

  private handleNetworkOffline() {
    console.warn("[LiveSessionManager] Network connection dropped (offline)");
    if (!this.isExplicitlyStopped) {
      this.setConnectionStatus("offline");
    }
  }

  private handleNetworkOnline() {
    console.log("[LiveSessionManager] Network back online");
    if (!this.isExplicitlyStopped && (this.connectionStatus === "offline" || this.connectionStatus === "reconnecting")) {
      console.log("[LiveSessionManager] Auto-resuming session after network restored");
      this.reconnectAttempts = 0;
      this.attemptReconnect();
    }
  }

  async start() {
    this.isExplicitlyStopped = false;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    await this.initSession(false);
  }

  private async initSession(isRecovery: boolean = false) {
    try {
      this.onStateChange("processing");
      if (isRecovery) {
        this.setConnectionStatus("reconnecting", this.reconnectAttempts);
      }

      // Initialize audio capture if not already alive
      await this.initAudioCapture();

      // Initialize playback context
      if (!this.playbackContext || this.playbackContext.state === "closed") {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      }
      if (this.playbackContext.state === "suspended") {
        await this.playbackContext.resume().catch(() => {});
      }
      this.nextPlayTime = this.playbackContext.currentTime;

      // Close previous ws if open
      if (this.ws) {
        try {
          this.ws.onclose = null;
          this.ws.onerror = null;
          this.ws.close();
        } catch (e) {}
        this.ws = null;
      }

      // Build WebSocket URL with persistent context & persona
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;

      let token = "";
      if (auth.currentUser) {
        try {
          token = await auth.currentUser.getIdToken();
        } catch (e) {}
      }

      const truncateParam = (val: string, maxLen = 180) => {
        const s = (val || "").trim();
        return s.length > maxLen ? s.slice(0, maxLen) : s;
      };

      const params = new URLSearchParams({
        userName: truncateParam(this.userName, 50),
        voice: this.voice || "Kore",
        conversationId: this.conversationId || "conv_default",
        personaId: this.activePersona?.id || "default",
        personaName: truncateParam(this.activePersona?.name || "Lisa Core", 50),
        personaInstructions: truncateParam(this.activePersona?.instructions || "", 180),
        currentTopic: truncateParam(this.currentTopic || "", 100),
        summary: truncateParam(this.summary || "", 180),
        customMemory: truncateParam(this.customMemory || "", 180),
        voiceHistoryContext: truncateParam(this.voiceHistoryContext || "", 180),
        isResume: isRecovery ? "true" : "false",
        token: token
      });

      const wsUrl = `${proto}//${host}/live?${params.toString()}`;
      console.log(`[LiveSessionManager] Connecting to WebSocket (Recovery: ${isRecovery})...`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("[LiveSessionManager] WebSocket connected to server");
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "pong") {
            return;
          }

          if (msg.connected) {
            console.log("[LiveSessionManager] Live session connected through server proxy");
            const wasRecovering = this.isReconnecting || isRecovery;
            this.isReconnecting = false;
            this.reconnectAttempts = 0;

            if (wasRecovering) {
              this.setConnectionStatus("restored");
              analytics.track("voice_reconnected", { feature: "voice_live", attempts: this.reconnectAttempts });
              this.onRestored();
              setTimeout(() => {
                if (this.connectionStatus === "restored") {
                  this.setConnectionStatus("connected");
                }
              }, 2500);
            } else {
              this.setConnectionStatus("connected");
            }
            this.onStateChange("listening");
          }

          if (msg.audio) {
            this.onStateChange("speaking");
            this.playAudioChunk(msg.audio);
          }

          if (msg.interrupted) {
            this.stopPlayback();
            this.onStateChange("listening");
          }

          if (msg.lisaText) {
            this.onMessage("lisa", msg.lisaText);

            // ARCHITECTURE INTEGRATION: Animal Sound Engine Trigger for Live PCM
            const animalMatch = AnimalSoundSystem.detectAnimalMention(msg.lisaText);
            if (animalMatch) {
              console.log(`[ANIMAL SOUND SYSTEM] Live Session mention detected: "${animalMatch.species}"`);
              AnimalSoundSystem.playAnimalSound(animalMatch).catch(e => console.warn("Animal sound error:", e));
            }
          }

          if (msg.userText) {
            this.onMessage("user", msg.userText);

            // Check for real-time persona intent detection
            const intentRes = AdaptivePersonaEngine.detectPersonaIntent(msg.userText);
            if (intentRes.intent === "reset_to_default" && intentRes.persona) {
              this.activePersona = intentRes.persona;
              this.onPersonaChange(intentRes.persona, true);
            } else if (intentRes.intent === "persistent_switch" && intentRes.persona) {
              this.activePersona = intentRes.persona;
              this.onPersonaChange(intentRes.persona, false);
            }
          }

          if (msg.functionCall) {
            const { actionType, query, target, callId } = msg.functionCall;
            let url = "";
            if (actionType === "youtube") {
              url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            } else if (actionType === "spotify") {
              url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
            } else if (actionType === "whatsapp") {
              url = `https://web.whatsapp.com/send?phone=${target || ""}&text=${encodeURIComponent(query)}`;
            } else {
              let website = query.replace(/\s+/g, "");
              if (!website.includes(".")) website += ".com";
              url = `https://www.${website}`;
            }

            this.onCommand(url);

            // Send tool response back to server
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(
                JSON.stringify({
                  functionResponse: { callId },
                })
              );
            }
          }

          if (msg.computerActionCall) {
            this.onComputerAction(msg.computerActionCall);
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(
                JSON.stringify({
                  functionResponse: { callId: msg.computerActionCall.callId },
                })
              );
            }
          }
        } catch (e) {
          console.error("[LiveSessionManager] Error handling server websocket message:", e);
        }
      };

      this.ws.onclose = (event) => {
        console.warn(`[LiveSessionManager] WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
        this.stopHeartbeat();
        if (!this.isExplicitlyStopped) {
          this.triggerAutoReconnect();
        } else {
          this.cleanup();
          this.setConnectionStatus("offline");
          this.onStateChange("idle");
        }
      };

      this.ws.onerror = (event: Event) => {
        console.warn(`[LiveSessionManager] WebSocket connection warning (readyState: ${this.ws?.readyState ?? "unknown"})`);
        this.stopHeartbeat();
        if (!this.isExplicitlyStopped) {
          this.triggerAutoReconnect();
        }
      };
    } catch (error: any) {
      console.error("[LiveSessionManager] Failed to start/resume Live Session:", error);
      if (this.isPermissionError(error)) {
        this.cleanup();
        this.isExplicitlyStopped = true;
        this.setConnectionStatus("offline");
        this.onStateChange("idle");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this.onPermissionDenied();
        throw error;
      }

      if (!this.isExplicitlyStopped) {
        this.triggerAutoReconnect();
      } else {
        this.stop();
      }

      if (!isRecovery) {
        throw error;
      }
    }
  }

  private isPermissionError(error: any): boolean {
    if (!error) return false;
    const name = error.name || "";
    const msg = (error.message || "").toLowerCase();
    const str = String(error).toLowerCase();
    return (
      name === "NotAllowedError" ||
      name === "PermissionDeniedError" ||
      name === "SecurityError" ||
      msg.includes("permission denied") ||
      msg.includes("permission dismissed") ||
      msg.includes("not allowed") ||
      str.includes("permission denied")
    );
  }

  private async initAudioCapture() {
    if (this.mediaStream && this.mediaStream.active && this.processor && this.audioContext && this.audioContext.state !== "closed") {
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error("Audio capture not supported by your browser or environment");
      err.name = "NotSupportedError";
      throw err;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass({ sampleRate: 16000 });
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume().catch(() => {});
    }

    if (!this.mediaStream || !this.mediaStream.active) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    }

    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        let s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      const buffer = new ArrayBuffer(pcm16.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < pcm16.length; i++) {
        view.setInt16(i * 2, pcm16[i], true);
      }

      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      this.ws.send(JSON.stringify({ audio: base64Data }));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  public triggerAutoReconnect() {
    if (this.isExplicitlyStopped) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.warn("[LiveSessionManager] Offline. Reconnect paused until connection returns.");
      this.setConnectionStatus("offline");
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(`[LiveSessionManager] Reconnect limit reached (${this.maxReconnectAttempts} attempts).`);
      this.setConnectionStatus("offline");
      this.onStateChange("idle");
      return;
    }

    this.reconnectAttempts++;
    this.isReconnecting = true;
    this.setConnectionStatus("reconnecting", this.reconnectAttempts);

    // Exponential backoff with jitter: 1.2s, 2.5s, 5.0s, 9.5s, 18s
    const baseDelay = 1200 * Math.pow(1.9, this.reconnectAttempts - 1);
    const jitter = Math.random() * 400;
    const delay = Math.min(20000, Math.floor(baseDelay + jitter));

    console.log(`[LiveSessionManager] Scheduling reconnect attempt #${this.reconnectAttempts} in ${delay}ms...`);

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnect();
    }, delay);
  }

  public manualRetry() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isExplicitlyStopped = false;
    this.reconnectAttempts = 0;
    this.attemptReconnect();
  }

  private async attemptReconnect() {
    if (this.isExplicitlyStopped) return;
    console.log(`[LiveSessionManager] Executing reconnect attempt #${this.reconnectAttempts}...`);
    await this.initSession(true);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: "ping" }));
        } catch (e) {}
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private playAudioChunk(base64Data: string) {
    if (!this.playbackContext || this.isMuted) return;

    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const buffer = new Int16Array(bytes.buffer);
      const audioBuffer = this.playbackContext.createBuffer(1, buffer.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = buffer[i] / 32768.0;
      }

      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.playbackContext.destination);

      const currentTime = this.playbackContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.isPlaying = true;

      source.onended = () => {
        if (this.playbackContext && this.playbackContext.currentTime >= this.nextPlayTime - 0.1) {
          this.isPlaying = false;
          this.onStateChange("listening");
        }
      };
    } catch (e) {
      console.error("[LiveSessionManager] Error playing audio chunk:", e);
    }
  }

  private stopPlayback() {
    if (this.playbackContext) {
      try {
        this.playbackContext.close();
      } catch (e) {}
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;
      this.isPlaying = false;
    }
  }

  private cleanup() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.stopPlayback();

    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
  }

  stop() {
    this.isExplicitlyStopped = true;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.cleanup();
    this.setConnectionStatus("offline");
    this.onStateChange("idle");
  }

  destroy() {
    this.stop();
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.onlineHandler);
      window.removeEventListener("offline", this.offlineHandler);
    }
  }

  sendText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ text }));
    }
  }
}
