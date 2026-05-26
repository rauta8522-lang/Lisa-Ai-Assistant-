import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';
import { initAnalytics } from "./lib/analytics";
//initAnalytics();

// Register service worker for PWA support
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('App update available. Refreshing...');
    updateSW();
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

// Request persistent storage (for better offline support)
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then(persistent => {
    console.log('Persistent storage granted:', persistent);
  });
}

// Request necessary permissions
if ('permissions' in navigator) {
  navigator.permissions.query({ name: 'microphone' }).then(result => {
    if (result.state === 'prompt') {
      console.log('Microphone permission not granted yet');
    }
  }).catch(() => {
    console.log('Microphone permission query not supported');
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
