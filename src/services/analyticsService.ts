import { auth } from "../config/firebase";

export type LisaAnalyticsEvent =
  | "user_registered"
  | "login"
  | "session_started"
  | "session_resumed"
  | "message_sent"
  | "message_completed"
  | "voice_started"
  | "voice_ended"
  | "voice_reconnected"
  | "document_uploaded"
  | "document_processed"
  | "document_question"
  | "persona_activated"
  | "persona_reset"
  | "knowledge_search"
  | "knowledge_source_used"
  | "animal_sound_played"
  | "safety_triggered"
  | "error_occurred"
  | "feature_opened"
  | "greeting_generated"
  | "greeting_played"
  | "greeting_skipped"
  | "computer_task_started"
  | "computer_task_planned"
  | "computer_action_executed"
  | "computer_action_failed"
  | "computer_task_completed"
  | "computer_task_cancelled"
  | "computer_permission_requested"
  | "computer_permission_granted"
  | "computer_permission_denied"
  | "computer_task_recovered"
  | "computer_task_reconnect_resumed";

export interface AnalyticsMetadata {
  feature?: string;
  success?: boolean;
  latency?: number;
  errorCategory?: string;
  organization?: string;
  device?: string;
  platform?: string;
  [key: string]: any;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private anonymousId: string;

  private constructor() {
    this.anonymousId = this.getOrCreateAnonymousId();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getOrCreateAnonymousId(): string {
    if (typeof localStorage === "undefined") {
      return "anon_" + Math.random().toString(36).substring(2, 15);
    }
    let id = localStorage.getItem("lisa_anonymous_id");
    if (!id) {
      id = "anon_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("lisa_anonymous_id", id);
    }
    return id;
  }

  public async track(event: LisaAnalyticsEvent, metadata: AnalyticsMetadata = {}) {
    try {
      const timestamp = new Date().toISOString();
      const user = auth.currentUser;
      const uid = user ? user.uid : this.anonymousId;
      const email = user ? user.email : "anonymous";

      const payload = {
        event,
        uid,
        email,
        timestamp,
        metadata: {
          ...metadata,
          platform: "web",
          device: navigator.userAgent
        }
      };

      // Also log locally for debugging if needed
      console.log(`[ANALYTICS] ${event}`, payload);

      // Fire and forget to avoid blocking UI
      this.sendToServer(payload);
    } catch (e) {
      console.warn("[ANALYTICS] Tracking error:", e);
    }
  }

  private async sendToServer(payload: any) {
    if (typeof window === "undefined") return;
    try {
      let token: string | undefined = undefined;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      }).catch(e => console.warn("[ANALYTICS] Server send failed:", e));
    } catch (e) {}
  }
}

export const analytics = AnalyticsService.getInstance();
