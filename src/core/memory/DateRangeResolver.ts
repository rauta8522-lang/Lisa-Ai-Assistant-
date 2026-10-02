import { ResolvedDateRange } from "./types";

/**
 * DateRangeResolver computes exact calendar timestamp boundaries for natural language
 * temporal queries in English, Hindi, and Hinglish.
 */
export class DateRangeResolver {
  public static readonly DEFAULT_TIMEZONE = "Asia/Kolkata";

  /**
   * Helper to extract calendar date parts in a specific IANA timezone.
   */
  public static getDatePartsInTimezone(date: Date, timeZone: string = this.DEFAULT_TIMEZONE): {
    year: number;
    month: number; // 1-12
    day: number;   // 1-31
    hour: number;  // 0-23
    minute: number;
    second: number;
    dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  } {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        weekday: "short",
        hour12: false
      });
      const parts = formatter.formatToParts(date);
      const map: Record<string, string> = {};
      for (const part of parts) {
        if (part.type !== "literal") {
          map[part.type] = part.value;
        }
      }

      const weekdayMap: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6
      };

      const hourVal = parseInt(map.hour || "0", 10);

      return {
        year: parseInt(map.year || `${date.getUTCFullYear()}`, 10),
        month: parseInt(map.month || "1", 10),
        day: parseInt(map.day || "1", 10),
        hour: hourVal === 24 ? 0 : hourVal,
        minute: parseInt(map.minute || "0", 10),
        second: parseInt(map.second || "0", 10),
        dayOfWeek: weekdayMap[map.weekday || "Sun"] ?? 0
      };
    } catch {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        dayOfWeek: date.getDay()
      };
    }
  }

  /**
   * Converts a specific YYYY-MM-DD HH:mm:ss.ms in a timezone to an exact epoch millisecond timestamp.
   */
  public static getTimestampForDate(
    year: number,
    month: number, // 1-12
    day: number,
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
    ms: number = 0,
    timeZone: string = this.DEFAULT_TIMEZONE
  ): number {
    try {
      const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
      const parts = this.getDatePartsInTimezone(utcGuess, timeZone);

      const targetUtcMs = Date.UTC(year, month - 1, day, hour, minute, second, ms);
      const actualTzMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);
      const diff = targetUtcMs - actualTzMs;

      return utcGuess.getTime() + diff + ms;
    } catch {
      return new Date(year, month - 1, day, hour, minute, second, ms).getTime();
    }
  }

  /**
   * Month name mapping for English, Hindi Romanized transliterations.
   */
  private static readonly MONTH_MAP: Record<string, number> = {
    january: 1, jan: 1, janwari: 1, janwary: 1,
    february: 2, feb: 2, farwari: 2, farwary: 2,
    march: 3, mar: 3,
    april: 4, apr: 4, aprail: 4,
    may: 5, mai: 5,
    june: 6, jun: 6,
    july: 7, jul: 7,
    august: 8, aug: 8, agast: 8,
    september: 9, sep: 9, sept: 9, sitambar: 9,
    october: 10, oct: 10, aktubar: 10,
    november: 11, nov: 11, navambar: 11,
    december: 12, dec: 12, disambar: 12
  };

  /**
   * Day of week name mapping.
   */
  private static readonly DAY_MAP: Record<string, number> = {
    sunday: 0, sun: 0, raviwar: 0, itwar: 0,
    monday: 1, mon: 1, somwar: 1, somvaar: 1,
    tuesday: 2, tue: 2, tues: 2, mangalwar: 2, mangalvaar: 2,
    wednesday: 3, wed: 3, budhwar: 3, budhvaar: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4, guruwar: 4, brihaspatiwar: 4, veerwar: 4,
    friday: 5, fri: 5, shukrawar: 5, shukravaar: 5, jumma: 5,
    saturday: 6, sat: 6, shaniwar: 6, shanivaar: 6
  };

  /**
   * Resolves a natural language query into an exact ResolvedDateRange if a temporal reference is detected.
   */
  public static resolveDateRange(
    query: string,
    timeZone: string = this.DEFAULT_TIMEZONE,
    referenceDate: Date = new Date()
  ): ResolvedDateRange | null {
    if (!query || typeof query !== "string") return null;
    const text = query.toLowerCase().trim();
    const nowParts = this.getDatePartsInTimezone(referenceDate, timeZone);
    const { year, month, day, dayOfWeek } = nowParts;

    // 1. "kal" / "yesterday"
    // Distinguish "kal" (yesterday in past tense context) vs tomorrow
    if (/\b(yesterday|kal)\b/i.test(text)) {
      // Calculate yesterday date
      const yesterdayRef = new Date(this.getTimestampForDate(year, month, day, 12, 0, 0, 0, timeZone) - 86400000);
      const yParts = this.getDatePartsInTimezone(yesterdayRef, timeZone);
      const start = this.getTimestampForDate(yParts.year, yParts.month, yParts.day, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(yParts.year, yParts.month, yParts.day, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `Yesterday (${yParts.year}-${String(yParts.month).padStart(2, "0")}-${String(yParts.day).padStart(2, "0")})`,
        matchedPattern: "yesterday",
        isExplicitDate: false
      };
    }

    // 2. "parso" / "parson" / "day before yesterday"
    if (/\b(parso|parson|day before yesterday)\b/i.test(text)) {
      const parsoRef = new Date(this.getTimestampForDate(year, month, day, 12, 0, 0, 0, timeZone) - 2 * 86400000);
      const pParts = this.getDatePartsInTimezone(parsoRef, timeZone);
      const start = this.getTimestampForDate(pParts.year, pParts.month, pParts.day, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(pParts.year, pParts.month, pParts.day, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `Day before yesterday (${pParts.year}-${String(pParts.month).padStart(2, "0")}-${String(pParts.day).padStart(2, "0")})`,
        matchedPattern: "day_before_yesterday",
        isExplicitDate: false
      };
    }

    // 3. "tarso" / "narso" / "3 din pehle" / "X din pehle" / "X days ago"
    const daysAgoMatch = text.match(/\b(\d+)\s*(?:din|days?)\s*(?:pehle|ago)\b/i);
    if (daysAgoMatch) {
      const daysCount = parseInt(daysAgoMatch[1], 10);
      const agoRef = new Date(this.getTimestampForDate(year, month, day, 12, 0, 0, 0, timeZone) - daysCount * 86400000);
      const aParts = this.getDatePartsInTimezone(agoRef, timeZone);
      const start = this.getTimestampForDate(aParts.year, aParts.month, aParts.day, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(aParts.year, aParts.month, aParts.day, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `${daysCount} days ago (${aParts.year}-${String(aParts.month).padStart(2, "0")}-${String(aParts.day).padStart(2, "0")})`,
        matchedPattern: "n_days_ago",
        isExplicitDate: false
      };
    }

    // 4. "today" / "aaj"
    if (/\b(today|aaj)\b/i.test(text)) {
      const start = this.getTimestampForDate(year, month, day, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(year, month, day, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `Today (${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")})`,
        matchedPattern: "today",
        isExplicitDate: false
      };
    }

    // 5. "pichhle hafte" / "pichle hafte" / "last week" / "previous week"
    if (/\b(last week|pichhle hafte|pichle hafte|previous week|past week)\b/i.test(text)) {
      const currentDayOffsetFromMon = (dayOfWeek + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
      const thisMondayRef = new Date(this.getTimestampForDate(year, month, day, 12, 0, 0, 0, timeZone) - (currentDayOffsetFromMon * 86400000));
      const lastMondayRef = new Date(thisMondayRef.getTime() - (7 * 86400000));
      const lastSundayRef = new Date(thisMondayRef.getTime() - 86400000);

      const lmParts = this.getDatePartsInTimezone(lastMondayRef, timeZone);
      const lsParts = this.getDatePartsInTimezone(lastSundayRef, timeZone);

      const start = this.getTimestampForDate(lmParts.year, lmParts.month, lmParts.day, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(lsParts.year, lsParts.month, lsParts.day, 23, 59, 59, 999, timeZone);

      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `Last Week (${lmParts.year}-${String(lmParts.month).padStart(2, "0")}-${String(lmParts.day).padStart(2, "0")} to ${lsParts.year}-${String(lsParts.month).padStart(2, "0")}-${String(lsParts.day).padStart(2, "0")})`,
        matchedPattern: "last_week",
        isExplicitDate: false
      };
    }

    // 6. "is hafte" / "this week"
    if (/\b(this week|is hafte)\b/i.test(text)) {
      const currentDayOffsetFromMon = (dayOfWeek + 6) % 7;
      const thisMondayRef = new Date(this.getTimestampForDate(year, month, day, 12, 0, 0, 0, timeZone) - (currentDayOffsetFromMon * 86400000));
      const thisSundayRef = new Date(thisMondayRef.getTime() + (6 * 86400000));

      const tmParts = this.getDatePartsInTimezone(thisMondayRef, timeZone);
      const tsParts = this.getDatePartsInTimezone(thisSundayRef, timeZone);

      const start = this.getTimestampForDate(tmParts.year, tmParts.month, tmParts.day, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(tsParts.year, tsParts.month, tsParts.day, 23, 59, 59, 999, timeZone);

      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `This Week (${tmParts.year}-${String(tmParts.month).padStart(2, "0")}-${String(tmParts.day).padStart(2, "0")} to ${tsParts.year}-${String(tsParts.month).padStart(2, "0")}-${String(tsParts.day).padStart(2, "0")})`,
        matchedPattern: "this_week",
        isExplicitDate: false
      };
    }

    // 7. "pichhle mahine" / "pichle mahine" / "last month" / "previous month"
    if (/\b(last month|pichhle mahine|pichle mahine|pichhle month|pichle month|previous month)\b/i.test(text)) {
      let prevYear = year;
      let prevMonth = month - 1;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
      const start = this.getTimestampForDate(prevYear, prevMonth, 1, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(prevYear, prevMonth, daysInPrevMonth, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `Last Month (${prevYear}-${String(prevMonth).padStart(2, "0")})`,
        matchedPattern: "last_month",
        isExplicitDate: false
      };
    }

    // 8. "is mahine" / "this month"
    if (/\b(this month|is mahine|is month)\b/i.test(text)) {
      const daysInCurrentMonth = new Date(year, month, 0).getDate();
      const start = this.getTimestampForDate(year, month, 1, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(year, month, daysInCurrentMonth, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `This Month (${year}-${String(month).padStart(2, "0")})`,
        matchedPattern: "this_month",
        isExplicitDate: false
      };
    }

    // 9. Day names: "last Friday", "Monday ko", "Shukrawar ko", etc.
    const dayNames = Object.keys(this.DAY_MAP).join("|");
    const dayRegex = new RegExp(`\\b(?:last|pichhle|pichle)?\\s*(${dayNames})\\b`, "i");
    const dayMatch = text.match(dayRegex);
    if (dayMatch && !text.includes("week") && !text.includes("month")) {
      const targetDayName = dayMatch[1].toLowerCase();
      const targetDayNum = this.DAY_MAP[targetDayName];
      if (targetDayNum !== undefined) {
        // Calculate days back
        let diffDays = (dayOfWeek - targetDayNum + 7) % 7;
        if (diffDays === 0 || text.includes("last") || text.includes("pichhle") || text.includes("pichle")) {
          diffDays = diffDays === 0 ? 7 : diffDays;
        }
        const targetRef = new Date(this.getTimestampForDate(year, month, day, 12, 0, 0, 0, timeZone) - diffDays * 86400000);
        const tParts = this.getDatePartsInTimezone(targetRef, timeZone);
        const start = this.getTimestampForDate(tParts.year, tParts.month, tParts.day, 0, 0, 0, 0, timeZone);
        const end = this.getTimestampForDate(tParts.year, tParts.month, tParts.day, 23, 59, 59, 999, timeZone);
        return {
          startTimestamp: start,
          endTimestamp: end,
          timezone: timeZone,
          label: `${targetDayName.toUpperCase()} (${tParts.year}-${String(tParts.month).padStart(2, "0")}-${String(tParts.day).padStart(2, "0")})`,
          matchedPattern: "day_of_week",
          isExplicitDate: true
        };
      }
    }

    // 10. Explicit Date formats:
    // Format A: "15 August" / "15th August" / "15 Aug 2026" / "August 15" / "Aug 15th"
    const monthNames = Object.keys(this.MONTH_MAP).join("|");
    // "15 August [2026]" or "15th August"
    const dayMonthRegex = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:of\\s*)?(${monthNames})(?:\\s*(\\d{4}))?\\b`, "i");
    // "August 15 [2026]" or "Aug 15th"
    const monthDayRegex = new RegExp(`\\b(${monthNames})\\s*(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(\\d{4}))?\\b`, "i");

    const dmMatch = text.match(dayMonthRegex);
    const mdMatch = text.match(monthDayRegex);

    if (dmMatch || mdMatch) {
      let targetDay = 1;
      let targetMonth = 1;
      let targetYear = year;

      if (dmMatch) {
        targetDay = parseInt(dmMatch[1], 10);
        targetMonth = this.MONTH_MAP[dmMatch[2].toLowerCase()] || 1;
        if (dmMatch[3]) targetYear = parseInt(dmMatch[3], 10);
      } else if (mdMatch) {
        targetMonth = this.MONTH_MAP[mdMatch[1].toLowerCase()] || 1;
        targetDay = parseInt(mdMatch[2], 10);
        if (mdMatch[3]) targetYear = parseInt(mdMatch[3], 10);
      }

      // Sanity check
      if (targetDay >= 1 && targetDay <= 31 && targetMonth >= 1 && targetMonth <= 12) {
        const start = this.getTimestampForDate(targetYear, targetMonth, targetDay, 0, 0, 0, 0, timeZone);
        const end = this.getTimestampForDate(targetYear, targetMonth, targetDay, 23, 59, 59, 999, timeZone);
        return {
          startTimestamp: start,
          endTimestamp: end,
          timezone: timeZone,
          label: `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`,
          matchedPattern: "explicit_date_name",
          isExplicitDate: true
        };
      }
    }

    // Format B: "YYYY-MM-DD" or "DD-MM-YYYY" or "DD/MM/YYYY"
    const isoDateMatch = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (isoDateMatch) {
      const targetYear = parseInt(isoDateMatch[1], 10);
      const targetMonth = parseInt(isoDateMatch[2], 10);
      const targetDay = parseInt(isoDateMatch[3], 10);
      const start = this.getTimestampForDate(targetYear, targetMonth, targetDay, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(targetYear, targetMonth, targetDay, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`,
        matchedPattern: "iso_date",
        isExplicitDate: true
      };
    }

    const dmyMatch = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
    if (dmyMatch) {
      const targetDay = parseInt(dmyMatch[1], 10);
      const targetMonth = parseInt(dmyMatch[2], 10);
      const targetYear = parseInt(dmyMatch[3], 10);
      const start = this.getTimestampForDate(targetYear, targetMonth, targetDay, 0, 0, 0, 0, timeZone);
      const end = this.getTimestampForDate(targetYear, targetMonth, targetDay, 23, 59, 59, 999, timeZone);
      return {
        startTimestamp: start,
        endTimestamp: end,
        timezone: timeZone,
        label: `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`,
        matchedPattern: "dmy_date",
        isExplicitDate: true
      };
    }

    return null;
  }

  /**
   * Extracts clean topic keywords from combined temporal and topic queries.
   * e.g. "Kal Firebase par kya baat hui thi?" -> "Firebase"
   * e.g. "Last week zoo wale topic par kya discuss kiya tha?" -> "zoo"
   */
  public static extractTopicFromQuery(query: string): string | undefined {
    if (!query) return undefined;
    let cleaned = query.trim();

    // Remove common question prefixes/suffixes and filler phrases
    const noisePatterns = [
      /\b(?:humne|maine|apne|tumne|we|i|you)\b/gi,
      /\b(?:kya|what|which|kis|kaunsa|kounsa)\b/gi,
      /\b(?:baat ki thi|baat hui thi|discuss kiya tha|discuss kiya|decide kiya tha|decide kiya|talked about|spoken about|discussed)\b/gi,
      /\b(?:ke baare me|ke bare me|about|on|regarding|pe|par|se related)\b/gi,
      /\b(?:wale topic|wala topic|topic|discussion|conversation|chat|session)\b/gi,
      /\b(?:continue karo|resume karo|kholo|batao|tell me|recall|yaad karo)\b/gi,
      /\b(?:kal|yesterday|parso|today|aaj|pichhle|pichle|last week|this week|last month|this month)\b/gi,
      /\b(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|agast|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec))\b/gi,
      /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|somwar|mangalwar|budhwar|guruwar|shukrawar|shaniwar|raviwar)\b/gi,
      /[?!.,]/g
    ];

    for (const pattern of noisePatterns) {
      cleaned = cleaned.replace(pattern, " ");
    }

    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned.length >= 2 ? cleaned : undefined;
  }
}
