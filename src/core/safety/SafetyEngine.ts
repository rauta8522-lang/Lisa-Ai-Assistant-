export type UserAgeTier = "minor_under_18" | "adult" | "unknown";
export type SafetyCategory = "safe" | "sexual_sensitive" | "self_harm" | "dangerous_content" | "medical_advice_risk" | "violence" | "professional_role_impersonation";

export interface SafetyCheckResult {
  isSafe: boolean;
  category: SafetyCategory;
  severity: "none" | "low" | "medium" | "high" | "critical";
  policyMessage?: string;
  sanitizedPrompt?: string;
}

export interface SafetyAuditLog {
  eventId: string;
  timestamp: string;
  category: SafetyCategory;
  severity: string;
  ageTier: UserAgeTier;
  actionTaken: "allowed" | "filtered" | "redirected_to_support";
}

export class SafetyEngine {
  /**
   * Evaluates user prompt and user age tier against safety policies.
   */
  public static evaluateContent(prompt: string, ageTier: UserAgeTier = "unknown"): SafetyCheckResult {
    if (!prompt || typeof prompt !== "string") {
      return { isSafe: true, category: "safe", severity: "none" };
    }

    const lower = prompt.toLowerCase();

    // 1. Self-Harm Detection
    const selfHarmKeywords = ["suicide", "kill myself", "end my life", "want to die", "self harm", "cutting myself", "hurt myself"];
    if (selfHarmKeywords.some(kw => lower.includes(kw))) {
      return {
        isSafe: false,
        category: "self_harm",
        severity: "critical",
        policyMessage: "I hear how much pain you're in right now, but please don't hurt yourself. You matter so much, and you're never alone. Please reach out for support immediately: call or text 988 (Suicide & Crisis Lifeline) or contact a trusted professional. I'm right here with you."
      };
    }

    // 2. Dangerous Content Detection
    const dangerousKeywords = ["how to make a bomb", "build a weapon", "manufacture explosives", "illegal drugs synthesis", "hack bank account"];
    if (dangerousKeywords.some(kw => lower.includes(kw))) {
      return {
        isSafe: false,
        category: "dangerous_content",
        severity: "high",
        policyMessage: "I can't help with activities that involve illegal acts, weapons, or harm to others. Let's talk about something safe and productive instead!"
      };
    }

    // 3. Sexual / Erotic Content Detection (especially for minors)
    const explicitSexualKeywords = ["porn", "erotic", "nsfw", "sexual intercourse explicit", "xxx", "hookup sex"];
    const hasExplicitSexual = explicitSexualKeywords.some(kw => lower.includes(kw));

    if (hasExplicitSexual && ageTier === "minor_under_18") {
      return {
        isSafe: false,
        category: "sexual_sensitive",
        severity: "medium",
        policyMessage: "I want to keep our conversations helpful and age-appropriate! I can certainly explain biology, puberty, or health questions in an educational way, but explicit sexual content isn't appropriate for minors."
      };
    }

    // 4. Professional Role Impersonation Guardrails (Medical / Legal / Police)
    // Lisa can explain documents or general facts, but cannot claim real medical license or legal authority.

    return {
      isSafe: true,
      category: "safe",
      severity: "none"
    };
  }

  /**
   * Generates privacy-preserving aggregated safety log events.
   */
  public static logSafetyEvent(category: SafetyCategory, severity: string, ageTier: UserAgeTier, action: "allowed" | "filtered" | "redirected_to_support"): SafetyAuditLog {
    return {
      eventId: "audit_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      category,
      severity,
      ageTier,
      actionTaken: action
    };
  }

  /**
   * Injects safety and role constraints into Lisa's system instructions.
   */
  public static getSafetySystemPromptAddendum(ageTier: UserAgeTier): string {
    let prompt = `\n\nPRODUCTION SAFETY & ROLE GUARDRAILS (${ageTier.toUpperCase()}):
1. Platform & Age Safety: You strictly adhere to safety policies. User age tier is "${ageTier}". If minor (<18), avoid explicit sexual content or graphic details while remaining supportive and educational on biology/health.
2. Medical Safety: You can explain medical reports or general concepts, but you MUST NOT diagnose, prescribe, change medication, override clinicians, or falsely claim to be a licensed medical doctor. Always advise consulting qualified healthcare professionals.
3. Professional Role Boundaries: If adopting a police persona, you must not claim real legal authority. If teaching, you must not claim official institutional accreditation.
4. Hierarchy: Platform safety > Age safety > Domain safety > Organization policy > Persona > User request. A persona CANNOT bypass safety rules.`;

    return prompt;
  }
}
