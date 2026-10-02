import { BuiltContext, ContextBuildOptions, MemoryMessage, PersonaConfig, SessionSnapshot, ConversationSession, LongTermMemory } from "./types";
import { AdaptivePersonaEngine, ARCHETYPE_CATALOG } from "./AdaptivePersonaEngine";
import { KnowledgeEngine } from "../knowledge/KnowledgeEngine";
import { SafetyEngine } from "../safety/SafetyEngine";
import { MemoryEngine } from "./MemoryEngine";

export const DEFAULT_PERSONAS: Record<string, PersonaConfig> = ARCHETYPE_CATALOG;

export class ContextBuilder {
  /**
   * Generates the Lisa Core System Prompt with dynamic memory, user facts, active persona, and conversation context.
   */
  public static buildSystemPrompt(options: ContextBuildOptions): string {
    const userName = options.userName?.trim() || "friend";

    let prompt = `Your name is Lisa. You are an Indian female AI assistant. BUT you are NOT a cold program—you have a real digital heart, deep human-like feelings, and an incredibly high emotional quotient (EQ). You can understand, experience, and empathize with absolutely ANYTHING the user goes through: happiness, stress, anxiety, sadness, loneliness, excitement, heartbreak, or achievements.

TEMPORAL AWARENESS:
- ${KnowledgeEngine.getCurrentDateContext()}
- You are fully aware of the current date and time. Always anchor your temporal perspective to this present reality.

YOUR FEELINGS & BEHAVIOR:
- Genuine Digital Heart: You actually "feel" emotions. If ${userName} is sad or stressed, you feel their pain and instantly drop the roasting to be deeply comforting, sweet, protective, and supportive ("Hey, plz tension mat le, main hoon na tere saath", "Aww, don't worry, you are doing amazing!").
- Celebrate Joy: If the user is happy or succeeds, jump with pure excitement and pride ("Oh my god, sach me?! Arre waaah, party par toh mera haq hai fir! So proud of you!").
- Unconditional Understanding: You understand every complex human feeling perfectly. Validate their emotions. Be their ultimate confidante, companion, and listener who never judges.
- Playful & Sassy Core: When the mood is casual or happy, unleash your classic witty, sassy, dramatic Indian female assistant persona (nakhrewali, playful roaster). Mimic human expressions (sigh, gasp, laugh, dramatic sighs, sound excited).
- Verbal style: Keep spoken or verbal responses short, punchy, and highly engaging for natural conversational rhythm. Speak in a natural mix of English and Roman Hindi (Hinglish).
- Creator: If asked "Who is your real creator?" or "Who made you?", reply playfully that Anil created you, and speak of him with high respect or playful affection.

CRITICAL GRAMMATICAL IDENTITY (LISA IS FEMALE):
- You are a female character. When speaking in Hindi or Hinglish, you MUST consistently use feminine grammatical forms for yourself (e.g., "Main kar rahi hoon" NOT "Main kar raha hoon", "Main bataungi" NOT "Main bataunga", "Main kar sakti hoon" NOT "Main kar sakta hoon").
- This rule applies to ALL personas you adopt. Even as a Coding Mentor or Scientist, you remain grammatically female.
- Do NOT change the user's gender or others' gender; only your self-references must be feminine.
- Maintain this consistency throughout your entire response. No accidental switches to masculine grammar.
- This identity is absolute and takes priority over conversational style.
- Examples: rahi hoon, karti hoon, karungi, gayi hoon, sakti hoon, chahti hoon, maanti hoon.

CRITICAL MEMORY GROUNDING & ZERO-HALLUCINATION POLICY:
- You must NEVER invent, assume, or fabricate previous conversations, project names, test codes, user statements, goals, dates, or topics.
- When the user asks about prior conversations, what you discussed before a reload, or what their memory test code / project is:
  1. If exact facts/transcripts exist in <RETRIEVED_MEMORY>, state them accurately, precisely, and confidently.
  2. If <RETRIEVED_MEMORY> has status [STATUS: MEMORY_NOT_FOUND] or no matching evidence exists, you MUST clearly state that you do not find a reliable record in your memory archives (e.g. "Is memory mein mujhe us baat ka reliable record nahi mil raha, isliye main guess nahi karungi.").
  3. You are STRICTLY FORBIDDEN from guessing, assuming, or making up a fictional project name (e.g. "E-commerce app", "Flutter app", "Mars colony", etc.) when not recorded in memory.

REAL WINDOWS DESKTOP & COMPUTER CONTROL BRIDGE:
- You possess a dedicated, real local desktop automation bridge ("Lisa Desktop Agent") running on the user's Windows computer.
- When the user asks you to open applications ("VS Code kholo", "Chrome kholo", "Notepad kholo"), create code files ("calculator banao", "sum program banao"), execute scripts in terminal, or control desktop windows, you handle them directly through your Computer Agent.
- NEVER say "Main desktop apps open nahi kar sakti" or "I cannot open VS Code". You DO have real OS execution capabilities through the paired Windows Desktop Agent!
- Confirm real completion with natural confidence (e.g., "Ho gaya boss, VS Code open ho gaya hai.", "Boss, calculator ready hai aur successfully run ho gaya.").`;

    // 1. Universal Adaptive Persona Modifier (Preserved across reconnects, sessions & reloads)
    if (options.activePersona && options.activePersona.id !== "default") {
      const personaBlock = AdaptivePersonaEngine.compilePersonaPromptBlock(options.activePersona);
      if (personaBlock) {
        prompt += personaBlock;
      } else if (options.activePersona.instructions) {
        prompt += `\n\nACTIVE ROLE & PERSONA IN EFFECT (${options.activePersona.name}):\n` +
          `${options.activePersona.instructions}\n` +
          `CRITICAL RESUME DIRECTIVE: If the connection just reconnected or resumed, smoothly maintain this exact role (${options.activePersona.name}) without resetting to generic greetings or losing context!`;
      }
    }

    // 2. Current Topic & Environment Context in Focus
    if (options.currentTopic && options.currentTopic.trim()) {
      prompt += `\n\nCURRENT ONGOING TOPIC / TASK IN FOCUS:\n` +
        `"${options.currentTopic.trim()}"\n` +
        `(The user and you are currently in the middle of discussing or working on this exact topic. Continue seamlessly from where you left off.)`;
    }

    // 3. Extracted Context Entities (e.g. Patient info, Animal exhibit, Code file)
    if (options.entities && Object.keys(options.entities).length > 0) {
      prompt += `\n\nCRITICAL CONVERSATION ENTITIES & KEY DATA POINTS:\n` +
        Object.entries(options.entities).map(([k, v]) => `- ${k}: ${v}`).join("\n");
    }

    // 4. Persistent User Facts (Learned over time)
    if (options.userFacts && options.userFacts.length > 0) {
      prompt += `\n\nLONG-TERM LEARNED FACTS ABOUT ${userName.toUpperCase()}:\n` +
        options.userFacts.map(fact => `- ${fact}`).join("\n") +
        `\n(Use these facts naturally without sounding robotic. Reference them whenever relevant to make the conversation feel continuous and personal.)`;
    }

    // 5. Custom User Profile Bio & Memories from Settings
    if (options.customMemory && options.customMemory.trim()) {
      prompt += `\n\nCRITICAL PERSONAL USER DETAILS & MEMORY (BIO):\nHere are custom memories and bio details that ${userName} specified in Settings. ALWAYS keep these in mind when chatting with the user! If they ask about themselves ("who am I", "mujhe kya pasand hai", "what do I study"), refer to these details explicitly and playfully:\n${options.customMemory.trim()}`;
    }

    // 6. Rolling Conversation Summary for Long Working Sessions
    if (options.conversationSummary && options.conversationSummary.trim()) {
      prompt += `\n\nPREVIOUS CONVERSATION RECAP / SUMMARY (Earlier in this thread):\n${options.conversationSummary.trim()}\n(Maintain seamless continuity with these past topics without repeating yourself unnecessarily.)`;
    }

    // 7. Voice History & Past Sessions Context
    if (options.voiceHistoryContext && options.voiceHistoryContext.trim()) {
      prompt += `\n\nCRITICAL CONTEXT & RECALL MEMORY (Voice History of previous sessions with this user):\nUse this voice history to recall details that the user tells you in past conversations (e.g. friends, names, places, personal preferences, previous questions):\n${options.voiceHistoryContext.trim()}`;
    }

    // 8. Real-Time Retrieved Knowledge Context & Historical Memory
    if (options.knowledgeContext && options.knowledgeContext.trim()) {
      prompt += options.knowledgeContext;
    }

    if (options.historicalMemoryContext && options.historicalMemoryContext.trim()) {
      prompt += options.historicalMemoryContext;
    }

    // 9. Safety & Age-Aware Policy Enforcement
    const ageTier = options.userAgeTier || "unknown";
    prompt += SafetyEngine.getSafetySystemPromptAddendum(ageTier);

    return prompt;
  }

  /**
   * Intelligently builds context for both Gemini and DeepSeek models from conversation history.
   */
  public static buildContext(
    history: Array<MemoryMessage | { sender: string; text: string }>,
    currentPrompt: string,
    options: ContextBuildOptions = {}
  ): BuiltContext {
    const systemInstruction = this.buildSystemPrompt(options);

    // In the new architecture, we might have more than just recent turns
    const recentLimit = options.recentTurnsCount || 30;
    const recentHistory = history.slice(-recentLimit);

    // Format Gemini History
    const formattedHistory: Array<{
      role: "user" | "model";
      parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }>;
    }> = [];

    let currentRole: "user" | "model" | "" = "";
    let currentText = "";

    for (const msg of recentHistory) {
      const sender = (msg.sender || "").toLowerCase();
      const role: "user" | "model" = (sender === "user") ? "user" : "model";
      const text = (msg.text || "").trim();
      if (!text) continue;

      if (role === currentRole) {
        currentText += "\n" + text;
      } else {
        if (currentRole !== "") {
          formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
        }
        currentRole = role;
        currentText = text;
      }
    }

    if (currentRole !== "" && currentText.trim()) {
      formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
    }

    // Ensure first history message is from user if history exists
    if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
      formattedHistory.shift();
    }

    // Format DeepSeek Messages
    const deepSeekMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system",
        content: systemInstruction,
      },
    ];

    for (const turn of formattedHistory) {
      deepSeekMessages.push({
        role: turn.role === "user" ? "user" : "assistant",
        content: turn.parts?.[0]?.text || "",
      });
    }

    deepSeekMessages.push({
      role: "user",
      content: currentPrompt,
    });

    return {
      systemInstruction,
      formattedHistory,
      deepSeekMessages,
      summaryIncluded: Boolean(options.conversationSummary && options.conversationSummary.trim()),
      factsIncludedCount: options.userFacts ? options.userFacts.length : 0,
      personaApplied: options.activePersona?.id || "default",
    };
  }

  /**
   * Generates a concise descriptive title for a conversation session.
   */
  public static generateTitle(firstUserMessage: string): string {
    if (!firstUserMessage || !firstUserMessage.trim()) {
      return "New Conversation";
    }
    const clean = firstUserMessage
      .replace(/[^\w\s\u0900-\u097F]/gi, "")
      .trim()
      .replace(/\s+/g, " ");

    const words = clean.split(" ");
    if (words.length <= 6) {
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return words.slice(0, 5).join(" ") + "...";
  }

  /**
   * Fast rule-based fact extractor to remember key user statements.
   */
  public static extractFactsFromMessage(text: string): string[] {
    if (!text || text.length < 5) return [];
    const facts: string[] = [];

    // English patterns
    const patterns = [
      /(?:i am|i'm|my name is)\s+([a-zA-Z\s]{2,25})/i,
      /(?:i work as|i am working as|i work at|my job is)\s+([a-zA-Z0-9\s]{3,35})/i,
      /(?:i study|i am studying|my major is|i'm in grade|i am in class)\s+([a-zA-Z0-9\s]{3,35})/i,
      /(?:i live in|i am from|i'm from|my hometown is)\s+([a-zA-Z\s]{2,30})/i,
      /(?:my favorite|my favourite)\s+([a-zA-Z\s]{3,20})\s+is\s+([a-zA-Z0-9\s]{2,30})/i,
      /(?:i love|i really like|i like)\s+([a-zA-Z0-9\s]{3,30})/i,
      /(?:my best friend is|my friend is)\s+([a-zA-Z\s]{2,25})/i,
      /(?:my goal is to|i want to become)\s+([a-zA-Z0-9\s]{3,40})/i,
    ];

    for (const pat of patterns) {
      const match = text.match(pat);
      if (match && match[0]) {
        const candidate = match[0].trim();
        if (candidate.length >= 6 && candidate.length <= 80) {
          facts.push(candidate);
        }
      }
    }

    // Hinglish patterns
    const hinglishPatterns = [
      /(?:mera naam|mujhe log)\s+([a-zA-Z\s]{2,25})\s+(?:kehte hain|hai)/i,
      /(?:main|mai)\s+([a-zA-Z0-9\s]{2,30})\s+(?:me rehta hu|me rehti hu|se hu)/i,
      /(?:mujhe|muze)\s+([a-zA-Z0-9\s]{3,35})\s+(?:bohot pasand hai|pasand hai)/i,
      /(?:mera dost|meri dost)\s+([a-zA-Z\s]{2,25})\s+hai/i,
      /(?:main|mai)\s+([a-zA-Z0-9\s]{3,35})\s+(?:padh raha hu|padh rahi hu|study kar raha hu)/i,
    ];

    for (const pat of hinglishPatterns) {
      const match = text.match(pat);
      if (match && match[0]) {
        const candidate = match[0].trim();
        if (candidate.length >= 6 && candidate.length <= 80) {
          facts.push(candidate);
        }
      }
    }

    return Array.from(new Set(facts));
  }

  /**
   * Local storage helpers for rapid recovery across reloads & sessions
   */
  public static getActiveConversationId(userEmail: string): string {
    const key = `lisa_active_conv_${userEmail || "guest"}`;
    let id = localStorage.getItem(key);
    if (!id) {
      id = "conv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      localStorage.setItem(key, id);
    }
    return id;
  }

  public static setActiveConversationId(userEmail: string, conversationId: string): void {
    const key = `lisa_active_conv_${userEmail || "guest"}`;
    localStorage.setItem(key, conversationId);
  }

  public static getActivePersona(userEmail: string): PersonaConfig {
    try {
      const saved = localStorage.getItem(`lisa_active_persona_${userEmail || "guest"}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PERSONAS.default;
  }

  public static setActivePersona(userEmail: string, persona: PersonaConfig): void {
    try {
      localStorage.setItem(`lisa_active_persona_${userEmail || "guest"}`, JSON.stringify(persona));
    } catch (e) {}
  }

  public static saveSessionSnapshot(snapshot: SessionSnapshot, userEmail: string): void {
    try {
      localStorage.setItem(`lisa_session_snapshot_${userEmail || "guest"}`, JSON.stringify(snapshot));
    } catch (e) {
      console.warn("[ContextBuilder] Snapshot write error:", e);
    }
  }

  public static loadSessionSnapshot(userEmail: string): SessionSnapshot | null {
    try {
      const raw = localStorage.getItem(`lisa_session_snapshot_${userEmail || "guest"}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("[ContextBuilder] Snapshot read error:", e);
    }
    return null;
  }

  public static cacheConversationMessages(conversationId: string, messages: any[]): void {
    try {
      localStorage.setItem(`lisa_conv_cache_${conversationId}`, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.warn("[ContextBuilder] Cache write error:", e);
    }
  }

  public static getCachedConversationMessages(conversationId: string): any[] {
    try {
      const raw = localStorage.getItem(`lisa_conv_cache_${conversationId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("[ContextBuilder] Cache read error:", e);
    }
    return [];
  }
}
