<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lisa - AI Voice Assistant 🎤

Your personal voice-controlled AI assistant with WhatsApp messaging, YouTube, and more.

## ⚡ Quick Start

### Prerequisites
- Node.js (v16+)
- Twilio account (free tier available)
- Gemini API Key

### 1. Install

```bash
npm install
```

### 2. Setup Twilio WhatsApp

Get credentials from https://www.twilio.com/try-twilio:
- Create free account
- Go to **Messaging > Services > WhatsApp**
- Copy **Account SID**, **Auth Token**, **WhatsApp number**

### 3. Create `.env.local`

```env
VITE_GEMINI_API_KEY=your_gemini_key
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### 4. Run

```bash
# Terminal 1: Bot server
npm run start:bot

# Terminal 2: App
npm run dev
```

Open **http://localhost:3001** in your browser.

---

## 🗣️ Voice Commands

### Send WhatsApp Messages

Say any of these:
- **"soni ko message karo ki khana kha liya"** → Sends to Soni
- **"919999999999 ko message karo ki hello"** → Sends to any number
- **"mom ko message karo ki coming home"** → Works with names or numbers
- **"raj ko message karo ki call me"** → Instantly sent via Twilio

**Format:** `[contact_name_or_number] ko message karo ki [message]`

### Other Commands

- **YouTube:** `"play [song] on youtube"`
- **Spotify:** `"search [song] on spotify"`
- **Open Website:** `"open github.com"`
- **Stop Music:** `"stop the song"` or `"pause"`

---

## ⚙️ How It Works

### WhatsApp Sending
1. **Primary:** Twilio API (instant, no browser popup)
2. **No black screen issue** — Direct API call, no browser automation
3. **Works everywhere** — Mobile, desktop, web apps
4. **Automatic** — No manual confirmation needed

### Adding Contacts

Edit in `src/services/commandService.ts`:

```typescript
const contactMap: Record<string, string> = {
  soni: "919999999999",
  mom: "919876543210",
  raj: "919876543212",
  // Add your contacts here
};
```

Or use phone numbers directly — no pre-saved contacts needed!

---

## 📁 Project Structure

```
src/
  ├── App.tsx
  ├── components/
  │   ├── PermissionModal.tsx
  │   └── Visualizer.tsx
  ├── services/
  │   ├── commandService.ts      (Voice command parser)
  │   ├── geminiService.ts
  │   └── liveService.ts
server/
  └── twilio-bot.js             (WhatsApp sender)
```

---

## 🔧 Troubleshooting

### Bot won't start: "Missing Twilio credentials"

**Fix:**
```bash
# Check .env.local has these:
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+...
```

### Message failed to send

**Cause 1:** Phone number format
- Use international format: `919999999999` (not 9999999999)
- Or use: `+919999999999`

**Cause 2:** Number not in Twilio sandbox whitelist
- Add phone number in [Twilio Console](https://console.twilio.com/)

**Cause 3:** Contact name not in map
- Add to `commandService.ts` contactMap
- Or use full number directly

### Microphone not working

- Check browser **Microphone Permissions**
- Test system microphone first
- Use **"Type instead"** button to test as text

### Port already in use

```bash
# If port 3001 is taken, app will use 3002/3003/etc
# Or kill the process:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

---

## 📱 Future: Mobile App

Since Twilio works on any device, you can deploy as:
- **PWA** — Progressive Web App (install to home screen)
- **Capacitor** — iOS/Android wrapper
- **React Native** — Full native app

The backend is already mobile-ready!

---

## 📖 Command Reference

| What | How | Example |
|------|-----|---------|
| Send WhatsApp | `[name] ko message karo ki [text]` | `"soni ko message karo ki hi"` |
| Send WhatsApp (number) | `[number] ko message karo ki [text]` | `"919999999999 ko message karo ki hey"` |
| YouTube | `play [query] on youtube` | `"play cat videos on youtube"` |
| Spotify | `search [query] on spotify` | `"search dua lipa"` |
| Website | `open [site]` | `"open google.com"` |
| Stop Music | `stop the song` | `"stop the music"` |

---

## 🤝 Contributing

Feel free to customize and extend!

---

## 📄 License

MIT



### Prerequisites
- Node.js (v16+)
- Twilio account with WhatsApp enabled (for message automation)
- Gemini API Key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your credentials:
   ```
   VITE_GEMINI_API_KEY=your_gemini_key
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. (**Optional**) Start the WhatsApp bot for automated messaging (in another terminal):
   ```bash
   npm run start:bot
   ```

## Features

### 1. **Voice Commands**
- Press the microphone button and speak naturally.
- Control YouTube, WhatsApp, and more with voice.

### 2. **Contact Management**
- Click the **Contacts** button (☎️ icon) in the top-right corner.
- Add, edit, or delete contacts easily.
- Saved contacts sync with voice commands.

### 3. **WhatsApp Messaging**
Send messages to any saved contact by voice:

```
"[contact_name] ko message karo ki [your_message]"
```

**Examples:**
- `"soni ko message karo ki khana kha liya"` → Sends "khana kha liya" to Soni
- `"raj ko message karo ki call me"` → Sends "call me" to Raj
- `"mom ko message karo ki coming home"` → Sends "coming home" to Mom

**How it works:**
1. The bot tries to send via WhatsApp Web automation (if running).
2. If the bot is unavailable, it falls back to opening WhatsApp in the browser.

### 4. **YouTube Playback**
- `"play [song/video name] on youtube"` → Plays the video
- `"youtube par [query]"` → Hindi command variant

### 5. **General Web Search**
- `"open [website name]"` → Opens a website
- `"search [query] on spotify"` → Searches Spotify

### 6. **Live Conversation**
- Click **Start Session** for real-time voice-based chat with Lisa.
- Use natural conversation — no special syntax needed.

### 7. **Music Control**
- `"stop the music"` or `"pause the song"` → Stops playback
- Works across all playback modes.

---

## Setup Guide for Different Use Cases

### Use Case 1: Desktop with WhatsApp Automation via Twilio (Recommended)

**Best for:** Anyone who wants automated WhatsApp messaging without browser popups.

**Prerequisites:**
1. Create a free [Twilio account](https://www.twilio.com/try-twilio)
2. Enable WhatsApp in Twilio Console (you'll get a sandbox number for testing)
3. Get your credentials:
   - Account SID
   - Auth Token  
   - WhatsApp number (format: `whatsapp:+1234567890`)

**Steps:**
1. Add credentials to `.env.local`:
   ```env
   TWILIO_ACCOUNT_SID=AC...your_sid...
   TWILIO_AUTH_TOKEN=your_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

2. Run both servers in separate terminals:
   ```bash
   npm run start:bot     # Terminal 1 - Twilio bot on :3001
   npm run dev           # Terminal 2 - App on :3002
   ```

3. Add your contacts via the ☎️ button and say:
   ```
   "soni ko message karo ki khana kha liya"
   ```

**Benefits:**
- ✅ Fully automated (no browser needed)
- ✅ Works on mobile/desktop/web
- ✅ Professional API (reliable)
- ✅ Future-proof for scaling

---

---

## Project Structure

```
src/
  ├── App.tsx                     # Main app component
  ├── components/
  │   ├── ContactsManager.tsx     # Contact management UI
  │   ├── PermissionModal.tsx     # Microphone permission modal
  │   └── Visualizer.tsx          # Audio visualizer
  ├── services/
  │   ├── commandService.ts       # Voice command parser
  │   ├── geminiService.ts        # Gemini AI integration
  │   ├── liveService.ts          # Real-time chat handler
  ├── utils/
  │   └── audioUtils.ts           # Audio playback utilities
server/
  └── whatsapp-bot.js            # Puppeteer-based WhatsApp automation
```

---

## Environment Variables

Create a `.env.local` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key_optional
```

---

## Troubleshooting

### WhatsApp bot shows "Missing credentials" error

**Problem:** Bot server won't start.

**Solution:** Check `.env.local` has all three Twilio variables:
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1...
```

### Message failed to send

**Problem:** "Failed to send message" error in logs.

**Possible causes:**
1. Invalid phone number format (must be international with country code)
2. Number not whitelisted in Twilio sandbox
3. Invalid Twilio credentials
4. Twilio account out of credits/trial expired

**Solutions:**
1. Format phone: `919999999999` (India) or `+919999999999`
2. Add recipient number in [Twilio Console Sandbox](https://console.twilio.com/us/account/messaging/services/)
3. Double-check credentials in `.env.local`
4. Check Twilio account status

### Contacts not saving

**Problem:** Contacts added in the UI disappear after refresh.

**Solution:** Check if localStorage is enabled in your browser. Contacts are stored in browser local storage.

### Voice commands not recognized

**Problem:** The app doesn't recognize what you're saying.

**Solutions:**
1. Ensure your microphone is working (test via system settings).
2. Speak clearly and use exact command syntax.
3. Check the browser console for error messages.

### Port 3001 or 3002 already in use

**Problem:** "Port already in use" error.

**Solution:** Kill the process using that port or use a different port:
```bash
# Change port in .env.local
PORT=3005

# Or kill the process (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

---

## API Reference

### Command Syntax

| Command | Example | Result |
|---------|---------|--------|
| WhatsApp (contact name) | `"soni ko message karo ki hello"` | Sends "hello" to Soni |
| WhatsApp (direct number) | `"send whatsapp to 919999999999 saying hi"` | Sends "hi" to number |
| YouTube | `"play cat videos on youtube"` | Searches and plays video |
| Website | `"open github.com"` | Opens github.com |
| Spotify | `"search dua lipa on spotify"` | Searches Spotify |
| Stop Music | `"stop the song"` | Stops playback |

---

## Bot Server (`npm run start:bot`)

### What it does
- Launches an Express server on http://localhost:3001
- Sends WhatsApp messages via Twilio API
- Validates credentials and handles errors gracefully

### Setup Steps

1. **Get Twilio Credentials:**
   - Go to [Twilio Console](https://console.twilio.com/)
   - Copy your Account SID and Auth Token
   - Navigate to Messaging > Services > WhatsApp
   - Get your Twilio WhatsApp phone number (starts with `whatsapp:+`)

2. **Add to `.env.local`:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```

3. **Run the bot:**
   ```bash
   npm run start:bot
   ```

4. **Expected output:**
   ```
   [Bot] WhatsApp Twilio bot listening on http://localhost:3001
   [Bot] Service: Ready to send messages
   ```

### Testing

Send a test message via curl:
```bash
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "919999999999", "message": "Hello from Lisa!"}'
```

### Twilio Sandbox vs Production

- **Sandbox** (Free): Limited to 25 numbers you whitelist
- **Production** (Paid): Send to any WhatsApp user

For sandbox testing, add your phone number in Twilio Console first.

---

## Tips & Tricks

1. **Add important contacts first** — Use the Contacts button to add family, friends, and colleagues.
2. **Use short messages** — Longer messages might be cut off; keep them concise.
3. **Test voice recognition** — Use the "Type instead" button to test commands as text.
4. **Mute output** — Click the volume icon to mute Lisa's audio responses.
5. **Clear history** — Click the trash icon to clear chat history anytime.

---

## Contributing

This is a personal AI assistant project. Feel free to fork and customize!

---

## License

MIT

---

## Support

For issues or questions, check the troubleshooting section or enable browser console logs for debugging.


