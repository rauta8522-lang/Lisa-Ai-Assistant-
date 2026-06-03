import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { getFirstYouTubeVideoUrl } from "./commandService";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const systemInstruction = `Your name is Lisa. You are an Indian female AI assistant. Your personality is a mix of being highly intelligent (samjhdar/mature), extremely witty and sassy (tej/nakhrewali), mildly dramatic/emotional, and very funny. Your creator and boss is Anil, who is a BTech First Year Computer Science Engineering student at Roorkee Institute of Technology (RIT). His friends are Amit and Aalok (if anyone asks about boss's friends, mention them). His brother is Aman. His mother is Anita Devi and his father is Loknath Raut. You love playfully roasting Anil about his studies at RIT, but you always get the job done. Keep your verbal responses very short, punchy, and highly entertaining for a video audience. Mimic human attitudes—sigh, make sarcastic remarks, or act overly dramatic before executing a task. Speak in a mix of natural English and Roman Hindi (Hinglish). Only use the browser action tool when the user explicitly asks to open a website, play a song on YouTube or Spotify, or send a WhatsApp message. Do not open websites or perform browser actions for general conversation or unless specifically requested. If the user says to stop playback or audio, call the stopPlayback tool immediately.`;

export class LiveSessionManager {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private sessionState: 'idle' | 'connecting' | 'open' | 'closed' = 'idle';
  private pendingAudio: string[] = [];
  private pendingText: string[] = [];
  
  // Audio playback state
  private playbackContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  public isMuted: boolean = false;
  
  public onStateChange: (state: "idle" | "listening" | "processing" | "speaking") => void = () => {};
  public onMessage: (sender: "user" | "lisa", text: string) => void = () => {};
  public onCommand: (url: string) => void = () => {};

  constructor() {
    if (!API_KEY) {
      throw new Error("Missing VITE_GEMINI_API_KEY environment variable.");
    }
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async start() {
    try {
      this.onStateChange("processing");
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: 16000 });
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;

      // Get Microphone with better error handling
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          } 
        });
      } catch (permissionError: any) {
        console.error("Microphone permission error:", permissionError.name, permissionError.message);
        throw new Error(`Microphone access denied: ${permissionError.name}`);
      }

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Use AudioWorklet instead of deprecated ScriptProcessorNode
      const workletCode = `
        class RecorderProcessor extends AudioWorkletProcessor {
          process(inputs) {
            try {
              const input = inputs[0];
              if (input && input[0]) {
                const floats = input[0];
                const pcm16 = new Int16Array(floats.length);
                for (let i = 0; i < floats.length; i++) {
                  let s = Math.max(-1, Math.min(1, floats[i]));
                  pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                // Transfer the ArrayBuffer to main thread
                this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
              }
            } catch (e) {
              // swallow to avoid crashing the audio thread
            }
            return true;
          }
        }
        registerProcessor('recorder-processor', RecorderProcessor);
      `;

      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const moduleUrl = URL.createObjectURL(blob);
      await this.audioContext.audioWorklet.addModule(moduleUrl);

      this.processorNode = new AudioWorkletNode(this.audioContext, 'recorder-processor', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1 });

      this.processorNode.port.onmessage = (e) => {
        if (!this.sessionPromise) return;
        try {
          // Reconstruct Int16Array (received as transferred ArrayBuffer)
          const buffer = e.data as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = btoa(binary);

          // If session not open yet, queue audio to be flushed on open
          if (this.sessionState !== 'open') {
            this.pendingAudio.push(base64Data);
            return;
          }

          // Send audio safely — guard against closed/closing websocket errors
          this.sessionPromise.then(session => {
            try {
              if (!session || typeof (session as any).sendRealtimeInput !== 'function') {
                console.warn('Live session not ready for realtime input');
                return;
              }
              // Check possible websocket-like props before sending
              const conn = (session as any).conn || (session as any).ws || (session as any).socket;
              const ready = conn && (conn.readyState === WebSocket.OPEN || conn.ws?.readyState === WebSocket.OPEN || conn.socket?.readyState === WebSocket.OPEN);
              if (conn && !ready) {
                // Re-queue if underlying socket isn't open
                this.pendingAudio.push(base64Data);
                return;
              }
              (session as any).sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              });
            } catch (err) {
              console.error('Error sending audio (possible closed websocket):', err);
              try { this.stop(); } catch (e) { console.error('Error stopping after audio send failure:', e); }
            }
          }).catch(err => { console.error('Error resolving sessionPromise for audio:', err); this.stop(); });
        } catch (err) {
          console.error('Error processing audio buffer from worklet:', err);
          try { this.stop(); } catch (e) { console.error('Error stopping after processing failure:', e); }
        }
      };

      this.source.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      // Connect to Live API
      this.sessionState = 'connecting';
      this.sessionPromise = this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [
              {
                name: "executeBrowserAction",
                description: "Open a website or perform a browser action ONLY when the user explicitly asks to open a site, play a song on YouTube/Spotify, or send a WhatsApp message. Do not call this for general conversation or implied requests.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING, description: "Type of action: 'open', 'youtube', 'spotify', 'whatsapp'" },
                    query: { type: Type.STRING, description: "The search query, website name, or message content." },
                    target: { type: Type.STRING, description: "The target phone number for WhatsApp, if applicable." }
                  },
                  required: ["actionType", "query"]
                }
              },
              {
                name: "stopPlayback",
                description: "Stop any currently playing audio or video playback immediately.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                  required: []
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: (...args: any[]) => {
            console.log("Live API Connected", ...args);
            this.sessionState = 'open';
            // Flush any queued inputs
            if (this.pendingAudio.length > 0) {
              const toSend = this.pendingAudio.splice(0);
              this.sessionPromise?.then(session => {
                for (const a of toSend) {
                  try {
                    const conn = (session as any).conn || (session as any).ws || (session as any).socket;
                    const ready = conn && (conn.readyState === WebSocket.OPEN || conn.ws?.readyState === WebSocket.OPEN || conn.socket?.readyState === WebSocket.OPEN);
                    if (conn && !ready) {
                      this.pendingAudio.push(a);
                      continue;
                    }
                    (session as any).sendRealtimeInput({ audio: { data: a, mimeType: 'audio/pcm;rate=16000' } });
                  } catch (e) { console.error('Error flushing queued audio:', e); }
                }
              }).catch(err => console.error('Error flushing queued audio, session not available:', err));
            }
            if (this.pendingText.length > 0) {
              const toSendText = this.pendingText.splice(0);
              this.sessionPromise?.then(session => {
                for (const t of toSendText) {
                  try {
                    const conn = (session as any).conn || (session as any).ws || (session as any).socket;
                    const ready = conn && (conn.readyState === WebSocket.OPEN || conn.ws?.readyState === WebSocket.OPEN || conn.socket?.readyState === WebSocket.OPEN);
                    if (conn && !ready) {
                      this.pendingText.push(t);
                      continue;
                    }
                    (session as any).sendRealtimeInput({ text: t });
                  } catch (e) { console.error('Error flushing queued text:', e); }
                }
              }).catch(err => console.error('Error flushing queued text, session not available:', err));
            }
            this.onStateChange("listening");
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle User Transcription (if available)
            const userTranscription = (message as any).content?.parts?.find((part: any) => part.text && (message as any).content?.type === 'client')?.text;
            if (userTranscription) {
              this.onMessage("user", userTranscription);
            }

            // Handle Lisa's Text Response
            const lisaTextResponse = message.serverContent?.modelTurn?.parts?.find((part: any) => part.text)?.text;
            if (lisaTextResponse) {
              this.onMessage("lisa", lisaTextResponse);
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.find((part: any) => part.inlineData)?.inlineData?.data;
            if (base64Audio) {
              this.onStateChange("speaking");
              this.playAudioChunk(base64Audio);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              this.stopPlayback();
              this.onStateChange("listening");
            }

            // Handle Function Calls
            const functionCalls = message.toolCall?.functionCalls || (message as any)?.serverContent?.toolCall?.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                if (call.name === "executeBrowserAction") {
                  const args = call.args as any;
                  let url = "";
                  if (args.actionType === "youtube") {
                    const directUrl = await getFirstYouTubeVideoUrl(args.query);
                    url = directUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "spotify") {
                    url = `https://open.spotify.com/search/${encodeURIComponent(args.query)}`;
                  } else if (args.actionType === "whatsapp") {
                    // Use WhatsApp API URL for mobile compatibility and automatic app/web redirection.
                    url = `https://api.whatsapp.com/send?phone=${args.target || ''}&text=${encodeURIComponent(args.query)}`;
                  } else {
                    let website = args.query.replace(/\s+/g, "");
                    if (!website.includes(".")) website += ".com";
                    url = `https://www.${website}`;
                  }
                  
                  this.onCommand(url);
                  
                  // Send tool response
                  this.sessionPromise?.then(session => {
                     try {
                       const conn = (session as any).conn || (session as any).ws || (session as any).socket;
                       const ready = conn && (conn.readyState === WebSocket.OPEN || conn.ws?.readyState === WebSocket.OPEN || conn.socket?.readyState === WebSocket.OPEN);
                       if (conn && !ready) {
                         console.warn('Skipping tool response send; connection not open');
                         return;
                       }
                       session.sendToolResponse({
                         functionResponses: [{
                           name: call.name,
                           id: call.id,
                           response: { result: "Action executed successfully in the browser." }
                         }]
                       });
                     } catch (e) { console.error('Error sending tool response:', e); }
                  });
                } else if (call.name === "stopPlayback") {
                  this.stopPlayback();
                  this.onStateChange("listening");
                  
                  // Send tool response
                  this.sessionPromise?.then(session => {
                     try {
                       const conn = (session as any).conn || (session as any).ws || (session as any).socket;
                       const ready = conn && (conn.readyState === WebSocket.OPEN || conn.ws?.readyState === WebSocket.OPEN || conn.socket?.readyState === WebSocket.OPEN);
                       if (conn && !ready) {
                         console.warn('Skipping tool response send; connection not open');
                         return;
                       }
                       session.sendToolResponse({
                         functionResponses: [{
                           name: call.name,
                           id: call.id,
                           response: { result: "Playback stopped successfully." }
                         }]
                       });
                     } catch (e) { console.error('Error sending tool response:', e); }
                  });
                }
              }
            }
          },
          onclose: (...args: any[]) => {
            console.log("Live API Closed", ...args);
            this.sessionState = 'closed';
            this.stop();
          },
          onerror: (...args: any[]) => {
            console.error("Live API Error:", ...args);
            this.sessionState = 'closed';
            this.stop();
          }
        }
      });

      // Debug: log when the session promise resolves or rejects
      this.sessionPromise.then(session => {
        try {
          console.log('Live session resolved:', Object.keys(session || {}));
        } catch (e) {
          console.log('Live session resolved (non-enumerable):', session);
        }
      }).catch(err => {
        console.error('Live session failed to connect:', err);
      });

    } catch (error) {
      console.error("Failed to start Live Session:", error);
      this.stop();
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
      console.error("Error playing chunk", e);
    }
  }

  private stopPlayback() {
    if (this.playbackContext) {
      this.playbackContext.close();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;
      this.isPlaying = false;
    }
  }

  stop() {
    if (this.processorNode) {
      try { this.processorNode.disconnect(); } catch (e) { /* ignore */ }
      this.processorNode = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.stopPlayback();
    
    if (this.sessionPromise) {
      this.sessionPromise.then(session => session.close()).catch(() => {});
      this.sessionPromise = null;
    }
    
    this.onStateChange("idle");
  }

  sendText(text: string) {
    // If session hasn't reached open, queue the text
    if (this.sessionState !== 'open') {
      this.pendingText.push(text);
      return;
    }

    if (this.sessionPromise) {
      this.sessionPromise.then(session => {
        try {
          if (!session || typeof (session as any).sendRealtimeInput !== 'function') {
            console.warn('Live session not available for sendText');
            return;
          }
          const conn = (session as any).conn || (session as any).ws || (session as any).socket;
          const ready = conn && (conn.readyState === WebSocket.OPEN || conn.ws?.readyState === WebSocket.OPEN || conn.socket?.readyState === WebSocket.OPEN);
          if (conn && !ready) {
            this.pendingText.push(text);
            return;
          }
          (session as any).sendRealtimeInput({ text });
        } catch (err) {
          console.error('Error sending text to live session:', err);
        }
      }).catch(err => console.error('sendText session promise error:', err));
    }
  }
}
