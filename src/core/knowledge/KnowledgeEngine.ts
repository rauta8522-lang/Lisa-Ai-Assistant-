import { ChandrapurKnowledgeEngine } from "./ChandrapurKnowledge";

export interface KnowledgeNeedResult {
  requiresFreshInfo: boolean;
  queryType?: string;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export class KnowledgeEngine {
  /**
   * Returns current calendar and temporal grounding context
   */
  public static getCurrentDateContext(): string {
    const now = new Date();
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata"
      };
      const formatted = now.toLocaleDateString("en-IN", options);
      return `Current year is 2026. Today's date is ${formatted} (IST). You are operating in 2026.`;
    } catch {
      return `Current year is 2026. Today is ${now.toDateString()}. You are operating in 2026.`;
    }
  }

  /**
   * Detects whether user prompt requires live/fresh external information
   */
  public static detectNeed(prompt: string): KnowledgeNeedResult {
    if (!prompt) return { requiresFreshInfo: false };
    const lower = prompt.toLowerCase();

    const weatherKeywords = ["weather", "temperature", "forecast", "rain", "climate today", "heatwave today"];
    const newsKeywords = ["news", "latest", "recent", "today's update", "headline", "current event", "breaking"];
    const financeKeywords = ["stock price", "crypto", "bitcoin", "sensex", "nifty", "exchange rate", "gold rate"];
    const sportsKeywords = ["live score", "match score", "ipl score", "cricket update", "tournament live"];
    const statusKeywords = ["who is currently", "latest update", "present situation", "live status"];

    if (weatherKeywords.some(kw => lower.includes(kw))) {
      return { requiresFreshInfo: true, queryType: "weather" };
    }
    if (newsKeywords.some(kw => lower.includes(kw))) {
      return { requiresFreshInfo: true, queryType: "news" };
    }
    if (financeKeywords.some(kw => lower.includes(kw))) {
      return { requiresFreshInfo: true, queryType: "finance" };
    }
    if (sportsKeywords.some(kw => lower.includes(kw))) {
      return { requiresFreshInfo: true, queryType: "sports" };
    }
    if (statusKeywords.some(kw => lower.includes(kw))) {
      return { requiresFreshInfo: true, queryType: "status" };
    }

    return { requiresFreshInfo: false };
  }

  /**
   * Retrieves static domain knowledge (e.g. Chandrapur District Administrative Blueprint)
   */
  public static getStaticDomainKnowledge(prompt: string): string {
    if (!prompt) return "";
    const chandrapurContext = ChandrapurKnowledgeEngine.getKnowledgeContext(prompt);
    if (chandrapurContext) {
      return chandrapurContext;
    }
    return "";
  }

  /**
   * Formats Google GenAI Grounding Metadata into clean web sources
   */
  public static processGroundingMetadata(groundingMeta: any): GroundingSource[] {
    if (!groundingMeta) return [];
    const sources: GroundingSource[] = [];
    const seenUris = new Set<string>();

    if (Array.isArray(groundingMeta.groundingChunks)) {
      for (const chunk of groundingMeta.groundingChunks) {
        const uri = chunk?.web?.uri;
        if (uri && !seenUris.has(uri)) {
          seenUris.add(uri);
          sources.push({
            title: chunk.web.title || uri,
            uri: uri
          });
        }
      }
    }

    if (Array.isArray(groundingMeta.webSearchQueries) && sources.length === 0) {
      for (const query of groundingMeta.webSearchQueries) {
        if (query) {
          sources.push({ title: `Search: ${query}` });
        }
      }
    }

    return sources;
  }
}
