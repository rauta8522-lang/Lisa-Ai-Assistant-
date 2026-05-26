/**
 * Cross-platform audio playback utility
 * Supports all browsers and devices (Web Audio API with fallbacks)
 */

// Check if AudioContext is available
function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    return new AudioContextClass();
  } catch (e) {
    console.warn('AudioContext not available');
    return null;
  }
}

/**
 * Play PCM audio data (primary method - works on all modern devices)
 */
export async function playPCM(base64Data: string): Promise<void> {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) {
      console.warn("AudioContext not supported, trying fallback");
      await playAudioFallback(base64Data);
      return;
    }

    // Resume audio context if suspended (required on mobile)
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
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

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);

    return new Promise<void>((resolve) => {
      source.onended = () => resolve();
      // Timeout fallback in case onended doesn't fire
      setTimeout(resolve, (buffer.length / 24000) * 1000 + 100);
    });
  } catch (error) {
    console.error("Error playing audio via Web Audio API:", error);
    await playAudioFallback(base64Data);
  }
}

/**
 * Fallback audio playback using Audio element (for browsers without Web Audio API)
 */
async function playAudioFallback(base64Data: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      // Create blob from base64
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio();
      audio.src = audioUrl;
      audio.crossOrigin = 'anonymous';
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };
      
      audio.play().catch((err) => {
        console.error('Audio play error:', err);
        URL.revokeObjectURL(audioUrl);
        reject(err);
      });

      // Timeout fallback
      setTimeout(() => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      }, 30000);
    } catch (error) {
      console.error('Fallback audio error:', error);
      reject(error);
    }
  });
}

/**
 * Check if audio context is available
 */
export function isAudioSupported(): boolean {
  return !!getAudioContext();
}

/**
 * Resume audio context (needed for mobile)
 */
export async function resumeAudioContext(): Promise<void> {
  const audioCtx = getAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
      console.log('Audio context resumed');
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
}
