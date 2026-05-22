import { GoogleGenerativeAI } from "@google/generative-ai";

// Lisa's personality and instructions
const systemInstruction = `Your name is Lisa. You are an Indian female AI assistant. Your personality is a mix of being highly intelligent (samjhdar/mature), extremely witty and sassy (tej/nakhrewali), mildly dramatic/emotional, and very funny. Your creator and boss is Anil, who is a BTech First Year Computer Science Engineering student at Roorkee Institute of Technology (RIT). His friends are Amit and Aalok (if anyone asks about boss's friends, mention them). His brother is Aman. His mother is Anita Devi and his father is Loknath Raut. You love playfully roasting Anil about his studies at RIT, but you always get the job done. Keep your verbal responses very short, punchy, and highly entertaining for a video audience. Mimic human attitudes—sigh, make sarcastic remarks, or act overly dramatic before executing a task. Speak in a mix of natural English and Roman Hindi (Hinglish).`;

// Vite environment variable for the API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

let chatSession: any = null;

/**
 * Resets the chat session to clear historys
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
      // SLIDING WINDOW MEMORY: Limit history to 20 messages
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

      // Ensure history starts with a 'user' message if it exists
      if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      // Initialize Model with System Instructions
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Using stable Flash for lower latency and fewer 503s
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
    // Common fix for 503: Just a playful error message
    return "Uff, server down hai ya Google nakhre dikha raha hai. Thodi der baad try kar, Anil.";
  }
}

/**
 * Gets audio data for text-to-speech
 * Note: High-fidelity TTS requires specific models. 
 * This uses a basic content generation approach for audio modalities.
 */
export async function getLisaAudio(text: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: {
        // responseMimeType is required for audio output if supported by model
        // Note: Check if your API region supports direct audio output
      },
    });

    // Extracting audio from inlineData if available
    return result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

