import { auth } from "../config/firebase";
import { ConversationSession, ExtractedFact, MemoryMessage, PersonaConfig } from "../core/memory/types";

let chatSession: any = null;

export function resetLisaSession() {
  chatSession = null;
}

export interface LisaChatResult {
  text: string;
  conversationId?: string;
  messageId?: string;
  provider?: string;
  plan?: string;
  warning?: string;
  summary?: string;
  updatedPersona?: PersonaConfig;
  temporaryPersonaApplied?: PersonaConfig;
}

export interface SendMessageOptions {
  prompt: string;
  history?: { sender: "user" | "lisa" | "assistant"; text: string }[];
  userName?: string;
  voiceHistoryContext?: string;
  customMemory?: string;
  image?: string;
  mimeType?: string;
  conversationId?: string;
  activePersona?: PersonaConfig;
  currentTopic?: string;
  entities?: Record<string, string>;
  clientMessageId?: string;
  maxRetries?: number;
  activeDocumentId?: string;
  userAgeTier?: "minor_under_18" | "adult" | "unknown";
}

export async function getLisaResponse(
  prompt: string,
  history: { sender: "user" | "lisa" | "assistant", text: string }[] = [],
  userName: string = "user",
  voiceHistoryContext: string = "",
  customMemory: string = "",
  image?: string,
  mimeType?: string,
  conversationId?: string,
  activePersona?: PersonaConfig,
  currentTopic?: string,
  entities?: Record<string, string>,
  clientMessageId?: string
): Promise<string> {
  const result = await sendLisaMessageWithRetry({
    prompt,
    history,
    userName,
    voiceHistoryContext,
    customMemory,
    image,
    mimeType,
    conversationId,
    activePersona,
    currentTopic,
    entities,
    clientMessageId,
    maxRetries: 3
  });
  return result.text;
}

export async function sendLisaMessageWithRetry(options: SendMessageOptions): Promise<LisaChatResult> {
  const maxRetries = options.maxRetries ?? 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      let token: string | undefined = undefined;
      if (auth.currentUser) {
        try {
          token = await auth.currentUser.getIdToken();
        } catch (tokenErr) {
          console.error("[LISA CHAT] Error getting user ID token:", tokenErr);
        }
      }

      console.log(`[LISA CHAT] Sending text request (attempt ${attempt}/${maxRetries}) to /api/gemini/chat`, {
        hasToken: Boolean(token),
        userName: options.userName,
        promptLength: options.prompt.length,
        historyCount: options.history?.length || 0,
        hasImage: Boolean(options.image),
        conversationId: options.conversationId || "auto",
        persona: options.activePersona?.id || "default",
        currentTopic: options.currentTopic || "general"
      });

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          prompt: options.prompt,
          history: options.history || [],
          userName: options.userName || "user",
          voiceHistoryContext: options.voiceHistoryContext || "",
          customMemory: options.customMemory || "",
          image: options.image,
          mimeType: options.mimeType,
          conversationId: options.conversationId,
          activePersona: options.activePersona,
          currentTopic: options.currentTopic,
          entities: options.entities,
          clientMessageId: options.clientMessageId,
          activeDocumentId: options.activeDocumentId,
          userAgeTier: options.userAgeTier,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"
        })
      });

      if (!res.ok) {
        // Retry on 502, 503, 504, 429, or 500 transient errors
        const isTransient = [429, 500, 502, 503, 504].includes(res.status);
        if (isTransient && attempt < maxRetries) {
          const delay = 1000 * Math.pow(1.8, attempt) + Math.random() * 300;
          console.warn(`[LISA CHAT] Server returned ${res.status}. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        let errMessage = `Server returned HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.message) {
            errMessage = `[${errJson.provider || "AI"} Error ${res.status}] ${errJson.message}`;
          }
        } catch (e) {
          const errText = await res.text().catch(() => "");
          if (errText) errMessage += `: ${errText}`;
        }
        throw new Error(errMessage);
      }

      const data = await res.json();
      if (data.error) {
        const errMsg = typeof data.message === "string" ? data.message : "AI provider error";
        throw new Error(`[${data.provider || "AI"} Error] ${errMsg}`);
      }

      return {
        text: data.text || "Ugh, fine. I have nothing to say.",
        conversationId: data.conversationId,
        messageId: data.messageId,
        provider: data.provider,
        plan: data.plan,
        warning: data.warning,
        summary: data.summary,
        updatedPersona: data.updatedPersona,
        temporaryPersonaApplied: data.temporaryPersonaApplied
      };
    } catch (error: any) {
      console.error(`[LISA CHAT] Attempt ${attempt} failed:`, error);
      if (attempt >= maxRetries) {
        return {
          text: `[AI Error] ${error?.message || `Uff, connection error ho gaya hai. Please check your network and try again, ${options.userName || "friend"}.`}`,
          conversationId: options.conversationId
        };
      }
      // Wait with backoff before retry
      const delay = 1000 * Math.pow(1.8, attempt) + Math.random() * 300;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return {
    text: `[AI Error] Network timeout. Please try again.`,
    conversationId: options.conversationId
  };
}

export async function fetchConversations(): Promise<ConversationSession[]> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch("/api/conversations", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.conversations || [];
  } catch (e) {
    console.error("[LISA CONV] Error fetching conversations:", e);
    return [];
  }
}

export async function createNewConversation(title?: string, conversationId?: string): Promise<ConversationSession | null> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ title, conversationId })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.conversation || null;
  } catch (e) {
    console.error("[LISA CONV] Error creating conversation:", e);
    return null;
  }
}

export async function fetchConversationMessages(conversationId: string): Promise<{ conversation: ConversationSession | null; messages: MemoryMessage[] }> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) return { conversation: null, messages: [] };
    const data = await res.json();
    return {
      conversation: data.conversation || null,
      messages: data.messages || []
    };
  } catch (e) {
    console.error(`[LISA CONV] Error loading messages for ${conversationId}:`, e);
    return { conversation: null, messages: [] };
  }
}

export async function deleteConversationApi(conversationId: string): Promise<boolean> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });
    return res.ok;
  } catch (e) {
    console.error(`[LISA CONV] Error deleting conversation ${conversationId}:`, e);
    return false;
  }
}

export async function updateConversationTitleApi(conversationId: string, title: string): Promise<boolean> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ title })
    });
    return res.ok;
  } catch (e) {
    console.error(`[LISA CONV] Error updating conversation title:`, e);
    return false;
  }
}

export async function fetchUserFactsApi(): Promise<ExtractedFact[]> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch("/api/memory/facts", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.facts || [];
  } catch (e) {
    console.error("[LISA MEMORY] Error fetching facts:", e);
    return [];
  }
}

export async function getLisaAudio(text: string, voice: string = "Kore"): Promise<string | null> {
  try {
    console.log("[LISA TTS] Calling /api/gemini/tts");
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const res = await fetch("/api/gemini/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ text, voice })
    });
    console.log(`[LISA TTS] HTTP status: ${res.status}`);
    if (!res.ok) {
      console.warn(`[LISA TTS] Response audio present: no`);
      console.warn(`[LISA TTS] Audio bytes: 0`);
      console.warn(`[LISA TTS] Error: Server returned HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const hasAudio = Boolean(data.audio);
    const audioBytes = data.audioBytes || (data.audio ? Math.floor((data.audio.length * 3) / 4) : 0);
    console.log(`[LISA TTS] Response audio present: ${hasAudio ? "yes" : "no"}`);
    console.log(`[LISA TTS] Audio bytes: ${audioBytes}`);

    if (data.warning) {
      console.warn(`[LISA TTS] Warning: ${data.warning}`);
    }
    if (data.error) {
      console.warn(`[LISA TTS] Error: ${data.error}`);
      return null;
    }
    if (!hasAudio || audioBytes === 0) {
      console.warn("[LISA TTS] Gemini TTS quota is exhausted or audio generation unavailable.");
      return null;
    }
    return data.audio;
  } catch (error: any) {
    const safeMsg = error?.message || String(error);
    console.warn(`[LISA TTS] Response audio present: no`);
    console.warn(`[LISA TTS] Audio bytes: 0`);
    console.warn(`[LISA TTS] Error: Fetch to /api/gemini/tts failed: ${safeMsg}`);
    return null;
  }
}

export async function synthesizeCustomPersonaApi(roleQuery: string, domain?: string, tone?: string): Promise<PersonaConfig | null> {
  try {
    const res = await fetch("/api/persona/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleQuery, domain, tone })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.persona || null;
  } catch (e) {
    console.error("[LISA PERSONA] Error calling /api/persona/synthesize:", e);
    return null;
  }
}
