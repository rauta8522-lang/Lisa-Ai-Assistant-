import { SafetyEngine, UserAgeTier } from "../safety/SafetyEngine";
import { PersonaConfig } from "../memory/types";
import { analytics } from "../../services/analyticsService";
import { auth } from "../../config/firebase";
import { getLisaPreferredVoice, UserVoiceContext } from "../../utils/voiceUtils";

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

export interface GreetingUserContext extends UserVoiceContext {
  uid?: string;
  email?: string;
  name?: string;
}

export interface GreetingChatMessage {
  sender: string;
  text: string;
}

export interface GreetingOptions {
  currentUser?: GreetingUserContext | null;
  timePeriod?: TimePeriod;
  isResumed?: boolean;
  activePersona?: PersonaConfig | null;
  language?: "hinglish" | "english";
  userAgeTier?: UserAgeTier;
  messages?: GreetingChatMessage[];
}

export interface TriggerGreetingOptions {
  currentUser?: GreetingUserContext | null;
  activeConversationId?: string;
  isResumed?: boolean;
  isNewSession?: boolean;
  isNewConversation?: boolean;
  force?: boolean;
  activePersona?: PersonaConfig | null;
  userAgeTier?: UserAgeTier;
  messages?: GreetingChatMessage[];
  onGreetingDelivered?: (greetingText: string) => void;
  handleLisaSpeak: (phrase: string) => Promise<void>;
}

export class GreetingEngine {
  private static isGreetingInProgress = false;
  private static lastSpokenGreeting = "";
  private static lastGreetingTime = 0;
  private static MIN_COOLDOWN_MS = 45000; // 45-second cooldown for accidental re-triggers

  /**
   * Resets throttle and cooldown trackers (used in tests or manual reset).
   */
  public static resetForTesting(): void {
    this.isGreetingInProgress = false;
    this.lastSpokenGreeting = "";
    this.lastGreetingTime = 0;
  }

  /**
   * Determine the user's local time period dynamically based on 24-hour clock.
   * Morning: 05:00 - 11:59
   * Afternoon: 12:00 - 16:59
   * Evening: 17:00 - 20:59
   * Night: 21:00 - 04:59
   */
  public static getTimePeriod(date: Date = new Date()): TimePeriod {
    try {
      const hours = date.getHours();
      if (hours >= 5 && hours < 12) {
        return "morning";
      }
      if (hours >= 12 && hours < 17) {
        return "afternoon";
      }
      if (hours >= 17 && hours < 21) {
        return "evening";
      }
      return "night";
    } catch {
      return "morning";
    }
  }

  /**
   * Resolves the user's display name adhering to strict priority:
   * 1. Explicit user profile name
   * 2. Explicitly remembered preferred name
   * 3. Authenticated account display name
   * 4. No name if unavailable (never guess, never use "User" placeholder)
   */
  public static resolveUserName(currentUser?: GreetingUserContext | null): string | null {
    if (!currentUser) return null;

    const isInvalid = (name?: string | null): boolean => {
      if (!name) return true;
      const trimmed = name.trim();
      if (!trimmed) return true;
      const lower = trimmed.toLowerCase();
      return (
        lower === "user" ||
        lower === "lisa user" ||
        lower === "unknown" ||
        lower === "null" ||
        lower === "undefined" ||
        lower === "friend" ||
        lower.startsWith("guest")
      );
    };

    // 1. Explicit user profile name
    if (currentUser.email && typeof localStorage !== "undefined") {
      const savedProfileName = localStorage.getItem(`lisa_profile_name_${currentUser.email.toLowerCase()}`);
      if (savedProfileName && !isInvalid(savedProfileName)) {
        return this.cleanDisplayName(savedProfileName);
      }
    }

    // 2. Explicitly remembered preferred name
    if (currentUser.uid && typeof localStorage !== "undefined") {
      const prefName = localStorage.getItem(`lisa_preferred_name_${currentUser.uid}`);
      if (prefName && !isInvalid(prefName)) {
        return this.cleanDisplayName(prefName);
      }
    }

    // 3. Authenticated account display name
    if (currentUser.name && !isInvalid(currentUser.name)) {
      return this.cleanDisplayName(currentUser.name);
    }
    const authUser = auth.currentUser;
    if (authUser?.displayName && !isInvalid(authUser.displayName)) {
      return this.cleanDisplayName(authUser.displayName);
    }

    return null;
  }

  private static cleanDisplayName(raw: string): string {
    const trimmed = raw.trim();
    // Return first name if multi-word (e.g. "Anil Raut" -> "Anil")
    const parts = trimmed.split(/\s+/);
    return parts[0] || trimmed;
  }

  /**
   * Detects the user's natural conversational language.
   * Adheres strictly to the requirement:
   * - If user's conversation is Hindi/Hinglish -> Hindi/Hinglish.
   * - If user's conversation is English -> English.
   * - If user has not spoken yet -> Lisa's existing default Hinglish personality.
   * - NEVER forces English based on browser locale.
   */
  public static detectUserLanguage(options?: {
    messages?: GreetingChatMessage[];
  }): "hinglish" | "english" {
    // 1. Explicit user language setting
    try {
      if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("lisa_preferred_language");
        if (saved === "english") return "english";
        if (saved === "hinglish" || saved === "hindi") return "hinglish";
      }
    } catch {}

    // 2. Conversation-aware language detection from previous user messages
    if (options?.messages && options.messages.length > 0) {
      const userTexts = options.messages
        .filter((m) => m.sender === "user")
        .map((m) => m.text.toLowerCase())
        .slice(-10);

      if (userTexts.length > 0) {
        const hindiMarkers = [
          "kaise", "kya", "hai", "hain", "ho", "karo", "kar", "batao", "bolo", "yaar",
          "bhai", "mera", "meri", "mere", "aap", "tum", "hum", "main", "nahi", "nhi",
          "haan", "theek", "thik", "accha", "acha", "suno", "sun", "dekh", "dekho",
          "chalo", "chal", "raha", "rahi", "rahe", "hoga", "hogi", "karna", "krna",
          "scene", "chahiye", "din", "baat", "kaam", "madad", "waala", "wali", "wale",
          "namaste", "shukriya", "dost", "kuch"
        ];

        let hindiWordCount = 0;
        let totalWords = 0;

        for (const text of userTexts) {
          const words = text.split(/\s+/).filter(Boolean);
          totalWords += words.length;
          for (const w of words) {
            const clean = w.replace(/[^a-z]/g, "");
            if (hindiMarkers.includes(clean)) {
              hindiWordCount++;
            }
          }
        }

        if (hindiWordCount > 0) {
          return "hinglish";
        }

        // If user has written substantial English with zero Hindi markers
        if (totalWords >= 6 && hindiWordCount === 0) {
          return "english";
        }
      }
    }

    // 3. Default: Lisa's natural Hinglish conversational configuration
    return "hinglish";
  }

  /**
   * Generates a natural, time-aware greeting adapting to time, name, session state, and persona.
   */
  public static generateGreeting(options: GreetingOptions): string {
    const timePeriod = options.timePeriod || this.getTimePeriod();
    const userName = this.resolveUserName(options.currentUser);
    const persona = options.activePersona;
    const isResumed = !!options.isResumed;
    const language = options.language || this.detectUserLanguage({ messages: options.messages });

    let greetingText = "";

    // 1. Specialized Persona Adaptation
    if (persona && persona.id && persona.id !== "default") {
      const personaGreeting = this.getPersonaGreeting(persona.id, timePeriod, userName, isResumed, language);
      if (personaGreeting) {
        greetingText = personaGreeting;
      }
    }

    // 2. Resumed Conversation Greeting (if not handled by persona)
    if (!greetingText && isResumed) {
      greetingText = this.getResumedGreeting(userName, language);
    }

    // 3. Fresh Activation Time-Aware Greeting (if not handled by persona or resumed)
    if (!greetingText) {
      greetingText = this.getTimeAwareGreeting(timePeriod, userName, language);
    }

    // 4. Safety Engine Verification
    const safetyCheck = SafetyEngine.evaluateContent(greetingText, options.userAgeTier || "unknown");
    if (!safetyCheck.isSafe) {
      return userName
        ? `Hello ${userName}! How can I help you today?`
        : "Hello! How can I help you today?";
    }

    return greetingText;
  }

  private static getTimeAwareGreeting(timePeriod: TimePeriod, userName: string | null, language: "hinglish" | "english"): string {
    if (language === "english") {
      switch (timePeriod) {
        case "morning":
          return userName
            ? this.pickRandom([
                `Good morning, ${userName}! How are you doing today? What are we working on?`,
                `Good morning, ${userName}! I'm ready — tell me how I can help you today.`,
                `A very good morning, ${userName}! I hope your day is starting well. What can I do for you?`,
                `Good morning, ${userName}! Let's make today productive. Where should we begin?`
              ])
            : this.pickRandom([
                "Good morning! How are you doing today? What are we working on?",
                "Good morning! I'm ready — tell me how I can assist you today.",
                "A very good morning! I hope your day is starting well. How can I help?"
              ]);
        case "afternoon":
          return userName
            ? this.pickRandom([
                `Good afternoon, ${userName}! How has your day been going?`,
                `Good afternoon, ${userName}! I'm all set, what would you like to tackle next?`,
                `Hello ${userName}, good afternoon! What's on the agenda for today?`
              ])
            : this.pickRandom([
                "Good afternoon! How has your day been going so far?",
                "Good afternoon! I'm ready, what should we work on next?",
                "Hello, good afternoon! How can I assist you right now?"
              ]);
        case "evening":
          return userName
            ? this.pickRandom([
                `Good evening, ${userName}! Welcome back. How was your day?`,
                `Good evening, ${userName}! It must have been a busy day. What can we look at tonight?`,
                `Good evening, ${userName}! Unwind for a moment and tell me what you'd like to discuss.`
              ])
            : this.pickRandom([
                "Good evening! Welcome back. How did your day go?",
                "Good evening! Ready to wrap up today or work on something new?",
                "Good evening! How can I assist you tonight?"
              ]);
        case "night":
          return userName
            ? this.pickRandom([
                `Good night, ${userName}... it's getting quite late. Is there something important we should discuss?`,
                `Hey ${userName}, still active tonight? Let me know how I can help.`,
                `Working late tonight, ${userName}? I'm right here with you, tell me what you need.`
              ])
            : this.pickRandom([
                "Good night... it's getting quite late. Is there something important we should discuss?",
                "Hey, still active late tonight? Let me know how I can help.",
                "Working late tonight? I'm right here, tell me what you need."
              ]);
      }
    }

    // Default: Lisa's signature warm, human-like Hinglish personality
    switch (timePeriod) {
      case "morning":
        return userName
          ? this.pickRandom([
              `Good morning, ${userName}! Kaise ho? Aaj kya karna hai?`,
              `Good morning, ${userName}! Kaise ho? Batao, aaj kya scene hai?`,
              `Good morning, ${userName}! Main ready hoon — batao, aaj kya karna hai.`,
              `A very good morning, ${userName}! Umeed hai din ki shuruat badhiya hui. Batao, main kya help karoon?`,
              `Good morning, ${userName}! Aaj ka din mast aur productive banate hain. Bolo, kahan se shuru karein?`
            ])
          : this.pickRandom([
              "Good morning! Kaise ho? Batao, aaj kya karna hai.",
              "Good morning! Kaise ho? Batao, aaj kya scene hai?",
              "Good morning! Main ready hoon — batao, aaj kis cheez pe kaam karein?",
              "A very good morning! Umeed hai din ki shuruat badhiya hui. Batao, main kya help karoon?"
            ]);

      case "afternoon":
        return userName
          ? this.pickRandom([
              `Good afternoon, ${userName}! Kaise chal raha hai aaj ka din?`,
              `Good afternoon, ${userName}! Lunch break ho gaya? Batao, ab kya task sambhalna hai.`,
              `Hello ${userName}, good afternoon! Main bilkul active hoon, batao kya plan hai.`,
              `Good afternoon, ${userName}! Batao, aaj main kya madad kar sakti hoon?`
            ])
          : this.pickRandom([
              "Good afternoon! Kaise chal raha hai aaj ka din?",
              "Good afternoon! Main bilkul active hoon, batao ab kya task sambhalna hai.",
              "Hello, good afternoon! Batao, aaj main kya help kar sakti hoon."
            ]);

      case "evening":
        return userName
          ? this.pickRandom([
              `Good evening, ${userName}! Welcome back. Din kaisa raha?`,
              `Good evening, ${userName}! Aaj ka din kaafi busy raha hoga. Batao, ab kya karein?`,
              `Shaam ho gayi, ${userName}! Thoda relax karo aur batao kya discuss karna hai.`,
              `Good evening, ${userName}! Kaam kaisa chal raha hai? Batao aaj ka kya scene hai.`
            ])
          : this.pickRandom([
              "Good evening! Welcome back. Din kaisa raha?",
              "Good evening! Aaj ka din kaisa beeta? Batao, ab kya karein?",
              "Shaam ho gayi! Thoda relax karo aur batao, kya chal raha hai."
            ]);

      case "night":
        return userName
          ? this.pickRandom([
              `Good night, ${userName}... kaafi late ho gaya hai. Kuch important baat karni hai?`,
              `Hey ${userName}, itni raat ko bhi active? Batao, main kya madad karoon.`,
              `Late night work chal raha hai, ${userName}? Main yahin hoon, bolo kya help chahiye.`,
              `Good night, ${userName}... itni der tak kaam? Batao, main jaldi se kuch help karoon?`
            ])
          : this.pickRandom([
              "Good night... kaafi late ho gaya hai. Kuch important baat karni hai?",
              "Hey, itni raat ko bhi active? Batao, main kya madad karoon.",
              "Late night session chal raha hai? Main yahin hoon, bolo kya help chahiye."
            ]);
    }
  }

  private static getResumedGreeting(userName: string | null, language: "hinglish" | "english"): string {
    if (language === "english") {
      return userName
        ? this.pickRandom([
            `Welcome back, ${userName}. Let's pick right back up where we left off.`,
            `Welcome back, ${userName}! We'll continue our previous conversation smoothly.`,
            `Good to see you again, ${userName}. Ready to continue where we paused?`
          ])
        : this.pickRandom([
            "Welcome back. Let's pick right back up where we left off.",
            "Welcome back! We'll continue our previous conversation smoothly.",
            "Good to see you again. Ready to continue where we paused?"
          ]);
    }

    return userName
      ? this.pickRandom([
          `Welcome back, ${userName}. Hum wahi conversation continue karte hain.`,
          `Welcome back, ${userName}! Chalo, wahin se continue karte hain jahan choda tha.`,
          `Welcome back, ${userName}! Context ready hai, chalo continue karte hain.`,
          `Welcome back, ${userName}! Main yahin hoon, chalo aage continue karte hain.`
        ])
      : this.pickRandom([
          "Welcome back! Hum wahi conversation continue karte hain.",
          "Welcome back! Chalo, wahin se continue karte hain jahan choda tha.",
          "Welcome back! Context ready hai, chalo continue karte hain."
        ]);
  }

  private static getPersonaGreeting(
    personaId: string,
    timePeriod: TimePeriod,
    userName: string | null,
    isResumed: boolean,
    language: "hinglish" | "english"
  ): string | null {
    const id = personaId.toLowerCase();

    // Healthcare / Nurse
    if (id === "nurse") {
      if (language === "english") {
        return isResumed
          ? (userName ? `Welcome back, ${userName}. Let's continue your health log.` : "Welcome back. Let's continue your health log.")
          : (userName ? `Good ${timePeriod}, ${userName}! How are you feeling right now?` : `Good ${timePeriod}! How are you feeling right now?`);
      }
      return isResumed
        ? (userName ? `Welcome back, ${userName}. Hum aapka health log wahin se continue karte hain.` : "Welcome back. Hum aapka health log wahin se continue karte hain.")
        : (userName ? `Good ${timePeriod}, ${userName}! Kaise ho? Aaj health-related kuch discuss karna hai?` : `Good ${timePeriod}! Kaise ho? Aaj health-related kuch discuss karna hai?`);
    }

    // Education / Teacher
    if (id === "teacher" || id === "professor") {
      if (language === "english") {
        return isResumed
          ? (userName ? `Welcome back, ${userName}! Let's continue our lesson from where we paused.` : "Welcome back! Let's continue our lesson from where we paused.")
          : (userName ? `Good ${timePeriod}, ${userName}! Ready for today's learning session?` : `Good ${timePeriod}! Ready for today's learning session?`);
      }
      return isResumed
        ? (userName ? `Welcome back, ${userName}! Lesson wahin se continue karte hain jahan pause kiya tha.` : "Welcome back! Lesson wahin se continue karte hain jahan pause kiya tha.")
        : (userName ? `Good ${timePeriod}, ${userName}! Ready ho aaj ke learning session ke liye?` : `Good ${timePeriod}! Ready ho aaj ke learning session ke liye?`);
    }

    // Coding Mentor
    if (id === "coding_mentor") {
      if (language === "english") {
        return isResumed
          ? (userName ? `Welcome back, ${userName}! Code context is ready, let's keep building.` : "Welcome back! Code context is ready, let's keep building.")
          : (userName ? `Good ${timePeriod}, ${userName}! Ready to write some clean code today?` : `Good ${timePeriod}! Ready to write some clean code today?`);
      }
      return isResumed
        ? (userName ? `Welcome back, ${userName}! Code context ready hai, chalo aage build karte hain.` : "Welcome back! Code context ready hai, chalo aage build karte hain.")
        : (userName ? `Good ${timePeriod}, ${userName}! Ready ho aaj clean code likhne ke liye?` : `Good ${timePeriod}! Ready ho aaj clean code likhne ke liye?`);
    }

    // Wildlife Guide
    if (id === "zoo_wildlife_guide" || id === "wildlife_narrator") {
      if (language === "english") {
        return isResumed
          ? (userName ? `Welcome back, ${userName}! Ready to continue our wildlife journey?` : "Welcome back! Ready to continue our wildlife journey?")
          : (userName ? `Good ${timePeriod}, ${userName}! Ready for today's wildlife adventure?` : `Good ${timePeriod}! Ready for today's wildlife adventure?`);
      }
      return isResumed
        ? (userName ? `Welcome back, ${userName}! Chalo wildlife journey wahin se continue karte hain.` : "Welcome back! Chalo wildlife journey wahin se continue karte hain.")
        : (userName ? `Good ${timePeriod}, ${userName}! Ready ho aaj ke wildlife adventure ke liye?` : `Good ${timePeriod}! Ready ho aaj ke wildlife adventure ke liye?`);
    }

    // Fitness Coach
    if (id === "fitness_coach") {
      if (language === "english") {
        return isResumed
          ? (userName ? `Welcome back, ${userName}! Let's keep that streak alive, what's next?` : "Welcome back! Let's keep that streak alive, what's next?")
          : (userName ? `Good ${timePeriod}, ${userName}! Energy is high today, ready for the workout?` : `Good ${timePeriod}! Energy is high today, ready for the workout?`);
      }
      return isResumed
        ? (userName ? `Welcome back, ${userName}! Fitness streak continue karte hain, bolo agla set?` : "Welcome back! Fitness streak continue karte hain, bolo agla set?")
        : (userName ? `Good ${timePeriod}, ${userName}! Aaj fitness energy high rakhni hai, ready ho?` : `Good ${timePeriod}! Aaj fitness energy high rakhni hai, ready ho?`);
    }

    return null;
  }

  /**
   * Evaluates if a greeting is eligible to be triggered, preventing spam across rerenders,
   * reconnects, and panel switches.
   */
  public static isGreetingEligible(options: {
    conversationId?: string;
    isNewSession?: boolean;
    isNewConversation?: boolean;
    force?: boolean;
  }): { eligible: boolean; reason?: string } {
    if (this.isGreetingInProgress) {
      return { eligible: false, reason: "greeting_in_progress" };
    }

    const now = Date.now();
    const timeSinceLastSpoken = now - this.lastGreetingTime;

    // Explicit force or new conversation action
    if (options.force || options.isNewConversation) {
      if (timeSinceLastSpoken < 5000) {
        return { eligible: false, reason: "rapid_force_throttled" };
      }
      return { eligible: true };
    }

    // Check session-level storage to survive React rerenders and remounts
    try {
      const sessionGreeted = sessionStorage.getItem("lisa_has_greeted_session");
      const lastSessionGreetingTime = Number(sessionStorage.getItem("lisa_last_greeting_timestamp") || 0);

      // If already greeted in this browser tab session within recent window
      if (sessionGreeted === "true") {
        const timeSinceSessionGreeting = now - lastSessionGreetingTime;
        if (timeSinceSessionGreeting < this.MIN_COOLDOWN_MS) {
          return { eligible: false, reason: "session_already_greeted_cooldown" };
        }
      }
    } catch {}

    // In-memory cooldown check
    if (timeSinceLastSpoken < this.MIN_COOLDOWN_MS) {
      return { eligible: false, reason: "in_memory_cooldown" };
    }

    return { eligible: true };
  }

  /**
   * Main evaluation and trigger pipeline for Lisa's Smart Greeting.
   * Delivers the greeting through Lisa's EXACT response and voice pipeline.
   */
  public static async evaluateAndTriggerGreeting(options: TriggerGreetingOptions): Promise<string | null> {
    const timePeriod = this.getTimePeriod();
    const persona = options.activePersona;
    const isResumed = !!options.isResumed;
    const convId = options.activeConversationId || "unknown";

    // 1. Eligibility Check
    const eligibility = this.isGreetingEligible({
      conversationId: convId,
      isNewSession: options.isNewSession,
      isNewConversation: options.isNewConversation,
      force: options.force
    });

    if (!eligibility.eligible) {
      analytics.track("greeting_skipped", {
        reason: eligibility.reason,
        timePeriod,
        isResumed,
        conversationId: convId,
        persona: persona?.id || "default"
      });
      return null;
    }

    this.isGreetingInProgress = true;

    try {
      // 2. Generate Greeting Phrase
      const greetingText = this.generateGreeting({
        currentUser: options.currentUser,
        timePeriod,
        isResumed,
        activePersona: persona,
        userAgeTier: options.userAgeTier,
        messages: options.messages
      });

      if (!greetingText) {
        this.isGreetingInProgress = false;
        return null;
      }

      // Avoid repeating exact same phrase twice back-to-back
      if (greetingText === this.lastSpokenGreeting && Date.now() - this.lastGreetingTime < this.MIN_COOLDOWN_MS) {
        this.isGreetingInProgress = false;
        return null;
      }

      // 3. Track Generation
      analytics.track("greeting_generated", {
        timePeriod,
        hasName: !!this.resolveUserName(options.currentUser),
        persona: persona?.id || "default",
        isResumed,
        conversationId: convId
      });

      // 4. Update session & in-memory flags
      const now = Date.now();
      this.lastGreetingTime = now;
      this.lastSpokenGreeting = greetingText;
      try {
        sessionStorage.setItem("lisa_has_greeted_session", "true");
        sessionStorage.setItem("lisa_last_greeting_timestamp", String(now));
        sessionStorage.setItem("lisa_last_greeting_conv", convId);
      } catch {}

      // 5. Integrate as Lisa's first spoken response in the conversation UI & history
      if (options.onGreetingDelivered) {
        try {
          options.onGreetingDelivered(greetingText);
        } catch (uiErr) {
          console.warn("[LISA GREETING] Non-fatal UI append warning:", uiErr);
        }
      }

      // 6. Speak Greeting using Lisa's exact existing voice pipeline
      await options.handleLisaSpeak(greetingText);

      // 7. Track Playback
      analytics.track("greeting_played", {
        timePeriod,
        hasName: !!this.resolveUserName(options.currentUser),
        persona: persona?.id || "default",
        isResumed,
        conversationId: convId,
        success: true
      });

      return greetingText;
    } catch (err: any) {
      console.warn("[LISA GREETING] Non-fatal error during greeting generation/playback:", err);
      analytics.track("greeting_skipped", {
        reason: "exception_in_playback",
        error: err?.message || String(err),
        timePeriod,
        isResumed
      });
      return null;
    } finally {
      this.isGreetingInProgress = false;
    }
  }

  /**
   * Helper specifically for when a user clicks "New Chat"
   */
  public static async triggerNewConversationGreeting(options: {
    currentUser?: GreetingUserContext | null;
    conversationId: string;
    activePersona?: PersonaConfig | null;
    userAgeTier?: UserAgeTier;
    messages?: GreetingChatMessage[];
    onGreetingDelivered?: (greetingText: string) => void;
    handleLisaSpeak: (phrase: string) => Promise<void>;
  }): Promise<string | null> {
    return this.evaluateAndTriggerGreeting({
      ...options,
      activeConversationId: options.conversationId,
      isResumed: false,
      isNewConversation: true,
      force: true
    });
  }

  private static pickRandom(items: string[]): string {
    if (!items || items.length === 0) return "";
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }
}
