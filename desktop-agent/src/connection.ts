import WebSocket from "ws";
import os from "os";
import { AgentConfig, AgentMessage } from "./types.js";
import { CommandRouter } from "./commandRouter.js";

export class AgentConnection {
  private config: AgentConfig;
  private router: CommandRouter;
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private onStatusChange?: (status: "connecting" | "online" | "offline" | "unauthorized") => void;

  constructor(
    config: AgentConfig,
    router: CommandRouter,
    onStatusChange?: (status: "connecting" | "online" | "offline" | "unauthorized") => void
  ) {
    this.config = config;
    this.router = router;
    this.onStatusChange = onStatusChange;
  }

  public connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.isConnecting = true;
    this.onStatusChange?.("connecting");

    const baseWsUrl = this.config.serverUrl
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:");

    const wsUrl = `${baseWsUrl}/ws/desktop-agent?token=${encodeURIComponent(this.config.deviceToken || "")}&deviceId=${encodeURIComponent(this.config.deviceId)}&name=${encodeURIComponent(this.config.deviceName)}`;

    console.log(`[LisaAgent] Connecting to ${baseWsUrl}/ws/desktop-agent...`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.on("open", () => {
        this.isConnecting = false;
        console.log(`[LisaAgent] Authentication successful`);
        console.log(`[LisaAgent] WebSocket connected`);
        console.log(`[LisaAgent] Registered device "${this.config.deviceName}" (${this.config.deviceId})`);
        console.log(`[LisaAgent] Heartbeat started`);
        this.onStatusChange?.("online");

        // Send auth handshake
        this.send({
          type: "auth",
          token: this.config.deviceToken,
          deviceId: this.config.deviceId,
          deviceName: this.config.deviceName,
          os: `${os.type()} ${os.release()} (${os.arch()})`,
          agentVersion: "1.0.0"
        });

        // Setup ping interval
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          this.send({ type: "ping" });
        }, 15000);
      });

      this.ws.on("message", async (data) => {
        try {
          const raw = data.toString();
          const msg = JSON.parse(raw) as AgentMessage;

          if (msg.type === "pong") {
            return;
          }

          if (msg.type === "command") {
            console.log(`[LisaAgent] Received command "${msg.tool}" (Req: ${msg.requestId})`);
            const resultMsg = await this.router.executeCommand(msg);
            this.send(resultMsg);
            console.log(`[LisaAgent] Result sent for "${msg.tool}" (Success: ${resultMsg.success})`);
          }
        } catch (err: any) {
          console.error(`[LisaAgent] Execution error:`, err?.message || String(err));
        }
      });

      this.ws.on("close", (code, reason) => {
        this.isConnecting = false;
        if (this.pingInterval) clearInterval(this.pingInterval);
        console.warn(`[LisaAgent] Connection lost (Code: ${code}, Reason: ${reason.toString() || "Disconnected"}). Reconnecting in 5s...`);
        this.onStatusChange?.("offline");
        this.scheduleReconnect();
      });

      this.ws.on("error", (err) => {
        this.isConnecting = false;
        console.error(`[LisaAgent] WebSocket error: ${err.message}`);
      });
    } catch (e: any) {
      this.isConnecting = false;
      console.error(`[LisaAgent] Connection exception: ${e?.message || String(e)}`);
      this.scheduleReconnect();
    }
  }

  public send(msg: AgentMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  public disconnect(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatusChange?.("offline");
  }
}
