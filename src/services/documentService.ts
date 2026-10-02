import { auth } from "../config/firebase";
import { DocumentRecord } from "../core/documents/DocumentIntelligenceEngine";

export async function parseDocumentApi(
  fileData: string,
  fileName: string,
  fileType: string,
  mimeType: string,
  conversationId?: string
): Promise<DocumentRecord | null> {
  try {
    let token: string | undefined = undefined;
    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch (e) {
        console.warn("[DOC SERVICE] Token error:", e);
      }
    }

    const res = await fetch("/api/documents/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        fileData,
        fileName,
        fileType,
        mimeType,
        conversationId
      })
    });

    if (!res.ok) {
      console.error("[DOC SERVICE] Parse failed:", res.statusText);
      return null;
    }

    const data = await res.json();
    return data.document || null;
  } catch (e) {
    console.error("[DOC SERVICE] Error calling /api/documents/parse:", e);
    return null;
  }
}

export async function fetchConversationDocumentsApi(conversationId: string): Promise<DocumentRecord[]> {
  try {
    let token: string | undefined = undefined;
    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch (e) {}
    }

    const res = await fetch(`/api/documents/${conversationId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.documents || [];
  } catch (e) {
    console.error("[DOC SERVICE] Error fetching conversation docs:", e);
    return [];
  }
}
