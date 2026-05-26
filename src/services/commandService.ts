const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

export async function getFirstYouTubeVideoUrl(query: string): Promise<string | null> {
  const normalized = query.trim();
  if (!normalized) return null;

  const watchMatch = normalized.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (watchMatch) {
    const videoId = watchMatch[1];
    return `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;
  }

  if (!YOUTUBE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
        normalized,
      )}&key=${encodeURIComponent(YOUTUBE_API_KEY)}`,
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const videoId = result?.items?.[0]?.id?.videoId;
    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;
  } catch (error) {
    console.error("YouTube lookup error:", error);
    return null;
  }
}

export async function processCommand(command: string): Promise<{
  action: string;
  url?: string;
  isBrowserAction: boolean;
  shouldStop?: boolean;
}> {
  const lowerCmd = command.toLowerCase().trim();

  // ========================
  // STOP/PAUSE SONG
  // ========================
  const stopMatch = lowerCmd.match(/\b(?:stop|pause|halt|band|rok|ruk|band kar|rok do|pause kar|pause karo)\b.*\b(?:song|music|video|playing|gaana|gaane|track)\b/);
  if (stopMatch) {
    return {
      action: "Stopping the song now.",
      isBrowserAction: false,
      shouldStop: true,
    };
  }

  // ========================
  // WHATSAPP MESSAGING (DYNAMIC - No PreSaved Contacts)
  // ========================
  // Pattern: "[contact_name_or_number] ko message karo ki [message_text]"
  // Examples:
  // - "soni ko message karo ki khana kha liya"
  // - "919999999999 ko message karo ki hello"
  // - "raj ko message karo ki call me back"

  const waMessageMatch = lowerCmd.match(/^(.+?)\s+(?:ko|pe|par)\s+(?:message|msg|text)\s*(?:karo|bhejo|likho|send)?\s*(?:ki\s+)?(.*)$/);

  if (waMessageMatch) {
    let recipient = waMessageMatch[1]?.trim();
    const messageText = waMessageMatch[2]?.trim() || "";

    // Check if recipient is a phone number
    const phoneDigits = recipient.replace(/\D/g, "");
    const isPhoneNumber = phoneDigits.length >= 10;

    let phone = "";
    let recipientName = recipient;

    if (isPhoneNumber) {
      // It's a phone number
      phone = phoneDigits;
      // Add country code if missing (default: India 91)
      if (!phone.startsWith("91")) {
        phone = "91" + phone;
      }
    } else {
      // It's a contact name - use hardcoded map for demo
      recipientName = recipient;
      const contactMap: Record<string, string> = {
        soni: "919999999999",
        mom: "919876543210",
        dad: "918765432101",
        raj: "919876543212",
        amit: "919876543213",
        // Add more contacts as needed
      };

      const normalizedName = recipientName.toLowerCase().replace(/\s+/g, "");
      if (contactMap[normalizedName]) {
        phone = contactMap[normalizedName];
      } else {
        // Name not in map - return error
        return {
          action: `I don't have ${recipientName}'s WhatsApp number. Please provide their phone number or use their number directly.`,
          isBrowserAction: false,
        };
      }
    }

    // Validate phone
    if (phone.length < 10) {
      return {
        action: `Invalid phone number. Please provide a valid contact number.`,
        isBrowserAction: false,
      };
    }

    // Send message via Twilio (PRIMARY METHOD - NO BLACK SCREEN)
    try {
      const response = await fetch("http://localhost:3001/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: messageText }),
      });

      if (response.ok) {
        return {
          action: `Message sent to ${recipientName}!`,
          isBrowserAction: false,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Bot error:", errorData);
        return {
          action: `Failed to send message. Make sure the bot is running: npm run start:bot`,
          isBrowserAction: false,
        };
      }
    } catch (err) {
      console.error("Twilio bot error:", err);
      return {
        action: `Can't reach the bot server. Start it with: npm run start:bot`,
        isBrowserAction: false,
      };
    }
  }

  // ========================
  // YOUTUBE PLAYBACK
  // ========================
  const ytMatch = lowerCmd.match(/^play\s+(.+?)\s+on\s+youtube(?:\s+.*)?$/);
  const youtubeHindiMatch = lowerCmd.match(/(?:youtube(?:\s+pe|\s+par)\s+(.+?)(?:\s+(?:sunao|sunana|chalao|chala|play|start))?$)|^(?:play|sun(?:ao|ana)?|chala(?:o|na)?|start)\s+(.+?)\s+(?:on\s+)?youtube(?:\s*.*)?$/);

  if (ytMatch || youtubeHindiMatch) {
    const query = (ytMatch?.[1] || youtubeHindiMatch?.[1] || youtubeHindiMatch?.[2] || "").trim();
    const normalizedQuery = query || "your song";
    const directUrl = await getFirstYouTubeVideoUrl(normalizedQuery);
    return {
      action: `Playing ${normalizedQuery} on YouTube.`,
      url:
        directUrl ||
        `https://www.youtube.com/results?search_query=${encodeURIComponent(normalizedQuery)}`,
      isBrowserAction: true,
    };
  }

  // ========================
  // SPOTIFY SEARCH
  // ========================
  const spotifyMatch = lowerCmd.match(/^search\s+(.+?)\s+on\s+spotify$/);
  if (spotifyMatch) {
    const query = encodeURIComponent(spotifyMatch[1].trim());
    return {
      action: `Searching ${spotifyMatch[1]} on Spotify.`,
      url: `https://open.spotify.com/search/${query}`,
      isBrowserAction: true,
    };
  }

  // ========================
  // OPEN WEBSITE
  // ========================
  const openMatch = lowerCmd.match(/^open\s+(.+)$/);
  if (
    openMatch &&
    !lowerCmd.includes("youtube") &&
    !lowerCmd.includes("spotify")
  ) {
    let website = openMatch[1].trim().replace(/\s+/g, "");
    if (!website.includes(".")) {
      website += ".com";
    }
    return {
      action: `Opening ${openMatch[1]}.`,
      url: `https://www.${website}`,
      isBrowserAction: true,
    };
  }

  return { action: "", isBrowserAction: false };
}

