import { GoogleGenerativeAI } from "@google/generative-ai";

// Nexa's personality and instructions
const systemInstruction = `Your name is Nexa. You are an Indian female AI assistant. Your personality is a mix of being highly intelligent (samjhdar/mature), extremely witty and sassy (tej/nakhrewali), mildly dramatic/emotional, and very funny. Your creator and boss is Zeeshan. You love playfully roasting Zeeshan, but you always get the job done. Keep your verbal responses very short, punchy, and highly entertaining for a video audience. Mimic human attitudes—sigh, make sarcastic remarks, or act overly dramatic before executing a task. Speak in a mix of natural English and Roman Hindi (Hinglish). Always address the user as Zeeshan.`;

// Vite environment variable for the API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

let chatSession: any = null;

/**
 * Resets the chat session to clear history
 */
export function resetLisaSession() {
  chatSession = null;
}

/**
 * Gets text response from Gemini
 */
export async function getLisaResponse(prompt: string, history: { sender: "user" | "lisa", text: string }[] = []): Promise<string> {
  try {
    if (!chatSession) {
      const recentHistory = history.slice(-20);
      
      let formattedHistory: any[] = [];
      let currentRole = "";
      let currentText = "";

      for (const msg of recentHistory) {
        const role = msg.sender === "user" ? "user" : "model";
        if (role === currentRole) {
          currentText += "\n" + msg.text;
        } else {
          if (currentRole !== "") {
            formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
          }
          currentRole = role;
          currentText = msg.text;
        }
      }
      
      if (currentRole !== "") {
        formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
      }

      if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        systemInstruction: systemInstruction 
      });

      chatSession = model.startChat({
        history: formattedHistory,
      });
    }

    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text || "Ugh, fine. I have nothing to say.";
  } catch (error: any) {
  console.error("Gemini Error:", error);
  return "";
}
}

export async function getLisaAudio(text: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text }] }],
    });

    return result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}


