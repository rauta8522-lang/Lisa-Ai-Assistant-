const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      if (image) {
        // ... (This won't work perfectly due to the exact match rule).
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
        res.json({text: response?.text
    ? String(response.text)
    : "Ugh, fine. I have nothing to say."});
      } else {
        const deepSeekMessages: Array<{  role: "system" | "user" | "assistant";  content: string;}> = [
  {
    role: "system",
    content: dynamicSystemInstruction,
  },
];
for (const msg of formattedHistory) {
  deepSeekMessages.push({
    role: msg.role === "user" ? "user" : "assistant",
    content: String(msg.parts?.[0]?.text || ""),
  });
}
deepSeekMessages.push({
  role: "user",
  content: prompt,
});
console.log(
  \`🧠 CHAT ROUTE → Sending request to DeepSeek | messages=\${deepSeekMessages.length}\`
);
const responseText = await callDeepSeek(deepSeekMessages, {
  maxTokens: 2048,
});
console.log(
  \`🧠 CHAT ROUTE → DeepSeek returned \${responseText.length} characters\`
);
res.json({
  text: responseText || "Ugh, fine. I have nothing to say.",
});
      }`;

const replacement = `      // ---------------------------------------------------------
      // SUBSCRIPTION / PROVIDER ROUTING LOGIC
      // ---------------------------------------------------------
      let isPaid = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split("Bearer ")[1];
        try {
          const decodedToken = await getAuth().verifyIdToken(token);

          try {
            const userDoc = await getFirestore().collection("users").doc(decodedToken.uid).get();
            if (userDoc.exists && userDoc.data()?.plan === "paid") {
              isPaid = true;
            } else if (decodedToken.plan === "paid") {
              isPaid = true;
            }
          } catch (e) {
            if (decodedToken.plan === "paid") {
              isPaid = true;
            }
          }
        } catch (err) {
          console.error("Token verification failed:", err);
        }
      }

      const useGemini = image || !isPaid;

      if (useGemini) {
        const contentsList: any[] = [];
        for (const turn of formattedHistory) {
          contentsList.push(turn);
        }

        if (image) {
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
            systemInstruction: dynamicSystemInstruction,
          }
        });

        res.json({text: response?.text
    ? String(response.text)
    : "Ugh, fine. I have nothing to say."});
      } else {
        const deepSeekMessages = [
          {
            role: "system",
            content: dynamicSystemInstruction,
          },
        ];
        for (const msg of formattedHistory) {
          deepSeekMessages.push({
            role: msg.role === "user" ? "user" : "assistant",
            content: String(msg.parts?.[0]?.text || ""),
          });
        }
        deepSeekMessages.push({
          role: "user",
          content: prompt,
        });
        console.log(
          \`🧠 CHAT ROUTE → Sending request to DeepSeek | messages=\${deepSeekMessages.length}\`
        );
        const responseText = await callDeepSeek(deepSeekMessages, {
          maxTokens: 2048,
        });
        console.log(
          \`🧠 CHAT ROUTE → DeepSeek returned \${responseText.length} characters\`
        );
        res.json({
          text: responseText || "Ugh, fine. I have nothing to say.",
        });
      }`;

if (!code.includes("if (image) {")) {
  console.log("NOT FOUND!");
} else {
  // Try exact match or fallback to regex
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced successfully!");
  } else {
    console.log("Target string didn't match perfectly. Using regex...");
    const regex = /if \(image\) \{\n\s*\/\/ \.\.\. \(This won't work perfectly due to the exact match rule\)\.[\s\S]*?res\.json\(\{\n\s*text: responseText \|\| "Ugh, fine\. I have nothing to say\.",\n\s*\}\);\n\s*\}/m;
    code = code.replace(regex, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Replaced with regex.");
  }
}
