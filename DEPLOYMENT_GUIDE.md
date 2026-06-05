# Lisa - AI Voice Assistant - Deployment Guide

यह गाइड आपकी ऐप को सभी डिवाइस (Android, iPhone, Laptop, Mobile, Web) पर चलाने के लिए पूर्ण निर्देश प्रदान करती है।

## 🚀 Features

✅ **Progressive Web App (PWA)** - ऐप की तरह काम करता है
✅ **Cross-Platform** - सभी डिवाइस पर काम करता है
✅ **Offline Support** - बिना इंटरनेट के काम करे (कुछ features के साथ)
✅ **Responsive Design** - Mobile, Tablet, Desktop सब पर optimize
✅ **Voice Support** - सभी modern browsers पर voice recognition
✅ **PWA Installation** - "Add to Home Screen" support

## 📋 Requirements

- Node.js 18+ (https://nodejs.org/)
- npm या yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)
- VITE_GEMINI_API_KEY (Google Gemini API Key)

## 🔧 Installation & Setup

### 1. Desktop/Laptop पर चलाना

```bash
# Clone या download करें
cd remix_-lisa---ai-voice-assistant

# Dependencies install करें
npm install

# .env फ़ाइल बनाएं
cp .env.example .env

# अपना Gemini API key add करें
# .env में: VITE_GEMINI_API_KEY=your_api_key_here

# Development mode में चलाएं
npm run dev

# Browser में खोलें
http://localhost:3000
```

### 2. Production के लिए Build करें

```bash
# Build करें
npm run build

# Production में test करें
npm run preview

# Browser में खोलें
http://localhost:4173
```

## 📱 Mobile Devices पर Access करना

### Android & iPhone (Web Version)

1. **Same Network पर:**
   - Desktop पर `npm run dev` चलाएं
   - Mobile पर अपने Desktop का IP address खोलें:
   ```
   http://your_desktop_ip:3000
   ```

2. **Internet पर (Cloud Deployment):**
   - आगे देखें "Cloud Deployment" section

3. **PWA के रूप में Install करें:**
   - Chrome/Safari में URL खोलें
   - Menu → "Install app" या "Add to Home Screen"
   - एक icon desktop पर appear होगा

## 🐳 Docker से Deploy करें

### सभी Devices पर आसानी से काम करे

```bash
# Docker install करें (https://www.docker.com/products/docker-desktop)

# Image build करें
docker build -t lisa-ai .

# Container run करें
docker run -p 3000:3000 -e VITE_GEMINI_API_KEY=your_key lisa-ai
```

### Docker Compose से (सबसे आसान)

```bash
# .env file में API key set करें
echo "VITE_GEMINI_API_KEY=your_api_key" > .env

# Deploy करें
docker-compose up -d

# Stop करने के लिए
docker-compose down
```

## ☁️ Cloud Deployment

### 1. **Vercel पर Deploy करें** (सबसे आसान)

```bash
# Vercel CLI install करें
npm install -g vercel

# Deploy करें
vercel

# Environment variables set करें
# Dashboard → Settings → Environment Variables
# VITE_GEMINI_API_KEY = your_key
```

### 2. **Netlify पर Deploy करें**

```bash
# Netlify CLI install करें
npm install -g netlify-cli

# Deploy करें
netlify deploy
```

### 3. **Heroku पर Deploy करें**

```bash
# Heroku CLI install करें (https://devcenter.heroku.com/articles/heroku-cli)

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set VITE_GEMINI_API_KEY=your_key

# Deploy करें
git push heroku main
```

### 4. **Railway.app पर Deploy करें**

- Railway.app खोलें
- "New Project" → "GitHub"
- Repository connect करें
- Environment variables add करें
- Auto deploy होगा

### 5. **AWS पर Deploy करें**

```bash
# AWS CLI install करें

# S3 bucket create करें
aws s3 mb s3://lisa-app-bucket

# Build करें
npm run build

# S3 को deploy करें
aws s3 sync dist/ s3://lisa-app-bucket
```

## 🔐 Security Configuration

### 1. CORS Settings (यदि backend API use कर रहे हो)

```javascript
// server configuration में:
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://yourdomain.com',
    'https://yourapp.netlify.app'
  ],
  credentials: true
}));
```

### 2. Environment Variables Protection

- कभी भी `.env` file को public न करें
- Git में `.env` को ignore करें (already done in .gitignore)
- Production में env vars securely set करें

### 3. API Key Security

```javascript
// Frontend में कभी भी API key expose न करें
// Proxy के through access करें:
if (process.env.VITE_GEMINI_API_KEY) {
  // Backend से proxy करें
}
```

## 📥 Installation Methods

### Method 1: Chrome/Edge पर Install करें

1. `http://your-url` खोलें
2. Menu → "Install app" click करें
3. "Install" confirm करें
4. Home screen पर icon appear होगा

### Method 2: Safari (iPhone) पर Install करें

1. Safari में URL खोलें
2. Share button → "Add to Home Screen"
3. Name दें और "Add" करें
4. Home screen पर access करें

### Method 3: Android Chrome पर Install करें

1. Chrome में URL खोलें
2. Menu (⋮) → "Install app"
3. "Install" confirm करें
4. App drawer में icon appear होगा

## 🌐 URL Sharing

अपनी ऐप को किसी भी device पर share करने के लिए:

### Local Network (Same WiFi):
```
http://192.168.1.100:3000
(अपना actual IP address use करें)
```

### Over Internet:
```
https://yourdomain.com
https://yourapp.netlify.app
https://yourapp.vercel.app
```

## 📊 Monitoring & Logs

### Local Development:
```bash
# Browser DevTools खोलें (F12)
# Console देखें
# Network tab से API calls check करें
```

### Production Logs:
```bash
# Docker logs
docker logs container_id

# Cloud provider dashboard से देखें
# (Vercel, Netlify, Heroku, Railway, etc.)
```

## 🔄 Updates & Maintenance

### Auto-Update (PWA Feature):
- Service Worker automatically new updates check करता है
- User को notification मिलता है
- Background में update होता है
- Next visit पर new version load होता है

### Manual Update:
```bash
# Code update करें
git pull

# Rebuild करें
npm run build

# Deploy करें
# (Vercel/Netlify auto-deploys)
# Docker के लिए: docker-compose up -d --build
```

## 🚨 Troubleshooting

### Microphone Access Not Working

```javascript
// Check करें कि browser का permission दिया गया है:
// Settings → Privacy → Microphone → Allow
```

### AudioContext Suspended (Mobile)

```javascript
// Automatically fixed in the app
// User को first interaction के बाद audio work करता है
```

### PWA Install न हो रहा?

- HTTPS use करें (local development के अलावा)
- manifest.webmanifest file check करें
- Service worker properly registered है?

### API Key Issues

```bash
# Check करें:
echo $VITE_GEMINI_API_KEY

# .env में सही है?
cat .env

# API key valid है?
# Google AI Studio से verify करें
```

## 📈 Performance Optimization

```javascript
// Already implemented:
// ✅ Code splitting
// ✅ Lazy loading
// ✅ Caching with Service Worker
// ✅ Image optimization
// ✅ Min files
```

## 🎯 Best Practices

1. **Mobile Users के लिए:**
   - "Add to Home Screen" promote करें
   - Offline functionality explain करें
   - Network status check करें

2. **Performance के लिए:**
   - CDN use करें (Vercel, Netlify default करते हैं)
   - Service Worker caching use करें
   - API responses cache करें

3. **Security के लिए:**
   - HTTPS हमेशा use करें
   - API keys protect रखें
   - CORS properly configure करें

## 📞 Support

Issues होने पर:

1. Browser console check करें (F12)
2. Network tab में API calls देखें
3. Service Worker status check करें
4. Cache clear करने की कोशिश करें

## 🎉 Deployment Checklist

- [ ] API key set किया?
- [ ] Build success किया?
- [ ] Local में test किया?
- [ ] Mobile पर test किया?
- [ ] PWA install tested?
- [ ] HTTPS enabled?
- [ ] Custom domain setup (optional)?
- [ ] Analytics setup (optional)?

---

**Happy deploying!** 🚀

किसी भी सवाल के लिए कृपया GitHub Issues खोलें।
