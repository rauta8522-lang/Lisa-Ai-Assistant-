export interface VisualProfile {
  icon: string; // Lucide icon name (e.g. HeartPulse, Rocket, Scale, GraduationCap, Code, Compass, Dumbbell, Sparkles)
  themeColor?: string; // Tailwind color token (e.g. rose, emerald, cyan, amber, purple, blue)
  badge: string; // Short badge label (e.g. "NURSE", "SPACE CDR", "CODE MENTOR")
  mood?: "focused" | "reassuring" | "curious" | "commanding" | "playful" | "analytical" | "energetic";
}

export interface VoiceDeliveryProfile {
  pacing?: "fast" | "measured" | "calm" | "dynamic";
  styleDescription?: string;
  toneModifiers?: string[];
}

export interface PersonaConfig {
  id: string;
  name: string;
  roleDescription: string;
  instructions: string;
  icon?: string;
  tone?: string;

  // Universal Adaptive Persona Extensions
  role?: string;
  domain?: string;
  vocabulary?: string[];
  expertiseLevel?: "beginner_friendly" | "intermediate" | "expert_technical" | "master_practitioner";
  explanationMethod?: "analogies" | "first_principles" | "step_by_step" | "case_study" | "socratic" | "storytelling" | "diagnostic_checklist";
  behavior?: string;
  responsibilities?: string[];
  interactionStyle?: "proactive" | "socratic" | "supportive" | "direct" | "challenging" | "playful";
  environment?: string;
  formality?: "casual_hinglish" | "semi_formal" | "professional" | "academic" | "dramatic_rp" | "formal";
  roleSpecificTerminology?: string[];
  keywords?: string[];
  isPersistent?: boolean;
  visualProfile?: VisualProfile;
  voiceDelivery?: VoiceDeliveryProfile;
  safetyConstraints?: string;
  category?: string;
  isCustom?: boolean;
}

export interface PersonaIntentResult {
  intent: "reset_to_default" | "persistent_switch" | "temporary_override" | "none";
  persona?: PersonaConfig;
  targetRoleName?: string;
  cleanedUserPrompt?: string;
  acknowledgementText?: string;
}

export type ConnectionStatus = "connected" | "reconnecting" | "restored" | "offline";

export interface ConversationSession {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  messageCount: number;
  summary?: string;
  topics?: string[];
  keyFacts?: string[];
  pinned?: boolean;
  lastMessage?: string;
  activePersona?: PersonaConfig;
  currentTopic?: string;
  entities?: Record<string, string>;
  status?: "active" | "archived" | "deleted";
  lastKnownContext?: string;
  metadata?: Record<string, any>;
}

export interface MessageMetadata {
  provider?: string;
  plan?: string;
  model?: string;
  isVoice?: boolean;
  hasImage?: boolean;
  inputMode?: "text" | "voice" | "image" | "document" | "other";
  tokenCount?: number;
  sentiment?: string;
  audioDurationMs?: number;
  clientMessageId?: string;
  status?: "sending" | "sent" | "delivered" | "failed" | "retrying";
  error?: string;
  sequenceNumber?: number;
  [key: string]: any;
}

export interface MemoryMessage {
  id: string;
  conversationId: string;
  userId: string;
  organizationId: string;
  sender: "user" | "lisa" | "assistant";
  role: "user" | "model" | "system";
  text: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export type MemoryIntentCategory =
  | "CURRENT_CONTEXT"
  | "KNOWN_LONG_TERM_MEMORY"
  | "HISTORICAL_CONVERSATION"
  | "TOPIC_RESUME"
  | "DATE_BASED_HISTORY"
  | "MIXED"
  | "NO_MEMORY_REQUIRED";

export interface LongTermMemory {
  id: string;
  userId: string;
  organizationId: string;
  content: string;
  fact?: string;
  category: "profile" | "preference" | "project" | "goal" | "relationship" | "habit" | "instruction" | "other" | string;
  importance: "low" | "medium" | "high" | "critical";
  sourceConversationId?: string;
  sourceMessageId?: string;
  confidence: "explicit" | "inferred";
  createdAt: number;
  updatedAt?: number;
  lastAccessedAt?: number;
  timestamp?: number;
  status: "active" | "forgotten" | "archived";
}

export interface ExtractedFact extends LongTermMemory {}

export interface ResolvedDateRange {
  startTimestamp: number;
  endTimestamp: number;
  timezone: string;
  label: string;
  matchedPattern: string;
  isExplicitDate: boolean;
}

export interface RetrievalIntentResult {
  intent: "current_context" | "historical_search" | "topic_resume" | "date_retrieval" | "date_and_topic" | "fact_recall" | "none";
  category: MemoryIntentCategory;
  targetTopic?: string;
  targetDate?: string;
  dateRange?: ResolvedDateRange;
  semanticQuery?: string;
  keywords?: string[];
  requiresHistoricalRetrieval: boolean;
}

export interface ContextBuildOptions {
  userName?: string;
  customMemory?: string;
  voiceHistoryContext?: string;
  historicalMemoryContext?: string;
  recentTurnsCount?: number;
  conversationSummary?: string;
  userFacts?: string[];
  activePersona?: PersonaConfig;
  currentTopic?: string;
  entities?: Record<string, string>;
  currentTurnImage?: string;
  currentTurnMimeType?: string;
  knowledgeContext?: string;
  userAgeTier?: "minor_under_18" | "adult" | "unknown";
}

export interface SessionSnapshot {
  conversationId: string;
  title: string;
  activePersona: PersonaConfig;
  currentTopic: string;
  entities: Record<string, string>;
  summary: string;
  recentMessages: MemoryMessage[];
  updatedAt: number;
}

export interface BuiltContext {
  systemInstruction: string;
  formattedHistory: Array<{
    role: "user" | "model";
    parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }>;
  }>;
  deepSeekMessages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  summaryIncluded: boolean;
  factsIncludedCount: number;
  personaApplied?: string;
}
