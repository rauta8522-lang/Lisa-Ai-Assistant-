import { AnimalSoundSystem } from "../core/audio/AnimalSoundRegistry";
import { analytics } from "../services/analyticsService";

// Active audio tracking for duplicate prevention & session recovery
let activeAudioSource: AudioBufferSourceNode | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let lastSpokenTextHash = "";
let isAudioPlaying = false;
const audioQueue: { text: string; persona?: string }[] = [];
let isQueueProcessing = false;

export async function playPCM(base64Data: string): Promise<void> {
  const startTime = Date.now();
  analytics.track("voice_started", { feature: "voice", type: "pcm" });
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("[LISA TTS] Error: AudioContext not supported in this browser");
      analytics.track("error_occurred", { feature: "voice", errorCategory: "audio_context_unsupported" });
      return;
    }
    const audioCtx = new AudioContextClass({ sampleRate: 24000 });

    if (audioCtx.state === "suspended") {
      try {
        await audioCtx.resume();
      } catch (resumeErr: any) {
        console.warn("[LISA TTS] Error: AudioContext resume failed:", resumeErr?.message || resumeErr);
      }
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = new Int16Array(bytes.buffer);
    const audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      channelData[i] = buffer[i] / 32768.0;
    }

    // Stop any existing active audio (interrupted speech recovery)
    stopAllAudio();

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    activeAudioSource = source;
    isAudioPlaying = true;

    console.log("[LISA TTS] Playback started");
    source.start();

    return new Promise<void>((resolve) => {
      const durationMs = (buffer.length / 24000) * 1000 + 800;
      const timeoutId = setTimeout(() => {
        isAudioPlaying = false;
        activeAudioSource = null;
        console.log("[LISA TTS] Playback completed");
        analytics.track("voice_ended", { feature: "voice", type: "pcm", latency: Date.now() - startTime });
        resolve();
      }, durationMs);

      source.onended = () => {
        clearTimeout(timeoutId);
        isAudioPlaying = false;
        activeAudioSource = null;
        console.log("[LISA TTS] Playback completed");
        analytics.track("voice_ended", { feature: "voice", type: "pcm", latency: Date.now() - startTime });
        resolve();
      };
    });
  } catch (error: any) {
    isAudioPlaying = false;
    activeAudioSource = null;
    const safeMsg = error?.message || String(error);
    console.error(`[LISA TTS] Playback failed: ${safeMsg}`);
    analytics.track("error_occurred", { feature: "voice", errorCategory: "pcm_playback_failed", error: safeMsg });
  }
}

export function stopAllAudio(): void {
  try {
    if (activeAudioSource) {
      try { activeAudioSource.stop(); } catch {}
      activeAudioSource = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isAudioPlaying = false;
    console.log("[LISA TTS] Interrupted & stopped all audio playback");
  } catch (e) {
    console.warn("[LISA TTS] Stop audio error:", e);
  }
}

export function speakWithWebSpeech(text: string, personaName: string = "default"): Promise<void> {
  const startTime = Date.now();
  analytics.track("voice_started", { feature: "voice", type: "webspeech", persona: personaName });
  // Duplicate audio prevention
  const textHash = text.trim();
  if (textHash === lastSpokenTextHash && isAudioPlaying) {
    console.log("[LISA TTS] Duplicate audio playback prevented");
    return Promise.resolve();
  }
  lastSpokenTextHash = textHash;

  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("SpeechSynthesis not supported on this browser.");
      analytics.track("error_occurred", { feature: "voice", errorCategory: "webspeech_unsupported" });
      resolve();
      return;
    }

    try {
      stopAllAudio();
      isAudioPlaying = true;

      const cleanedText = text
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
        .replace(/[*_~`#\-]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      currentUtterance = utterance;
      const voices = window.speechSynthesis.getVoices();

      let preferredVoice = voices.find(
        (v) =>
          (v.lang.includes("en-IN") || v.lang.includes("hi-IN")) &&
          v.name.toLowerCase().includes("female")
      );

      if (!preferredVoice) {
        preferredVoice = voices.find(
          (v) => v.lang.includes("en-IN") || v.lang.includes("hi-IN")
        );
      }

      if (!preferredVoice) {
        preferredVoice = voices.find(
          (v) => v.lang.includes("en") && v.name.toLowerCase().includes("female")
        );
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Persona-aware delivery tuning
      let rate = 1.05;
      let pitch = 1.05;

      const pLower = (personaName || "").toLowerCase();
      if (pLower.includes("professional") || pLower.includes("expert")) {
        rate = 1.0;
        pitch = 1.0;
      } else if (pLower.includes("teacher") || pLower.includes("professor")) {
        rate = 0.95;
        pitch = 1.02;
      } else if (pLower.includes("calm") || pLower.includes("zen") || pLower.includes("meditation")) {
        rate = 0.85;
        pitch = 0.95;
      } else if (pLower.includes("enthusiastic") || pLower.includes("energetic")) {
        rate = 1.15;
        pitch = 1.15;
      } else if (pLower.includes("supportive") || pLower.includes("companion")) {
        rate = 1.0;
        pitch = 1.08;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = async () => {
        isAudioPlaying = false;
        currentUtterance = null;
        analytics.track("voice_ended", { feature: "voice", type: "webspeech", latency: Date.now() - startTime });

        // Check for animal mention and optionally play realistic animal sound
        const animalMatch = AnimalSoundSystem.detectAnimalMention(text);
        if (animalMatch) {
          console.log(`[ANIMAL SOUND SYSTEM] Detected animal mention: "${animalMatch.species}". Playing sound effect.`);
          analytics.track("animal_sound_played", { feature: "voice", animal: animalMatch.species });
          await AnimalSoundSystem.playAnimalSound(animalMatch);
        }

        resolve();
      };

      utterance.onerror = (err) => {
        console.error("SpeechSynthesis error:", err);
        analytics.track("error_occurred", { feature: "voice", errorCategory: "webspeech_error", error: String(err) });
        isAudioPlaying = false;
        currentUtterance = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("SpeechSynthesis runtime issue:", err);
      analytics.track("error_occurred", { feature: "voice", errorCategory: "webspeech_runtime_exception", error: String(err) });
      isAudioPlaying = false;
      currentUtterance = null;
      resolve();
    }
  });
}

// Long-answer narration & Queue Management
export async function queueAudioPlayback(text: string, personaName: string = "default"): Promise<void> {
  audioQueue.push({ text, persona: personaName });
  if (!isQueueProcessing) {
    processAudioQueue();
  }
}

async function processAudioQueue() {
  if (audioQueue.length === 0) {
    isQueueProcessing = false;
    return;
  }
  isQueueProcessing = true;
  const item = audioQueue.shift();
  if (item) {
    await speakWithWebSpeech(item.text, item.persona);
  }
  processAudioQueue();
}

export function narrateDocument(documentText: string, personaName: string = "default"): void {
  // Split long document into digestible paragraphs for reliable narration queueing
  const chunks = documentText.match(/[^.!?]+[.!?]+/g) || [documentText];
  for (const chunk of chunks) {
    if (chunk.trim()) {
      queueAudioPlayback(chunk.trim(), personaName);
    }
  }
}
