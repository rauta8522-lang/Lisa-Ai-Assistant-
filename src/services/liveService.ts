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
  
  private userName: string;
  private voiceHistoryContext: string;
  private customMemory: string;
  private voice: string;
  
  public onStateChange: (state: "idle" | "listening" | "processing" | "speaking") => void = () => {};
  public onMessage: (sender: "user" | "lisa", text: string) => void = () => {};
  public onCommand: (url: string) => void = () => {};

  constructor(userName: string = "user", voiceHistoryContext: string = "", customMemory: string = "", voice: string = "Kore") {
    this.userName = userName;
    this.voiceHistoryContext = voiceHistoryContext;
    this.customMemory = customMemory;
    this.voice = voice;
  }

  async start() {
    try {
      this.onStateChange("processing");
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: 16000 });
      this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = this.playbackContext.currentTime;

      // Audio capture
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const buffer = new ArrayBuffer(pcm16.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcm16.length; i++) {
          view.setInt16(i * 2, pcm16[i], true);
        }
        
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        this.ws.send(JSON.stringify({ audio: base64Data }));
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${proto}//${host}/live?userName=${encodeURIComponent(this.userName)}&voiceHistoryContext=${encodeURIComponent(this.voiceHistoryContext)}&customMemory=${encodeURIComponent(this.customMemory)}&voice=${encodeURIComponent(this.voice)}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connection to server established");
        this.onStateChange("listening");
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.connected) {
            console.log("Live session connected through server proxy");
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
          }

          if (msg.userText) {
            this.onMessage("user", msg.userText);
          }

          if (msg.functionCall) {
            const { actionType, query, target, callId } = msg.functionCall;
            let url = "";
            if (actionType === "youtube") {
              url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            } else if (actionType === "spotify") {
              url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
            } else if (actionType === "whatsapp") {
              url = `https://web.whatsapp.com/send?phone=${target || ''}&text=${encodeURIComponent(query)}`;
            } else {
              let website = query.replace(/\s+/g, "");
              if (!website.includes(".")) website += ".com";
              url = `https://www.${website}`;
            }
            
            this.onCommand(url);

            // Send tool response back to server
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({
                functionResponse: { callId }
              }));
            }
          }

        } catch (e) {
          console.error("Error handling server websocket message", e);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket connection to server closed");
        this.stop();
      };

      this.ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        this.stop();
      };

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
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
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
    
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    
    this.onStateChange("idle");
  }

  sendText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ text }));
    }
  }
}
