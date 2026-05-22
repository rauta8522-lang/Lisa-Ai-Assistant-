<div align="center">
<h1>Lisa - AI Voice Assistant 🎤</h1>
<p>Your personal voice-controlled AI assistant with WhatsApp messaging, YouTube, and more.</p>
<p>
  <strong>Works on Android • iPhone • Desktop • Tablet • Laptop</strong>
</p>
</div>

## 🚀 Features

- 🎙️ **Voice Control** - Natural voice commands with Web Speech API
- 🤖 **AI Powered** - Google Gemini AI backend
- 📱 **Cross-Platform** - Android, iPhone, Desktop, all modern browsers
- 📲 **PWA Support** - Install as native app on any device
- 💬 **Chat Interface** - Text or voice input
- 🎵 **YouTube Integration** - Play songs by voice command
- 💾 **Offline Ready** - Partial offline support with Service Worker
- 🔒 **Secure** - No data stored on servers
- ⚡ **Fast** - Built with Vite & React
- 📊 **Responsive** - Beautiful on any screen size

## ⚡ Quick Start

### Prerequisites
- Node.js v18+ (https://nodejs.org/)
- Modern web browser
- Google Gemini API Key (free) from https://aistudio.google.com/app/apikey

### 1. Clone or Download

```bash
git clone <repository>
cd remix_-lisa---ai-voice-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env and add your Gemini API key
# VITE_GEMINI_API_KEY=your_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
# Opens at http://localhost:3000
```

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## 📱 Platform-Specific Setup

### Desktop/Laptop (Windows, Mac, Linux)

1. Open http://localhost:3000 in your browser
2. Allow microphone access when prompted
3. Click "Start Session" to use voice commands
4. Or type messages in the chat box

### Android Phone

**Option 1: Web Version (Recommended)**
```
1. On same WiFi as desktop: http://your_ip:3000
2. Or use cloud URL: https://yourdomain.com
3. Allow microphone permission
4. Tap menu → "Install app"
```

**Option 2: Android App (Future)**
- Coming soon via React Native

### iPhone/iPad

**Option 1: Web Version (Recommended)**
```
1. Open Safari: http://your_ip:3000 or https://yourdomain.com
2. Tap Share → "Add to Home Screen"
3. Tap "Add"
4. Open from home screen and allow microphone
```

**Option 2: iOS App (Future)**
- Coming soon via React Native

### Tablet

- Same as Android/iPhone
- Larger UI automatically optimizes for tablet screens

---

## 🌐 Deployment Options

### Option 1: Local Network (Easiest)

```bash
# Find your IP address
# Windows: ipconfig | findstr IPv4
# Mac/Linux: ifconfig | grep inet

# Run dev server with --host
npm run dev

# Access from other devices on same WiFi:
# http://your_ip_address:3000
```

### Option 2: Docker Deployment

```bash
# Build image
docker build -t lisa-app .

# Run container
docker run -p 3000:3000 -e VITE_GEMINI_API_KEY=your_key lisa-app

# Or use Docker Compose (easiest)
docker-compose up -d
```

### Option 3: Cloud Deployment

#### Vercel (Recommended - Free)
```bash
npm install -g vercel
vercel
# Set VITE_GEMINI_API_KEY in dashboard
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy
# Set environment variables in dashboard
```

#### Heroku
```bash
heroku create your-app-name
heroku config:set VITE_GEMINI_API_KEY=your_key
git push heroku main
```

#### Railway.app (Recommended)
- Connect GitHub repo
- Add VITE_GEMINI_API_KEY in variables
- Auto-deploys on push

#### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://your-bucket
# Setup CloudFront for HTTPS
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Required
VITE_GEMINI_API_KEY=your_google_gemini_api_key

# Optional
VITE_YOUTUBE_API_KEY=your_youtube_api_key
APP_URL=https://yourdomain.com
VITE_LOG_LEVEL=info
```

### Customization

Edit `src/services/geminiService.ts` to customize Lisa's personality:

```javascript
const systemInstruction = `Your name is Lisa. You are...`
```

---

## 📦 PWA Installation

### Chrome/Edge
1. Open your app URL
2. Click menu ⋮ → "Install app"
3. Click "Install"

### Firefox
1. Open your app URL
2. Click menu ☰ → "Install" (if available)

### Safari (iPhone)
1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Name your app and tap "Add"

### Samsung Internet
1. Similar to Chrome process

---

## 🛠️ Development

### Project Structure

```
src/
├── components/       # React components
│   ├── Visualizer.tsx
│   ├── PermissionModal.tsx
│   └── ContactsManager.tsx
├── services/        # API & backend logic
│   ├── geminiService.ts
│   ├── liveService.ts
│   └── commandService.ts
├── utils/          # Utilities
│   ├── audioUtils.ts
│   └── platformUtils.ts
├── App.tsx         # Main app
└── main.tsx        # Entry point
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check TypeScript
npm run clean        # Clean build files
npm run start:bot    # Start Twilio WhatsApp bot
```

### Adding Features

1. Create new components in `src/components/`
2. Add services in `src/services/`
3. Update `src/App.tsx` to use new features
4. Test on multiple devices

---

## 🔐 Security & Privacy

- ✅ No data is stored on servers
- ✅ Chat history stored only in localStorage (local device only)
- ✅ API calls go directly to Google/Twilio
- ✅ HTTPS recommended for production
- ✅ Microphone access requires user permission

### Best Practices

1. Use HTTPS in production
2. Keep API keys in environment variables
3. Enable CORS properly
4. Validate input on backend
5. Implement rate limiting

---

## 🐛 Troubleshooting

### Microphone Not Working

```
1. Check browser permissions:
   Settings → Privacy → Microphone → Allow [website]

2. Try another browser

3. Check console for errors (F12)

4. Ensure HTTPS (except localhost)
```

### Audio Not Playing

```
1. Unmute the app (check header icons)

2. Check device volume

3. Try refreshing page

4. Check if Web Audio API is supported
```

### PWA Installation Failed

```
1. Use HTTPS (except localhost)
2. Clear browser cache
3. Check manifest.webmanifest
4. Ensure service worker is loaded
```

### API Key Issues

```bash
# Check env variables
echo $VITE_GEMINI_API_KEY

# Verify key works:
# Visit: https://aistudio.google.com/app/apikey

# For production:
# Set in cloud provider's dashboard
```

---

## 📊 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Samsung Internet | 14+ | ✅ Full |
| Opera | 76+ | ✅ Full |

---

## 🎯 Roadmap

- [ ] React Native app (Android & iOS)
- [ ] Multi-language support
- [ ] Custom voice (TTS improvements)
- [ ] Cloud sync for chat history
- [ ] Advanced commands system
- [ ] Plugin system
- [ ] Analytics dashboard
- [ ] Team/shared instances

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test on multiple devices
5. Submit pull request

---

## 📄 License

MIT License - feel free to use for personal and commercial projects

---

## 💬 Support

- 📖 Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment
- 🐛 Report bugs on GitHub Issues
- 💡 Suggest features on GitHub Discussions
- 📧 Email: your_email@example.com

---

<div align="center">
  <p><strong>Made with ❤️ for AI enthusiasts</strong></p>
  <p>Star ⭐ if you found this helpful!</p>
</div>
