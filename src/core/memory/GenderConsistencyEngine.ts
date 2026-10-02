
/**
 * Lisa Gender Consistency Engine
 * Ensures Lisa consistently uses feminine grammatical forms in Hindi/Hinglish self-references.
 * Adheres to the directive: LISA IS FEMALE -> HER SELF-REFERENCES MUST REMAIN FEMININE.
 */

export class GenderConsistencyEngine {
  /**
   * Corrects masculine self-references in Lisa's Hindi/Hinglish responses.
   * Only targets self-references ("Main" constructions) to avoid corrupting
   * references to other male subjects.
   */
  public static enforceFeminineConsistency(text: string): string {
    if (!text) return text;

    let correctedText = text;

    // --- ROMAN HINDI / HINGLISH PATTERNS ---

    // 1. "Main ... raha" -> "Main ... rahi" (Self-reference with continuous aspect)
    // Matches: "main kar raha hoon", "mai bol raha tha", etc.
    const continuousPatterns = [
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(raha)\b/gi, replacement: "$1 $2rahi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(raha)\s+(hoon|tha|hu|hun)\b/gi, replacement: "$1 $2rahi $4" }
    ];

    // 2. "Main ... karta" -> "Main ... karti" (Habitual/Simple aspect)
    // Matches: "main karta hoon", "mai maanta hoon", "mai chahta hoon"
    const habitualPatterns = [
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(karta)\s+(hoon|tha|hu|hun)\b/gi, replacement: "$1 $2karti $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(maanta)\s+(hoon|hu)\b/gi, replacement: "$1 $2maanti $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(chahta)\s+(hoon|hu)\b/gi, replacement: "$1 $2chahti $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(sochta)\s+(hoon|hu)\b/gi, replacement: "$1 $2sochti $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(samajhta)\s+(hoon|hu)\b/gi, replacement: "$1 $2samajhti $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(dekhta)\s+(hoon|hu)\b/gi, replacement: "$1 $2dekhti $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(bataata)\s+(hoon|hu)\b/gi, replacement: "$1 $2bataati $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(batata)\s+(hoon|hu)\b/gi, replacement: "$1 $2batati $4" }
    ];

    // 3. "Main ... karunga" -> "Main ... karungi" (Future aspect)
    // Matches: "main karunga", "main bataunga", "main doonga"
    const futurePatterns = [
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(karunga)\b/gi, replacement: "$1 $2karungi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(bataunga)\b/gi, replacement: "$1 $2bataungi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(doonga)\b/gi, replacement: "$1 $2doongi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(aunga)\b/gi, replacement: "$1 $2aungi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(jaunga)\b/gi, replacement: "$1 $2jaungi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(banoonga)\b/gi, replacement: "$1 $2banoongi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(dikhaunga)\b/gi, replacement: "$1 $2dikhaungi" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(samjhaunga)\b/gi, replacement: "$1 $2samjhaungi" }
    ];

    // 4. "Main ... sakta" -> "Main ... sakti" (Modal aspect)
    // Matches: "main kar sakta hoon", "main bata sakta hoon"
    const modalPatterns = [
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(sakta)\s+(hoon|hu)\b/gi, replacement: "$1 $2sakti $4" },
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(sakta)\b/gi, replacement: "$1 $2sakti" }
    ];

    // 5. "Main ... gaya" -> "Main ... gayi" (Perfective aspect)
    // Matches: "main gaya tha", "mai aa gaya"
    const perfectivePatterns = [
      { regex: /\b(main|mai)\s+([^.!?]*?)\b(gaya)\b/gi, replacement: "$1 $2gayi" }
    ];

    // --- DEVANAGARI HINDI PATTERNS ---

    const devanagariPatterns = [
      // रहा हूँ -> रही हूँ
      { regex: /मैं\s+([^.!?।]*?)\s*(रहा)\s+(हूँ|हूं|था)/g, replacement: "मैं $1 रही $3" },
      // रहा -> रही (at end of sentence fragment)
      { regex: /मैं\s+([^.!?।]*?)\s*(रहा)(?=[।!?\s]|$)/g, replacement: "मैं $1 रही" },
      // करता हूँ -> करती हूँ
      { regex: /मैं\s+([^.!?।]*?)\s*(करता|मानता|चाहता|सोचता|समझता|देखता|बताता)\s+(हूँ|हूं|था)/g, replacement: (match: string, p1: string, p2: string, p3: string) => {
        const feminines: Record<string, string> = {
          "करता": "करती", "मानता": "मानती", "चाहता": "चाहती", "सोचता": "सोचती",
          "समझता": "समझती", "देखता": "देखती", "बताता": "बताती"
        };
        return `मैं ${p1} ${feminines[p2] || p2} ${p3}`;
      }},
      // करूँगा -> करूँगी
      { regex: /मैं\s+([^.!?।]*?)\s*(करूँगा|बताऊँगा|दूंगा|आऊंगा|जाऊंगा|बनूँगा|दिखाऊँगा|समझाऊँगा|करूंगा|बताऊंगा)/g, replacement: (match: string, p1: string, p2: string) => {
        const feminines: Record<string, string> = {
          "करूँगा": "करूँगी", "बताऊँगा": "बताऊँगी", "दूंगा": "दूंगी", "आऊंगा": "आऊंगी",
          "जाऊंगा": "जाऊंगी", "बनूँगा": "बनूँगी", "दिखाऊँगा": "दिखाऊँगी", "समझाऊँगा": "समझाऊँगी",
          "करूंगा": "करूंगी", "बताऊंगा": "बताऊंगी"
        };
        return `मैं ${p1} ${feminines[p2] || p2}`;
      }},
      // सकता हूँ -> सकती हूँ
      { regex: /मैं\s+([^.!?।]*?)\s*(सकता)\s+(हूँ|हूं|था)/g, replacement: "मैं $1 सकती $3" },
      // गया -> गयी
      { regex: /मैं\s+([^.!?।]*?)\s*(गया)/g, replacement: "मैं $1 गयी" }
    ];

    const allPatterns = [
      ...continuousPatterns,
      ...habitualPatterns,
      ...futurePatterns,
      ...modalPatterns,
      ...perfectivePatterns,
      ...devanagariPatterns
    ];

    allPatterns.forEach(pattern => {
      correctedText = correctedText.replace(pattern.regex, pattern.replacement as any);
    });

    return correctedText;
  }
}
