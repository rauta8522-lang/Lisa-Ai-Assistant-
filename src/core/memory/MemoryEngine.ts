import { LongTermMemory, MemoryMessage, ConversationSession, ResolvedDateRange, RetrievalIntentResult, MemoryIntentCategory } from "./types";
import { DateRangeResolver } from "./DateRangeResolver";

/**
 * MemoryEngine is the core AI-driven component for maintaining Lisa's permanent memory layers.
 * It handles summarization, topic indexing, durable memory extraction, and precision temporal retrieval.
 */
export class MemoryEngine {
  /**
   * Deterministic rule-based extraction of explicit facts, test codes, user directives, goals, and project details.
   */
  public static extractExplicitFacts(text: string): Array<{
    content: string;
    fact: string;
    category: string;
    importance: "low" | "medium" | "high" | "critical";
  }> {
    if (!text || typeof text !== "string" || text.trim().length < 3) return [];
    const facts: Array<{ content: string; fact: string; category: string; importance: "low" | "medium" | "high" | "critical" }> = [];
    const trimmed = text.trim();

    // Helper to clean trailing punctuation from extracted values
    const cleanPunct = (s: string) => s.replace(/[.,;:!?'"]+$/, "").trim();

    // 1. Explicit Memory Directives (e.g., "Lisa, is baat ko yaad rakhna: ...", "yaad rakhna: ...", "remember this: ...", "dhyan rakhna: ...")
    const explicitDirectiveMatch = trimmed.match(/(?:(?:lisa\s*[,:]?\s*)?(?:is\s+baat\s+ko\s+)?(?:yaad\s+rakhna|yaad\s+rakho|remember\s+(?:this|that)?|note\s+(?:this\s+)?down|dhyan\s+rakhna|save\s+this|kabhi\s+bhoolna\s+mat))\s*[:,\-]?\s*(.+)/i);
    if (explicitDirectiveMatch && explicitDirectiveMatch[1]) {
      const captured = cleanPunct(explicitDirectiveMatch[1]);
      if (captured.length >= 4) {
        facts.push({
          content: captured,
          fact: captured,
          category: "instruction",
          importance: "critical"
        });
      }
    }

    // 2. Memory Test Codes / Alphanumeric IDs / Keys (e.g. "Memory test code: TIGER-8472-FIREBASE", "Code: ABC-123", "Test code: XYZ")
    const codeMatch = trimmed.match(/(?:memory\s+test\s+code|test\s+code|test\s+key|code|token|key|secret)\s*[:=]\s*([A-Za-z0-9_\-\.]{3,50})/i);
    if (codeMatch && codeMatch[1]) {
      const codeVal = cleanPunct(codeMatch[1]);
      if (codeVal.length >= 3) {
        facts.push({
          content: `Memory test code: ${codeVal}`,
          fact: `Memory test code: ${codeVal}`,
          category: "instruction",
          importance: "critical"
        });
      }
    }

    // 3. Standalone uppercase hyphenated test codes (e.g. "TIGER-8472-FIREBASE", "ABC-1234-XYZ")
    const rawPatternCodes = trimmed.match(/\b([A-Z0-9]{2,15}-[A-Z0-9]{2,15}(?:-[A-Z0-9]{2,15})+)\b/g);
    if (rawPatternCodes) {
      for (const rawCode of rawPatternCodes) {
        const cleanCode = cleanPunct(rawCode);
        if (!facts.some(f => f.content.includes(cleanCode))) {
          facts.push({
            content: `Memory test code: ${cleanCode}`,
            fact: `Memory test code: ${cleanCode}`,
            category: "instruction",
            importance: "critical"
          });
        }
      }
    }

    // 4. Project statements (e.g., "main Lisa AI Assistant project par kaam kar raha hoon", "working on Lisa AI Assistant project", "humara project Lisa AI hai")
    const projectMatch = trimmed.match(/(?:main|mai|hum|we|i am|i'm|we are|apna|humara|mera)\s+([a-zA-Z0-9\s_\-\.]+?)\s+(?:project\s+par\s+kaam\s+kar\s+(?:rahe|raha|rahi)\s+(?:hain|hoon|hu|the|thi)?|project\s+pe\s+kaam\s+kar\s+(?:rahe|raha|rahi)\s+(?:hain|hoon|hu|the|thi)?|project\s+par\s+(?:hain|hoon|hu|the|thi)?|project\s+pe\s+(?:hain|hoon|hu|the|thi)?|working\s+on\s+(?:the\s+)?([a-zA-Z0-9\s_\-\.]+?)\s+project)/i) ||
                         trimmed.match(/(?:project\s+name|project|mera\s+project|humara\s+project)\s*[:=]?\s*([a-zA-Z0-9\s_\-\.]{2,50})/i);
    if (projectMatch) {
      const projName = cleanPunct(projectMatch[1] || projectMatch[2] || "");
      if (projName.length >= 2 && projName.length <= 60 && !["working", "doing", "this", "that"].includes(projName.toLowerCase())) {
        facts.push({
          content: `User is working on ${projName} project`,
          fact: `User is working on ${projName} project`,
          category: "project",
          importance: "critical"
        });
      }
    }

    // 5. Goals & Objectives (e.g. "Humara goal hai ki meri purani conversations kabhi na bhulein...", "my goal is...")
    const goalMatch = trimmed.match(/(?:humara\s+goal|mera\s+goal|our\s+goal|my\s+goal|goal|aim|target|maqsad)\s*(?:hai|is)?\s*[:=]?\s*(?:ki\s+)?(.+?)(?:\.|$)/i);
    if (goalMatch && goalMatch[1]) {
      const goalText = cleanPunct(goalMatch[1]);
      if (goalText.length >= 6) {
        facts.push({
          content: `Project goal: ${goalText}`,
          fact: `Project goal: ${goalText}`,
          category: "goal",
          importance: "high"
        });
      }
    }

    // 6. User Name / Identity (e.g. "mera naam Rahul hai", "my name is Sarah")
    const nameMatch = trimmed.match(/(?:mera naam|my name is|i am|i'm)\s+([a-zA-Z\s]{2,30})(?:\s+hai|\s+hoon|$|\.)/i);
    if (nameMatch && nameMatch[1]) {
      const nameVal = cleanPunct(nameMatch[1]);
      if (!["working", "doing", "testing", "here", "fine", "good", "happy", "sad", "stressed"].includes(nameVal.toLowerCase())) {
        facts.push({
          content: `User name: ${nameVal}`,
          fact: `User name: ${nameVal}`,
          category: "profile",
          importance: "critical"
        });
      }
    }

    // 7. Checkpoint / Milestone stopping points (e.g., "we stopped our Firebase discussion at Firestore indexing")
    const stoppedAtMatch = trimmed.match(/(?:humne|hum|we)\s+(.+?)\s+(?:discussion|baat)?\s*(?:me|par|at)?\s*(?:kaha tak|stop|roka|pause)\s*(.+)?/i) ||
                           trimmed.match(/(?:stopped|left off)\s+(?:our|at|the)\s+(.+)/i);
    if (stoppedAtMatch && (stoppedAtMatch[1] || stoppedAtMatch[2])) {
      facts.push({
        content: `Conversation milestone/status: ${trimmed}`,
        fact: `Conversation milestone/status: ${trimmed}`,
        category: "project",
        importance: "high"
      });
    }

    return facts;
  }

  /**
   * Extracts search tokens (codes, key nouns, identifiers) from query for database search.
   */
  public static extractSearchTokens(query: string): string[] {
    if (!query) return [];
    const tokens: Set<string> = new Set();
    const clean = query.trim();

    // 1. Hyphenated / Alphanumeric codes (e.g., TIGER-8472-FIREBASE)
    const codeMatches = clean.match(/[A-Za-z0-9]+-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g);
    if (codeMatches) {
      codeMatches.forEach(c => tokens.add(c.toLowerCase()));
    }

    // 2. Quoted terms
    const quoted = clean.match(/["']([^"']+)["']/g);
    if (quoted) {
      quoted.forEach(q => tokens.add(q.replace(/["']/g, "").trim().toLowerCase()));
    }

    // 3. Meaningful words (excluding conversational stop words and generic question markers)
    const stopWords = new Set([
      "lisa", "aur", "kya", "tha", "thi", "the", "hai", "hain", "hoon", "hu", "hum", "humne",
      "maine", "tumne", "aapne", "mera", "meri", "mere", "tera", "teri", "tere", "apna", "apni", "apne",
      "humara", "humari", "tumhara", "tumhari", "unka", "unki", "iska", "iski", "uske", "kiska", "kiski",
      "kis", "kaun", "kaunsa", "kaunsi", "kaha", "kahan", "kab", "kyu", "kyun", "kaise", "kaisa", "kaisi",
      "what", "was", "my", "our", "the", "and", "is", "were", "with", "this", "that", "how", "who", "which",
      "batao", "bolo", "tell", "show", "me", "you", "par", "pe", "se", "ko", "kar", "rahe", "raha", "rahi",
      "karo", "karna", "baat", "charcha", "discuss", "discussion", "pehle", "pahle", "before",
      "after", "session", "chat", "conversation"
    ]);

    const words = clean.replace(/[^\w\s\-]/g, " ").split(/\s+/);
    for (const w of words) {
      const lw = w.toLowerCase().trim();
      if (lw.length >= 3 && !stopWords.has(lw)) {
        tokens.add(lw);
      }
    }

    return Array.from(tokens);
  }

  /**
   * Determines the exact multi-class retrieval intent from a user query, resolving dates, topics, and combinations.
   */
  public static detectRetrievalIntent(
    query: string,
    userTimezone: string = DateRangeResolver.DEFAULT_TIMEZONE
  ): RetrievalIntentResult {
    if (!query || typeof query !== "string") {
      return {
        intent: "none",
        category: "NO_MEMORY_REQUIRED",
        requiresHistoricalRetrieval: false
      };
    }

    const text = query.toLowerCase().trim();
    const resolvedDate = DateRangeResolver.resolveDateRange(query, userTimezone);
    const extractedTopic = DateRangeResolver.extractTopicFromQuery(query);
    const searchTokens = this.extractSearchTokens(query);

    // 1. Check for Combined Date + Topic (e.g. "Kal Firebase par kya baat hui thi?")
    if (resolvedDate && extractedTopic && extractedTopic.length > 2) {
      return {
        intent: "date_and_topic",
        category: "MIXED",
        targetTopic: extractedTopic,
        targetDate: resolvedDate.label,
        dateRange: resolvedDate,
        semanticQuery: query,
        keywords: searchTokens,
        requiresHistoricalRetrieval: true
      };
    }

    // 2. Pure Date-Based Query (e.g. "Kal humne kya baat ki thi?", "15 August wali conversation kholo", "yesterday's chat")
    if (resolvedDate) {
      return {
        intent: "date_retrieval",
        category: "DATE_BASED_HISTORY",
        targetDate: resolvedDate.label,
        dateRange: resolvedDate,
        semanticQuery: query,
        keywords: searchTokens,
        requiresHistoricalRetrieval: true
      };
    }

    // 3. Historical conversation queries across reloads or prior sessions
    // (e.g. "reload se pehle kya baat ho rahi thi", "last conversation", "earlier we discussed", "pehle kya decide hua")
    const isHistoricalQuery =
      text.includes("reload se pehle") ||
      text.includes("reload ke pehle") ||
      text.includes("before reload") ||
      text.includes("reload se pahle") ||
      text.includes("pichli conversation") ||
      text.includes("pichle chat") ||
      text.includes("previous conversation") ||
      text.includes("previous chat") ||
      text.includes("earlier today") ||
      text.includes("pehle humne") ||
      text.includes("pehle hum") ||
      text.includes("last time") ||
      text.includes("kya baat ho rahi thi") ||
      text.includes("kaha tak pahuche the") ||
      text.includes("kahan tak pahuche the") ||
      text.includes("stopped our") ||
      text.includes("left off");

    // 4. Long-term Fact or Code queries (e.g. "mera memory test code kya tha", "what was my project", "who am I", "mera naam kya hai", "what was my Mars Colony project")
    const isFactOrCodeQuery =
      text.includes("test code") ||
      text.includes("memory code") ||
      text.includes("wo code kya tha") ||
      text.includes("code kya tha") ||
      text.includes("what was my") ||
      text.includes("what is my") ||
      text.includes("mera project") ||
      text.includes("meri project") ||
      text.includes("project ka naam") ||
      text.includes("kis project par") ||
      text.includes("which project") ||
      text.includes("what project") ||
      text.includes("mera naam") ||
      text.includes("who am i") ||
      text.includes("yaad hai") ||
      text.includes("remember") ||
      text.includes("told you") ||
      text.includes("bataya tha") ||
      text.includes("yaad hai kya") ||
      text.includes("kya tha") ||
      text.includes("kya thi");

    // 5. Topic Resume / Discussion Continue (e.g. "Firebase discussion continue karo", "resume where we stopped", "continue the Firebase topic")
    const isTopicResume =
      text.includes("continue") ||
      text.includes("resume") ||
      text.includes("baat kar rahe the") ||
      text.includes("discuss kar rahe the") ||
      text.includes("wali conversation") ||
      text.includes("wala topic") ||
      text.includes("wahi se") ||
      text.includes("where we left");

    if (isHistoricalQuery && isFactOrCodeQuery) {
      return {
        intent: "fact_recall",
        category: "MIXED",
        targetTopic: extractedTopic || "",
        semanticQuery: query,
        keywords: searchTokens,
        requiresHistoricalRetrieval: true
      };
    }

    if (isHistoricalQuery) {
      return {
        intent: "historical_search",
        category: "HISTORICAL_CONVERSATION",
        targetTopic: extractedTopic || "",
        semanticQuery: query,
        keywords: searchTokens,
        requiresHistoricalRetrieval: true
      };
    }

    if (isFactOrCodeQuery) {
      return {
        intent: "fact_recall",
        category: "KNOWN_LONG_TERM_MEMORY",
        targetTopic: extractedTopic || "",
        semanticQuery: query,
        keywords: searchTokens,
        requiresHistoricalRetrieval: true
      };
    }

    if (isTopicResume) {
      return {
        intent: "topic_resume",
        category: "TOPIC_RESUME",
        targetTopic: extractedTopic || query,
        semanticQuery: query,
        keywords: searchTokens,
        requiresHistoricalRetrieval: true
      };
    }

    // Check if query is short / generic chit chat
    const isGeneric =
      text.length < 15 &&
      (text.startsWith("hi") || text.startsWith("hello") || text.startsWith("hey") || text.startsWith("how are you") || text.startsWith("kya haal"));

    if (isGeneric) {
      return {
        intent: "none",
        category: "CURRENT_CONTEXT",
        requiresHistoricalRetrieval: false
      };
    }

    return {
      intent: "none",
      category: "NO_MEMORY_REQUIRED",
      keywords: searchTokens,
      requiresHistoricalRetrieval: searchTokens.length > 2
    };
  }

  /**
   * Formats retrieved memories into an unambiguous context block for Gemini / Live API / DeepSeek.
   * Enforces strict MEMORY_CONFIRMED, MEMORY_PARTIAL, and MEMORY_NOT_FOUND statuses with zero-hallucination rules.
   */
  public static formatMemoryContext(
    relevantConversations: ConversationSession[],
    relevantMessages: MemoryMessage[],
    relevantMemories: LongTermMemory[],
    searchMetadata?: {
      dateRange?: ResolvedDateRange;
      targetTopic?: string;
      intent?: string;
      category?: MemoryIntentCategory;
    }
  ): string {
    const hasMemories = relevantMemories.length > 0;
    const hasConversations = relevantConversations.length > 0;
    const hasMessages = relevantMessages.length > 0;

    const isExplicitHistoricalSearch =
      searchMetadata &&
      (searchMetadata.intent === "date_retrieval" ||
       searchMetadata.intent === "date_and_topic" ||
       searchMetadata.intent === "historical_search" ||
       searchMetadata.intent === "topic_resume" ||
       searchMetadata.intent === "fact_recall");

    if (!hasMemories && !hasConversations && !hasMessages) {
      if (isExplicitHistoricalSearch) {
        let queryDesc = "";
        if (searchMetadata.dateRange && searchMetadata.targetTopic) {
          queryDesc = `for topic "${searchMetadata.targetTopic}" on ${searchMetadata.dateRange.label}`;
        } else if (searchMetadata.dateRange) {
          queryDesc = `for date ${searchMetadata.dateRange.label}`;
        } else if (searchMetadata.targetTopic) {
          queryDesc = `for "${searchMetadata.targetTopic}"`;
        } else {
          queryDesc = "for previous conversations / requested topic";
        }

        return `\n\n<RETRIEVED_MEMORY>\n` +
          `[STATUS: MEMORY_NOT_FOUND]\n` +
          `Query: ${queryDesc}\n` +
          `Source Authority: Verified Database Checked (0 records found)\n\n` +
          `CRITICAL HARD MEMORY-GROUNDING DIRECTIVE:\n` +
          `1. No stored memory record, saved project, test code, or historical conversation was found matching this query in the user's permanent Firestore database.\n` +
          `2. You MUST state clearly, politely, and honestly: "Is memory mein mujhe us baat ka reliable record nahi mil raha, isliye main guess nahi karungi." (or equivalent in Hinglish/English).\n` +
          `3. You are STRICTLY FORBIDDEN from guessing, inventing, assuming, or fabricating any project name, test code, conversation details, or dates.\n` +
          `</RETRIEVED_MEMORY>`;
      }
      return "";
    }

    // Determine Status
    const status = (hasMemories || (hasConversations && hasMessages)) ? "MEMORY_CONFIRMED" : "MEMORY_PARTIAL";
    let memoryBody = `[STATUS: ${status}]\n`;

    // 1. Long-Term Facts, Directives & Test Codes (Source: long_term_memory)
    if (hasMemories) {
      memoryBody += "DURABLE LONG-TERM FACTS & DIRECTIVES (Source: long_term_memory, Authority: CONFIRMED):\n";
      relevantMemories.forEach(m => {
        const factText = m.content || m.fact || "";
        if (factText) {
          memoryBody += `- [ID: ${m.id || "mem"}] ${factText} (Category: ${m.category || "general"}, Importance: ${m.importance || "high"})\n`;
        }
      });
      memoryBody += "\n";
    }

    // 2. Historical Conversation Sessions (Source: conversation)
    if (hasConversations) {
      memoryBody += "ARCHIVED CONVERSATION SESSIONS (Source: conversation, Authority: CONFIRMED):\n";
      relevantConversations.slice(0, 5).forEach(c => {
        const dateStr = c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : (c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "Recent Session");
        memoryBody += `- Conversation ID: ${c.id} | Title: "${c.title || "Previous Chat"}" | Date: ${dateStr}\n`;
        if (c.summary) memoryBody += `  Summary: ${c.summary}\n`;
        if (c.topics && c.topics.length > 0) memoryBody += `  Topics: ${c.topics.join(", ")}\n`;
        if (c.lastMessage) memoryBody += `  Last Message: "${c.lastMessage}"\n`;
      });
      memoryBody += "\n";
    }

    // 3. Relevant Historical Message Transcripts (Source: messages)
    if (hasMessages) {
      memoryBody += "EXACT HISTORICAL MESSAGE TRANSCRIPTS (Source: conversation_messages, Authority: CONFIRMED):\n";
      relevantMessages.slice(0, 25).forEach(m => {
        const date = m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : "";
        const sender = (m.sender || "user").toUpperCase();
        memoryBody += `[${date || "ARCHIVE"}] ${sender}: ${m.text}\n`;
      });
      memoryBody += "\n";
    }

    return `\n\n<RETRIEVED_MEMORY>\n${memoryBody.trim()}\n\n` +
      `CRITICAL MEMORY GROUNDING DIRECTIVE FOR LISA:\n` +
      `1. The information above is the REAL, VERIFIED record from the user's permanent Firestore database.\n` +
      `2. When the user asks about prior conversations, what was discussed before reloading, what project you were working on, or what their test code / memory code is, ALWAYS reference and state these exact facts and codes clearly and confidently.\n` +
      `3. DO NOT claim you do not remember when the answer is present in this <RETRIEVED_MEMORY> block.\n` +
      `4. DO NOT invent or substitute any project, topic, or code that is NOT in this block.\n` +
      `</RETRIEVED_MEMORY>`;
  }
}
