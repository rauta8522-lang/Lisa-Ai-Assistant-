export async function playPCM(base64Data: string): Promise<void> {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("AudioContext not supported");
      return;
    }
    const audioCtx = new AudioContextClass({ sampleRate: 24000 });
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
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
    
    return new Promise<void>(resolve => {
      source.onended = () => resolve();
    });
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}

export function speakWithWebSpeech(text: string): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("SpeechSynthesis not supported on this browser.");
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanedText = text
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
        .replace(/[*_~`#\-]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const voices = window.speechSynthesis.getVoices();
      
      // Look for Indian English (en-IN) or Hindi (hi-IN) female or general voices
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

      utterance.rate = 1.05;
      utterance.pitch = 1.05;

      utterance.onend = () => resolve();
      utterance.onerror = (err) => {
        console.error("SpeechSynthesis error:", err);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("SpeechSynthesis runtime issue:", err);
      resolve();
    }
  });
}
