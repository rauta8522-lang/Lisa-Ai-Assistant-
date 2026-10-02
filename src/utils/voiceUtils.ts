export interface UserVoiceContext {
  email?: string;
  name?: string;
  uid?: string;
}

/**
 * Returns Lisa's configured voice consistently across the entire application.
 * Ensures the exact same voice is used for:
 * - Smart Activation Greetings
 * - Normal Chat Responses (TTS)
 * - Gemini Live Audio Sessions
 * - Follow-up and Resumed turns
 *
 * Default voice is "Kore" (Lisa's signature emotional, human-like voice).
 */
export function getLisaPreferredVoice(user?: UserVoiceContext | null): string {
  if (typeof localStorage === "undefined") return "Kore";

  if (user?.email) {
    const byEmail = localStorage.getItem(`lisa_preferred_voice_${user.email}`);
    if (byEmail && byEmail.trim()) return byEmail.trim();

    const byEmailLower = localStorage.getItem(`lisa_preferred_voice_${user.email.toLowerCase()}`);
    if (byEmailLower && byEmailLower.trim()) return byEmailLower.trim();
  }

  try {
    const savedUserJson = localStorage.getItem("lisa_current_user");
    if (savedUserJson) {
      const parsed = JSON.parse(savedUserJson);
      if (parsed?.email) {
        const v1 = localStorage.getItem(`lisa_preferred_voice_${parsed.email}`);
        if (v1 && v1.trim()) return v1.trim();
        const v2 = localStorage.getItem(`lisa_preferred_voice_${parsed.email.toLowerCase()}`);
        if (v2 && v2.trim()) return v2.trim();
      }
    }
  } catch {}

  const globalVoice = localStorage.getItem("lisa_preferred_voice");
  if (globalVoice && globalVoice.trim()) return globalVoice.trim();

  return "Kore";
}

/**
 * Saves Lisa's voice preference consistently across all account formats.
 */
export function setLisaPreferredVoice(voice: string, user?: UserVoiceContext | null): void {
  if (typeof localStorage === "undefined" || !voice) return;
  const cleanVoice = voice.trim();

  localStorage.setItem("lisa_preferred_voice", cleanVoice);

  if (user?.email) {
    localStorage.setItem(`lisa_preferred_voice_${user.email}`, cleanVoice);
    localStorage.setItem(`lisa_preferred_voice_${user.email.toLowerCase()}`, cleanVoice);
  }
}
