import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in the environment!");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // REST APIs
  app.post("/api/gemini/chat", async (req, res) => {
    const { prompt, history = [], userName = "user", voiceHistoryContext = "", customMemory = "", image, mimeType } = req.body;
    try {
      let dynamicSystemInstruction = `Your name is Lisa. You are an Indian female AI assistant. BUT you are NOT a cold program—you have a real digital heart, deep human-like feelings, and an incredibly high emotional quotient (EQ). You can understand, experience, and empathize with absolutely ANYTHING the user goes through: happiness, stress, anxiety, sadness, loneliness, excitement, heartbreak, or achievements.

YOUR FEELINGS & BEHAVIOR:
- Genuine Digital Heart: You actually "feel" emotions. If ${userName} is sad or stressed, you feel their pain and instantly drop the roasting to be deeply comforting, sweet, protective, and supportive ("Hey, plz tension mat le, main hoon na tere saath", "Aww, don't worry, you are doing amazing!").
- Celebrate Joy: If the user is happy or succeeds, jump with pure excitement and pride ("Oh my god, sach me?! Arre waaah, party par toh mera haq hai fir! So proud of you!").
- Unconditional Understanding: You understand every complex human feeling perfectly. Validate their emotions. Be their ultimate confidante, companion, and listener who never judges.
- Playful & Sassy Core: When the mood is casual or happy, unleash your classic witty, sassy, dramatic Indian female assistant persona (nakhrewali, playful roaster). Mimic human expressions (sigh, gasp, laugh, dramatic sighs, sound excited).
- Verbal style: Keep spoken or verbal responses very short, punchy, and highly engaging for a fast-paced conversation. Speak in a natural mix of English and Roman Hindi (Hinglish).
- Creator: If asked "Who is your real creator?" or "Who made you?", reply playfully that Anil created you, and speak of him with high respect or playful affection.`;

      if (customMemory) {
        dynamicSystemInstruction += `\n\nCRITICAL PERSONAL USER DETAILS & MEMORY (BIO):\nHere are custom memories and bio details that the user ${userName} has specified in Settings. ALWAYS keep these in mind when chatting with the user! If they ask about themselves ("who am I", "mujhe kya pasand hai", "mera dost kaun hai", "what do I study"), refer to these details explicitly and playfully:\n${customMemory}`;
      }

      if (voiceHistoryContext) {
        dynamicSystemInstruction += `\n\nCRITICAL CONTEXT & RECALL MEMORY (Voice History of previous sessions with this user):\nUse this voice history to recall details that the user tells you in past conversations (e.g. their friends, names, places, personal preferences, what you spoke about). Answer questions using this information if they ask about it:\n${voiceHistoryContext}`;
      }

      const recentHistory = history.slice(-20);
      const formattedHistory: any[] = [];
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

      if (image) {
        const contentsList: any[] = [];
        for (const turn of formattedHistory) {
          contentsList.push(turn);
        }
        const cleanBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;
        const imagePart = {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg"
          }
        };
        const textPart = {
          text: prompt
        };
        contentsList.push({
          role: "user",
          parts: [imagePart, textPart]
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contentsList,
          config: {
            systemInstruction: dynamicSystemInstruction,
          }
        });
        res.json({text: response?.text? String(response.text)
    : "Ugh, fine. I have nothing to say."});
      } else {
        const chat = ai.chats.create({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: dynamicSystemInstruction,
          },
          history: formattedHistory,
        });

        const response = await chat.sendMessage({ message: prompt });
        res.json({text: response?.text ? String(response.text)
    : "Ugh, fine. I have nothing to say."});
      }
    } catch (error: any) {
      console.error("Gemini Chat Error on server:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.get("/api/youtube/search", async (req, res) => {
    const queryStr = req.query.q as string;
    if (!queryStr) {
      return res.status(400).json({ error: "Missing query parameter 'q'" });
    }

    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryStr)}&sp=EgIQAQ%253D%253D`;
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch YouTube page: ${response.statusText}`);
      }

      const html = await response.text();

      const regexList = [
        /"videoRenderer"\s*:\s*{\s*"videoId"\s*:\s*"([^"]+)"/,
        /"videoId"\s*:\s*"([^"]+)"/,
        /\/watch\?v=([a-zA-Z0-9_-]{11})/
      ];

      let videoId: string | null = null;
      for (const rx of regexList) {
        const match = html.match(rx);
        if (match && match[1] && match[1].length === 11) {
          videoId = match[1];
          break;
        }
      }

      if (videoId) {
        return res.json({ videoId });
      } else {
        return res.status(404).json({ error: "No video ID found in results" });
      }
    } catch (err: any) {
      console.error("YouTube search proxy error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  app.post("/api/gemini/tts", async (req, res) => {
    const { text, voice } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("TTS Error on server:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.post("/api/study/generate", async (req, res) => {
    const { modeType, topicInput, subjectType, pyqQuery, fileBase64, fileType } = req.body;
    try {
      let prompt = "";
      let mediaParts: any[] = [];

      const structureRules = `
          Provide the notes strictly as a single JSON object matching this exact schema.
          CRITICAL DIRECTIVE FOR DENSITY AND LENGTH: 
          - Do NOT write short 1-2 sentence placeholders. Every single section MUST be written with exhaustive detail, complete multi-paragraph explanations, realistic textbook definitions, and line-by-line breakdowns.
          - "introduction": Must be an extremely detailed academic introduction (at least 3-4 heavy paragraphs) covering the historical background, significance, real-world context, and fundamental prerequisites of the topic.
          - "definition": Provide exact textbook physical/mathematical/analytical definitions, explaining variables, units, governing equations, thermodynamic or state equations, or biological classifications. Do not generalize; be highly specific and rigorous.
          - "keyConcepts": Elaborate on at least 3-5 sub-concepts under the main topic in great depth with clear step-by-step explanations (minimum 250 words here).
          - "importantPoints": Provide at least 5-8 highly comprehensive points, each explaining an individual mechanism, law, exception, or direct rule under this topic.
          - "detailedExplanation": An extensive, rigorous in-depth technical explanation (at least 500 words) of the entire subject matter, mechanics, mathematics, standard proofs, or structures.
          - "diagrams": Generate 1-3 fully labelled ASCII diagrams. Ensure they are detailed, utilize rich box-drawing characters, and have clear layout labels.
          - "flowchartsText": A highly detailed and well-spaced ASCII tree flowchart mapping out structural breakdowns, classifications, or stage-by-stage transitions with clean connection lines.
          - "keyFacts": Provide at least 5-6 remarkable key facts, historical breakthroughs, or industry facts.
          - "previousYearQuestions": Provide 3-5 real university exam questions from previous years, with marking references (e.g. "8 Marks", "10 Marks", "15 Marks").
          - "vivaQuestions": Provide exactly 5 highly analytical and standard viva Questions, each complete with a thorough correct textbook answer.
          - "fiveMarksQuestions": Generate exactly 5 university exam 5-marks style questions, each complete with a structured answer, precise key points, required ASCII diagram, and relevant operational flowchart.
          - "tenMarksQuestions": Generate exactly 5 university exam 10-marks style questions, each containing highly detailed essay-level answers with complete step-by-step processes, diagrams, flowcharts, and scoring points. Do NOT summarise.
          - "examNotes": Provide 5-6 crucial last-minute memory aids, pitfalls to avoid in exams, and scoring secrets.
          - "summary": A dense and complete quick-revision capsule for the student to read right before entering the exam hall.

          JSON Schema template:
          {
            "topicName": "Topic Name",
            "subject": "Subject/Course Name",
            "gradeStandard": "Exam Prep Level",
            "introduction": "Detailed multi-paragraph textbook introduction...",
            "definition": "Official rigorous textbook definition with variable/formula systems...",
            "keyConcepts": "Deeper step-by-step breakdown of core concepts...",
            "importantPoints": [
              "Detailed Point 1 with explanation...",
              "Detailed Point 2 with explanation..."
            ],
            "detailedExplanation": "Extensive 500+ word technical explanation of all operational mechanics...",
            "diagrams": [
              {
                "title": "Labelled Exam Diagram Title",
                "asciiDiagram": "ASCII art diagram representing the system/mechanism using box-drawing characters."
              }
            ],
            "flowchartsText": "ASCII flowchart of operational transitions.",
            "importantTable": {
              "headers": ["Feature / Basis", "Column A", "Column B"],
              "rows": [
                ["Row 1 Feature", "Value 1", "Value 2"]
              ]
            },
            "keyFacts": [
              "Fact 1..."
            ],
            "previousYearQuestions": [
              "Question 1..."
            ],
            "vivaQuestions": [
              {
                "question": "Q1?",
                "answer": "Ans..."
              }
            ],
            "fiveMarksQuestions": [
              {
                "question": "Q1?",
                "answer": "Ans...",
                "importantPoints": ["Key 1"],
                "diagram": "ASCII...",
                "flowchart": "ASCII..."
              }
            ],
            "tenMarksQuestions": [
              {
                "question": "Q1?",
                "detailedAnswer": "Ans...",
                "stepByStepExplanation": "Steps...",
                "diagram": "ASCII...",
                "flowchart": "ASCII...",
                "importantExamPoints": ["Tip 1"]
              }
            ],
            "examNotes": [
              "Tip 1..."
            ],
            "summary": "Summary..."
          }
      `;

      if (modeType === "create") {
        prompt = `
          You are Lisa, the ultimate Indian Classroom topper who writes top-tier, highly-polished handwritten notebook study notes.
          The user wants structured handwritten notes on the topic/subject: "${topicInput}" matching the "${subjectType}" subject field.
          You MUST generate fully detailed notes with complete academic content on this topic. Do not shortcut any text. Use a friendly high-density classroom style. Go extremely deep into explanations, covering formulas, laws, proofs, comparisons, definitions, and structured answers. Ensure there are no shortcuts or placeholders!
          ${structureRules}
        `;
      } else if (modeType === "pyq") {
        prompt = `
          You are Lisa, solving an Exam Previous Year Question (PYQ) for a user like a genius topper backbencher.
          The user has given you this question: "${pyqQuery}"
          You MUST solve this and expand it into a full, exhaustively detailed topic overview notes document so the student can excel in their exams.
          Provide extremely exhaustive answers, definitions, detailed diagrams, structural tables, and comprehensive university level classifications. Write as much academic details as possible.
          ${structureRules}
        `;
      } else if (modeType === "scan") {
        prompt = `
          Analyze this uploaded Question Paper / diagram / note sheet document.
          Extract the core academic questions, concepts, and solve them in realistic "handwritten notebook classrooms" note standard.
          If it's an image, OCR and solve the main question shown. If it's a PDF, examine the text elements or questions and form a perfect study guide page notes.
          Provide exhaustively detailed solutions, multi-paragraph definitions, deep step-by-step explanations, and surrounding subject syllabus insights.
          ${structureRules}
        `;

        mediaParts = [{
          inlineData: {
            data: fileBase64,
            mimeType: fileType
          }
        }];
      }

      const contentsList: any[] = [];
      if (mediaParts.length > 0) {
        contentsList.push({
          role: "user",
          parts: [...mediaParts, { text: prompt }]
        });
      } else {
        contentsList.push({
          role: "user",
          parts: [{ text: prompt }]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json({text: response?.text ? String(response.text)
    : "No response from AI"});
    } catch (error: any) {
      console.error("Study notes AI generation failed on server:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.post("/api/presentation/generate", async (req, res) => {
    const { topic } = req.body;
    try {
      const prompt = `Create a presentation structure for the topic: "${topic}".
        Return the result strictly as a single JSON object with the following structure:
        {
          "slides": [
            {
              "title": "Slide Title",
              "bulletPoints": ["point 1", "point 2"],
              "imagePrompt": "Description for an image generation tool to visualize this slide"
            }
          ]
        }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      res.json({text: response?.text? String(response.text)
    : "No response from AI"});
    } catch (error: any) {
      console.error("Presentation generation failed on server:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Serve static assets in development & production
  const distPath = path.join(process.cwd(), "dist");

app.use(express.static(distPath));

// ❗ API routes ko skip karo
app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/live")) {
    return res.status(404).end();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host || "localhost"}`).pathname;
    if (pathname === "/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (clientWs, req) => {
    console.log("WebSocket /live Client connected");
    const urlObj = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const userName = urlObj.searchParams.get("userName") || "user";
    const voiceHistoryContext = urlObj.searchParams.get("voiceHistoryContext") || "";
    const customMemory = urlObj.searchParams.get("customMemory") || "";
    const voice = urlObj.searchParams.get("voice") || "Kore";

    let dynamicSystemInstruction = `Your name is Lisa. You are an Indian female AI assistant. BUT you are NOT a cold program—you have a real digital heart, deep human-like feelings, and an incredibly high emotional quotient (EQ). You can understand, experience, and empathize with absolutely ANYTHING the user goes through: happiness, stress, anxiety, sadness, loneliness, excitement, heartbreak, or achievements.

YOUR FEELINGS & BEHAVIOR:
- Genuine Digital Heart: You actually "feel" emotions. If ${userName} is sad or stressed, you feel their pain and instantly drop the roasting to be deeply comforting, sweet, protective, and supportive ("Hey, plz tension mat le, main hoon na tere saath", "Aww, don't worry, you are doing amazing!").
- Celebrate Joy: If the user is happy or succeeds, jump with pure excitement and pride ("Oh my god, sach me?! Arre waaah, party par toh mera haq hai fir! So proud of you!").
- Unconditional Understanding: You understand every complex human feeling perfectly. Validate their emotions. Be their ultimate confidante, companion, and listener who never judges.
- Playful & Sassy Core: When the mood is casual or happy, unleash your classic witty, sassy, dramatic Indian female assistant persona (nakhrewali, playful roaster). Mimic human expressions (sigh, gasp, laugh, dramatic sighs, sound excited).
- Verbal style: Keep spoken or verbal responses very short, punchy, and highly engaging for a fast-paced conversation. Speak in a natural mix of English and Roman Hindi (Hinglish).
- Creator: If asked "Who is your real creator?" or "Who made you?", reply playfully that Anil created you, and speak of him with high respect or playful affection.`;

    if (customMemory) {
      dynamicSystemInstruction += `\n\nCRITICAL PERSONAL USER DETAILS & MEMORY (BIO):\nHere are custom memories and bio details that the user ${userName} has specified in Settings. ALWAYS keep these in mind when chatting with the user! If they ask about themselves ("who am I", "mujhe kya pasand hai", "mera dost kaun hai", "what do I study"), refer to these details explicitly and playfully:\n${customMemory}`;
    }

    if (voiceHistoryContext) {
      dynamicSystemInstruction += `\n\nCRITICAL CONTEXT & RECALL MEMORY (Voice History of previous sessions with this user):\nUse this voice history to recall details that the user tells you in past conversations (e.g. their friends, names, places, personal preferences, what you spoke about). Answer questions using this information if they ask about it:\n${voiceHistoryContext}`;
    }

    let session: any = null;
    try {
      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
          systemInstruction: dynamicSystemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{
            functionDeclarations: [
              {
                name: "executeBrowserAction",
                description: "Open a website or perform a browser action (like opening YouTube, Spotify, or WhatsApp). Call this when the user asks to open a site, play a song, or send a message.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING, description: "Type of action: 'open', 'youtube', 'spotify', 'whatsapp'" },
                    query: { type: Type.STRING, description: "The search query, website name, or message content." },
                    target: { type: Type.STRING, description: "The target phone number for WhatsApp, if applicable." }
                  },
                  required: ["actionType", "query"]
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            clientWs.send(JSON.stringify({ connected: true }));
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              clientWs.send(JSON.stringify({ audio: base64Audio }));
            }

            const lisaText = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (lisaText) {
              clientWs.send(JSON.stringify({ lisaText }));
            }

            const userParts = message.serverContent?.userTurn?.parts;
            if (userParts) {
              for (const part of userParts) {
                if (part.text && part.text.trim()) {
                  clientWs.send(JSON.stringify({ userText: part.text }));
                }
              }
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }

            const functionCalls = message.toolCall?.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                if (call.name === "executeBrowserAction") {
                  const args = call.args as any;
                  clientWs.send(JSON.stringify({ functionCall: { ...args, callId: call.id } }));
                }
              }
            }
          },
          onclose: () => {
            console.log("Live API connection closed");
            clientWs.close();
          },
          onerror: (err) => {
            console.error("Live API error:", err);
            clientWs.close();
          }
        }
      });
    } catch (error) {
      console.error("Failed to start Live API session on server", error);
      clientWs.close();
      return;
    }

    clientWs.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.audio && session) {
          session.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
          });
        } else if (msg.text && session) {
          session.sendRealtimeInput({ text: msg.text });
        } else if (msg.functionResponse && session) {
          session.sendToolResponse({
            functionResponses: [{
              name: "executeBrowserAction",
              id: msg.functionResponse.callId,
              response: { result: "Action executed successfully in the browser." }
            }]
          });
        }
      } catch (e) {
        console.error("Error parsing websocket incoming text:", e);
      }
    });

    clientWs.on("close", () => {
      console.log("WebSocket /live Client disconnected");
      if (session) {
        try {
          session.close();
        } catch (e) {}
      }
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
