let chatSession: any = null;

export function resetLisaSession() {
  chatSession = null;
}

export async function getLisaResponse(
  prompt: string, 
  history: { sender: "user" | "lisa", text: string }[] = [],
  userName: string = "user",
  voiceHistoryContext: string = "",
  customMemory: string = "",
  image?: string,
  mimeType?: string
): Promise<string> {
  try {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        history,
        userName,
        voiceHistoryContext,
        customMemory,
        image,
        mimeType
      })
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.text || "Ugh, fine. I have nothing to say.";
  } catch (error) {
    console.error("Gemini proxy Error:", error);
    return `Uff, mera dimaag kharab ho gaya hai. Try again later, ${userName}.`;
  }
}

export async function getLisaAudio(text: string, voice: string = "Kore"): Promise<string | null> {
  try {
    const res = await fetch("/api/gemini/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, voice })
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.audio || null;
  } catch (error) {
    console.error("TTS proxy Error:", error);
    return null;
  }
}
