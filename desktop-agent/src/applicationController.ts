import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { RegisteredApplication } from "./types.js";
import { WindowsController } from "./windowsController.js";

const execAsync = promisify(exec);

export class ApplicationController {
  private static REGISTRY: Record<string, RegisteredApplication> = {
    vscode: {
      id: "vscode",
      name: "Visual Studio Code",
      processNames: ["Code.exe", "code"],
      executableNames: ["code.cmd", "code.exe", "code"],
      windowsCandidatePaths: [
        path.join(process.env.LOCALAPPDATA || "", "Programs", "Microsoft VS Code", "Code.exe"),
        path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Microsoft VS Code", "Code.exe"),
        path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Microsoft VS Code", "Code.exe"),
        "C:\\Program Files\\Microsoft VS Code\\bin\\code.cmd",
        "C:\\Users\\Default\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"
      ],
      category: "editor"
    },
    chrome: {
      id: "chrome",
      name: "Google Chrome",
      processNames: ["chrome.exe", "chrome"],
      executableNames: ["chrome.exe", "google-chrome"],
      windowsCandidatePaths: [
        path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
        path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
        path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe")
      ],
      category: "browser"
    },
    edge: {
      id: "edge",
      name: "Microsoft Edge",
      processNames: ["msedge.exe", "msedge"],
      executableNames: ["msedge.exe", "microsoft-edge"],
      windowsCandidatePaths: [
        path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "Microsoft", "Edge", "Application", "msedge.exe"),
        path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Microsoft", "Edge", "Application", "msedge.exe")
      ],
      category: "browser"
    },
    notepad: {
      id: "notepad",
      name: "Notepad",
      processNames: ["notepad.exe", "Notepad.exe"],
      executableNames: ["notepad.exe"],
      windowsCandidatePaths: ["C:\\Windows\\System32\\notepad.exe", "C:\\Windows\\notepad.exe"],
      category: "editor"
    },
    calculator: {
      id: "calculator",
      name: "Calculator",
      processNames: ["CalculatorApp.exe", "calc.exe", "Calculator.exe"],
      executableNames: ["calc.exe"],
      windowsCandidatePaths: ["C:\\Windows\\System32\\calc.exe"],
      category: "utility"
    },
    explorer: {
      id: "explorer",
      name: "File Explorer",
      processNames: ["explorer.exe"],
      executableNames: ["explorer.exe"],
      windowsCandidatePaths: ["C:\\Windows\\explorer.exe"],
      category: "utility"
    },
    terminal: {
      id: "terminal",
      name: "Windows Terminal / PowerShell",
      processNames: ["WindowsTerminal.exe", "powershell.exe", "cmd.exe", "bash"],
      executableNames: ["wt.exe", "powershell.exe", "cmd.exe"],
      windowsCandidatePaths: [
        path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WindowsApps", "wt.exe"),
        "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
        "C:\\Windows\\System32\\cmd.exe"
      ],
      category: "terminal"
    }
  };

  /**
   * Resolves an app query string (e.g. "vs code", "Chrome", "notepad") to an application definition.
   */
  public static matchApplication(query: string): RegisteredApplication | null {
    const q = (query || "").toLowerCase().trim();
    if (q.includes("vs") || q.includes("code")) return this.REGISTRY.vscode;
    if (q.includes("chrome")) return this.REGISTRY.chrome;
    if (q.includes("edge")) return this.REGISTRY.edge;
    if (q.includes("notepad") || q.includes("text")) return this.REGISTRY.notepad;
    if (q.includes("calc")) return this.REGISTRY.calculator;
    if (q.includes("folder") || q.includes("explorer") || q.includes("file")) return this.REGISTRY.explorer;
    if (q.includes("terminal") || q.includes("cmd") || q.includes("powershell")) return this.REGISTRY.terminal;

    return null;
  }

  /**
   * Discovers the executable path for a given application on the host system.
   */
  public static async findExecutable(app: RegisteredApplication): Promise<string | null> {
    // 1. Check known candidate paths on Windows
    for (const p of app.windowsCandidatePaths) {
      try {
        if (fs.existsSync(p)) {
          return p;
        }
      } catch {}
    }

    // 2. Check system PATH via 'where' on Windows or 'which' on Unix
    for (const exe of app.executableNames) {
      try {
        const cmd = os.platform() === "win32" ? `where ${exe}` : `which ${exe}`;
        const { stdout } = await execAsync(cmd);
        const first = stdout.split(/\r?\n/)[0]?.trim();
        if (first && fs.existsSync(first)) {
          return first;
        }
      } catch {}
    }

    // Default to first executable name if all else fails
    return app.executableNames[0] || null;
  }

  /**
   * Opens or focuses the requested application on the host Windows machine.
   */
  public static async openApplication(
    appName: string,
    workspacePath?: string
  ): Promise<{ success: boolean; message: string; output?: string; error?: string }> {
    const appDef = this.matchApplication(appName);
    if (!appDef) {
      return {
        success: false,
        message: `Application "${appName}" is not in the recognized agent registry.`,
        error: "unrecognized_app"
      };
    }

    // 1. Check if process is already running
    let isRunning = false;
    for (const proc of appDef.processNames) {
      if (await WindowsController.isProcessRunning(proc)) {
        isRunning = true;
        break;
      }
    }

    // 2. If already running, bring to focus
    if (isRunning) {
      await WindowsController.focusWindow(appDef.name);
      return {
        success: true,
        message: `${appDef.name} is already running and has been brought to the foreground.`,
        output: `Focused ${appDef.name}`
      };
    }

    // 3. Find executable on disk
    const exePath = await this.findExecutable(appDef);
    if (!exePath) {
      return {
        success: false,
        message: `Boss, ${appDef.name} is system par installed nahi mila. Main ise bina permission ke install nahi karungi.`,
        error: "executable_not_found"
      };
    }

    // 4. Build launch args (e.g. open folder in VS Code)
    const launchArgs: string[] = [];
    if (workspacePath && fs.existsSync(workspacePath)) {
      launchArgs.push(workspacePath);
    }

    // 5. Launch detached process
    const launched = WindowsController.launchDetached(exePath, launchArgs, workspacePath);
    if (!launched) {
      return {
        success: false,
        message: `Boss, ${appDef.name} start karne me problem aayi.`,
        error: "launch_failed"
      };
    }

    // 6. Wait briefly and verify process appeared
    await new Promise((r) => setTimeout(r, 1500));
    let verified = false;
    for (const proc of appDef.processNames) {
      if (await WindowsController.isProcessRunning(proc)) {
        verified = true;
        break;
      }
    }

    return {
      success: true,
      message: `${appDef.name} successfully launched on Windows PC (Process Verified: ${verified}).`,
      output: `Launched ${exePath} [verified: ${verified}]`
    };
  }

  /**
   * Closes an application process by name.
   */
  public static async closeApplication(appName: string): Promise<{ success: boolean; message: string }> {
    const appDef = this.matchApplication(appName);
    if (!appDef) {
      return { success: false, message: `Application "${appName}" not found.` };
    }

    for (const proc of appDef.processNames) {
      try {
        if (os.platform() === "win32") {
          await execAsync(`taskkill /F /IM "${proc}" /T`);
        } else {
          await execAsync(`pkill -f "${proc}"`);
        }
      } catch {}
    }

    return {
      success: true,
      message: `Closed ${appDef.name}.`
    };
  }
}
