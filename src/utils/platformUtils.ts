/**
 * Platform and device detection utilities
 * Helps with cross-platform compatibility
 */

export const Platform = {
  /**
   * Detect operating system
   */
  getOS(): 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown' {
    const ua = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Macintosh|MacPPC|MacIntel|Macintosh/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    
    return 'Unknown';
  },

  /**
   * Detect device type
   */
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent;
    const isTablet = /iPad|Android(?!.*Mobile)/.test(ua);
    const isMobile = /Mobile|iPhone|Android/.test(ua);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  },

  /**
   * Get browser name
   */
  getBrowser(): string {
    const ua = navigator.userAgent;
    
    if (/Chrome/.test(ua)) return 'Chrome';
    if (/Safari/.test(ua)) return 'Safari';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Edge|Edg/.test(ua)) return 'Edge';
    if (/Opera|OPR/.test(ua)) return 'Opera';
    
    return 'Unknown';
  },

  /**
   * Check if app is running in standalone mode (PWA)
   */
  isStandalone(): boolean {
    return !!(
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window as any).fullscreen
    );
  },

  /**
   * Check if app is being viewed in WebView
   */
  isWebView(): boolean {
    const ua = navigator.userAgent;
    return /WebView|wv/.test(ua) || (window as any).cordova !== undefined;
  },
};

export const Features = {
  /**
   * Check if Web Speech API is supported
   */
  isSpeechRecognitionSupported(): boolean {
    const window_any = window as any;
    return !!(
      window_any.SpeechRecognition ||
      window_any.webkitSpeechRecognition ||
      window_any.mozSpeechRecognition ||
      window_any.msSpeechRecognition
    );
  },

  /**
   * Check if Web Audio API is supported
   */
  isAudioContextSupported(): boolean {
    return !!(
      (window as any).AudioContext ||
      (window as any).webkitAudioContext
    );
  },

  /**
   * Check if Service Worker is supported
   */
  isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  },

  /**
   * Check if Notification API is supported
   */
  isNotificationSupported(): boolean {
    return 'Notification' in window;
  },

  /**
   * Check if Vibration API is supported
   */
  isVibrationSupported(): boolean {
    return 'vibrate' in navigator;
  },

  /**
   * Check if localStorage is available
   */
  isLocalStorageSupported(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if IndexedDB is available
   */
  isIndexedDBSupported(): boolean {
    return !!(
      window.indexedDB ||
      (window as any).mozIndexedDB ||
      (window as any).webkitIndexedDB ||
      (window as any).msIndexedDB
    );
  },

  /**
   * Check if Geolocation is available
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  },

  /**
   * Check if Camera is available
   */
  isCameraSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  },

  /**
   * Check if Microphone permission is granted
   */
  async isMicrophoneAvailable(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  },
};

export const Network = {
  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  },

  /**
   * Get connection type
   */
  getConnectionType(): string {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;
    
    if (!connection) return 'unknown';
    return connection.effectiveType || 'unknown';
  },

  /**
   * Get estimated bandwidth
   */
  getDownloadSpeed(): number {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;
    
    if (!connection || !connection.downlink) return 0;
    return connection.downlink; // Mbps
  },

  /**
   * Get estimated latency
   */
  getLatency(): number {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;
    
    if (!connection || !connection.rtt) return 0;
    return connection.rtt; // milliseconds
  },

  /**
   * Check if connection is slow
   */
  isSlowConnection(): boolean {
    const speed = this.getDownloadSpeed();
    return speed > 0 && speed < 1; // Less than 1 Mbps
  },
};

export const Screen = {
  /**
   * Get viewport dimensions
   */
  getViewport(): { width: number; height: number } {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight,
    };
  },

  /**
   * Get device pixel ratio
   */
  getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  },

  /**
   * Check if notch/safe area is present (iPhone X+)
   */
  hasNotch(): boolean {
    return (
      CSS.supports('padding-top', 'max(0px, env(safe-area-inset-top))') ||
      // Fallback for older browsers
      (window.visualViewport?.height || 0) < (window.innerHeight || 0)
    );
  },

  /**
   * Get safe area insets
   */
  getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    const getCSSEnv = (name: string): number => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(
        `--${name}`
      );
      return parseInt(value) || 0;
    };

    return {
      top: getCSSEnv('safe-area-inset-top'),
      right: getCSSEnv('safe-area-inset-right'),
      bottom: getCSSEnv('safe-area-inset-bottom'),
      left: getCSSEnv('safe-area-inset-left'),
    };
  },
};

export const Memory = {
  /**
   * Get device memory if available
   */
  getDeviceMemory(): number {
    return (navigator as any).deviceMemory || 4; // GB, defaults to 4
  },

  /**
   * Get memory status
   */
  getMemoryStatus(): string {
    const memory = this.getDeviceMemory();
    if (memory <= 2) return 'low';
    if (memory <= 4) return 'medium';
    return 'high';
  },
};
