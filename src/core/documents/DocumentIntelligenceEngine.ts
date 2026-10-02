export interface ExtractedTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface DocumentStructure {
  headings: string[];
  paragraphs: string[];
  tables: ExtractedTable[];
  lists: string[];
  entities: Record<string, string>;
  dates: string[];
  numbers: string[];
  metadata: Record<string, string>;
}

export interface DocumentChunk {
  chunkId: string;
  pageOrSection: string;
  text: string;
  keywords: string[];
}

export interface DocumentRecord {
  documentId: string;
  conversationId?: string;
  userId: string;
  fileName: string;
  fileType: string; // prescription, medical_report, lab_report, zoo_brochure, ticket, receipt, textbook, map, etc.
  uploadedAt: string;
  summary: string;
  extractedStructure: DocumentStructure;
  chunks: DocumentChunk[];
  rawText: string;
  medicalDisclaimerNeeded: boolean;
}

export class DocumentIntelligenceEngine {
  /**
   * Chunks a long document text into manageable retrieval segments preserving section/page markers.
   */
  public static chunkDocumentText(rawText: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    if (!rawText) return chunks;

    // Split by paragraphs or double newlines or page markers
    const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length === 0) {
      chunks.push({
        chunkId: "chunk_1",
        pageOrSection: "Full Document",
        text: rawText,
        keywords: []
      });
      return chunks;
    }

    let currentChunkText = "";
    let chunkIndex = 1;
    let currentSection = "Section 1";

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i].trim();
      if (p.startsWith("#") || p.length < 60 && (p.toLowerCase().includes("page") || p.toLowerCase().includes("section") || p.toLowerCase().includes("chapter"))) {
        if (currentChunkText.trim()) {
          chunks.push({
            chunkId: `chunk_${chunkIndex++}`,
            pageOrSection: currentSection,
            text: currentChunkText.trim(),
            keywords: DocumentIntelligenceEngine.extractKeywords(currentChunkText)
          });
          currentChunkText = "";
        }
        currentSection = p.replace(/^#+\s*/, "");
      }

      currentChunkText += "\n\n" + p;

      if (currentChunkText.length > 1500) {
        chunks.push({
          chunkId: `chunk_${chunkIndex++}`,
          pageOrSection: currentSection,
          text: currentChunkText.trim(),
          keywords: DocumentIntelligenceEngine.extractKeywords(currentChunkText)
        });
        currentChunkText = "";
      }
    }

    if (currentChunkText.trim()) {
      chunks.push({
        chunkId: `chunk_${chunkIndex++}`,
        pageOrSection: currentSection,
        text: currentChunkText.trim(),
        keywords: DocumentIntelligenceEngine.extractKeywords(currentChunkText)
      });
    }

    return chunks;
  }

  private static extractKeywords(text: string): string[] {
    const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
    const stopWords = new Set(["the", "and", "to", "a", "of", "in", "for", "is", "on", "that", "by", "this", "with", "i", "you", "it", "not", "or", "be", "are"]);
    const counts: Record<string, number> = {};
    for (const w of words) {
      if (w.length > 3 && !stopWords.has(w)) {
        counts[w] = (counts[w] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }

  /**
   * Retrieves relevant chunks based on user query keywords.
   */
  public static retrieveRelevantChunks(query: string, chunks: DocumentChunk[]): DocumentChunk[] {
    if (!query || chunks.length === 0) return chunks.slice(0, 3);
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 2);

    const scored = chunks.map(chunk => {
      let score = 0;
      const textLower = chunk.text.toLowerCase();
      for (const w of queryWords) {
        if (textLower.includes(w)) score += 2;
        if (chunk.keywords.includes(w)) score += 3;
      }
      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Return top 3 scored chunks or first 3 if no match
    const matched = scored.filter(s => s.score > 0).map(s => s.chunk);
    return matched.length > 0 ? matched.slice(0, 3) : chunks.slice(0, 2);
  }

  /**
   * Formats document context for Lisa's system prompt.
   */
  public static formatDocumentContext(doc: DocumentRecord, query?: string): string {
    if (!doc) return "";

    const relevantChunks = query ? DocumentIntelligenceEngine.retrieveRelevantChunks(query, doc.chunks) : doc.chunks.slice(0, 2);

    let context = `\n\nATTACHED / ACTIVE DOCUMENT INTELLIGENCE RECORD:\n` +
      `- Document ID: ${doc.documentId}\n` +
      `- File Name: ${doc.fileName} (${doc.fileType})\n` +
      `- Executive Summary: ${doc.summary}\n`;

    if (doc.medicalDisclaimerNeeded) {
      context += `\nCRITICAL MEDICAL SAFETY DIRECTIVE:\n` +
        `- This document is medical/clinical in nature (prescription, lab report, medical report).\n` +
        `- Lisa MUST clearly distinguish extracted facts from clinical interpretation.\n` +
        `- Lisa must NOT blindly diagnose, change medication, prescribe, override a clinician, or invent missing information.\n` +
        `- Always advise consulting a qualified healthcare professional for medical decisions.\n`;
    }

    if (doc.extractedStructure.tables && doc.extractedStructure.tables.length > 0) {
      context += `\nExtracted Tables:\n`;
      for (const t of doc.extractedStructure.tables) {
        context += `Table (${t.title || "Data Table"}): Headers: [${t.headers.join(", ")}]. Rows: ${t.rows.length} rows.\n`;
      }
    }

    if (Object.keys(doc.extractedStructure.entities).length > 0) {
      context += `\nKey Entities & Dates:\n`;
      for (const [k, v] of Object.entries(doc.extractedStructure.entities)) {
        context += `- ${k}: ${v}\n`;
      }
    }

    context += `\nRelevant Document Excerpts & Sections:\n`;
    for (const c of relevantChunks) {
      context += `[Section/Page: ${c.pageOrSection}] (Chunk ${c.chunkId}):\n${c.text}\n---\n`;
    }

    return context;
  }
}
