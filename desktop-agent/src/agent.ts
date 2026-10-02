import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { AgentConfig } from "./types.js";
import { PermissionManager } from "./permissionManager.js";
import { CommandRouter } from "./commandRouter.js";
import { AgentConnection } from "./connection.js";

const CONFIG_FILE = path.join(os.homedir(), ".lisa-desktop-agent.json");

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function loadOrPairConfig(): Promise<AgentConfig> {
  // Check if saved config exists
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.deviceToken && parsed.serverUrl) {
        console.log(`[CONFIG] Loaded paired device: "${parsed.deviceName}" (${parsed.deviceId})`);
        return parsed;
      }
    } catch {}
  }

  console.log("\n=======================================================");
  console.log("🌸 LISA AI - WINDOWS LOCAL DESKTOP AGENT SETUP");
  console.log("=======================================================\n");
  console.log("This agent securely connects your Windows PC to Lisa AI.");
  console.log("To pair this computer with your Lisa account:");
  console.log("1. Open Lisa Web App -> Settings -> Computer Devices");
  console.log("2. Click 'Pair New Windows PC' to get your 6-digit code.\n");

  const defaultServerUrl = process.env.LISA_SERVER_URL || "https://ais-dev-6uzj2okxqzc3aa4kkfqsg3-316595018791.asia-southeast1.run.app";
  const serverInput = await prompt(`Lisa Server URL [default: ${defaultServerUrl}]: `);
  const serverUrl = (serverInput || defaultServerUrl).replace(/\/+$/, "");

  const code = await prompt("Enter 6-digit Pairing Code: ");
  if (!code || code.length < 4) {
    console.error("❌ Invalid pairing code entered. Exiting.");
    process.exit(1);
  }

  const hostname = os.hostname() || "Windows-PC";
  const deviceName = (await prompt(`Device Name [default: ${hostname}]: `)) || hostname;
  const deviceId = `dev_${os.platform()}_${Math.random().toString(36).substring(2, 10)}`;

  console.log(`\n⏳ Pairing with server at ${serverUrl}...`);

  try {
    const res = await fetch(`${serverUrl}/api/computer/devices/pair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pairingCode: code,
        deviceId,
        deviceName,
        os: `${os.type()} ${os.release()}`,
        agentVersion: "1.0.0"
      })
    });

    const data = await res.json();
    if (!res.ok || !data.deviceToken) {
      console.error(`❌ Pairing Failed: ${data.error || 'Invalid or expired code'}`);
      process.exit(1);
    }

    const config: AgentConfig = {
      serverUrl,
      deviceId,
      deviceName,
      deviceToken: data.deviceToken,
      workspaceDir: path.join(os.homedir(), "Documents", "LisaProjects"),
      allowDestructiveActions: false
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
    console.log(`✅ Pairing Successful! Device token saved to ${CONFIG_FILE}`);
    return config;
  } catch (err: any) {
    console.error("❌ Network error connecting to Lisa server:", err.message);
    process.exit(1);
  }
}

async function main() {
  const config = await loadOrPairConfig();
  const permissionManager = new PermissionManager(config.workspaceDir);
  const router = new CommandRouter(permissionManager);

  console.log(`\n📂 Allowed Workspace Root: ${permissionManager.getAllowedWorkspace()}`);
  console.log("⚡ Starting secure WebSocket bridge...\n");

  const connection = new AgentConnection(config, router, (status) => {
    if (status === "online") {
      console.log("🟢 [STATUS] AGENT ONLINE - Ready to execute Lisa voice commands.");
    } else if (status === "offline") {
      console.log("🔴 [STATUS] AGENT OFFLINE - Retrying connection...");
    }
  });

  connection.connect();

  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down Lisa Desktop Agent...");
    connection.disconnect();
    process.exit(0);
  });
}

main().catch((e) => {
  console.error("Fatal Agent Error:", e);
});
