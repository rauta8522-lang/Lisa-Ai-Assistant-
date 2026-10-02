import { ComputerToolName, ComputerApplication, ComputerObservation } from "./ComputerTaskTypes";
import { ComputerObserver } from "./ComputerObserver";

export interface ExecutionResult {
  success: boolean;
  tool: ComputerToolName;
  output: string;
  error?: string;
  durationMs: number;
  observation?: ComputerObservation;
}

export class ComputerActionExecutor {
  // Built-in extensible application registry
  private static APP_REGISTRY: Record<string, ComputerApplication> = {
    vscode: {
      id: "vscode",
      name: "Visual Studio Code",
      category: "editor",
      command: "code",
      fileExtensions: [".ts", ".js", ".py", ".html", ".css", ".json", ".md", ".cpp", ".java"]
    },
    chrome: {
      id: "chrome",
      name: "Google Chrome",
      category: "browser",
      command: "google-chrome"
    },
    notepad: {
      id: "notepad",
      name: "Notepad / Text Editor",
      category: "editor",
      command: "notepad",
      fileExtensions: [".txt", ".log", ".md"]
    },
    terminal: {
      id: "terminal",
      name: "Terminal Console",
      category: "terminal",
      command: "bash"
    },
    calculator: {
      id: "calculator",
      name: "Calculator",
      category: "utility",
      command: "calc"
    },
    explorer: {
      id: "explorer",
      name: "File Explorer",
      category: "utility",
      command: "explorer"
    }
  };

  /**
   * Resolves an application name/alias to registered application record.
   */
  public static resolveApplication(input: string): ComputerApplication {
    const norm = (input || "").toLowerCase().trim();
    if (norm.includes("code") || norm.includes("vs")) return this.APP_REGISTRY.vscode;
    if (norm.includes("chrome") || norm.includes("browser")) return this.APP_REGISTRY.chrome;
    if (norm.includes("notepad") || norm.includes("text")) return this.APP_REGISTRY.notepad;
    if (norm.includes("terminal") || norm.includes("cmd") || norm.includes("bash")) return this.APP_REGISTRY.terminal;
    if (norm.includes("calc")) return this.APP_REGISTRY.calculator;
    if (norm.includes("folder") || norm.includes("file") || norm.includes("explorer")) return this.APP_REGISTRY.explorer;

    return {
      id: norm.replace(/\s+/g, "_"),
      name: input,
      category: "utility",
      command: norm
    };
  }

  /**
   * Executes a structured computer tool action.
   * If running in browser environment, routes via `/api/computer/execute`.
   */
  public static async executeAction(
    tool: ComputerToolName,
    params: Record<string, any>,
    context?: {
      taskId?: string;
      workspacePath?: string;
      token?: string;
      organizationId?: string;
    }
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    // If in browser context, send to backend proxy
    if (typeof window !== "undefined" && typeof fetch !== "undefined") {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (context?.token) {
          headers["Authorization"] = `Bearer ${context.token}`;
        }
        const res = await fetch("/api/computer/execute", {
          method: "POST",
          headers,
          body: JSON.stringify({
            tool,
            params,
            taskId: context?.taskId,
            workspacePath: context?.workspacePath,
            organizationId: context?.organizationId
          })
        });

        const data = await res.json();
        const durationMs = Date.now() - startTime;
        if (!res.ok || data.error) {
          return {
            success: false,
            tool,
            output: data.output || "",
            error: data.error || `HTTP ${res.status}`,
            durationMs
          };
        }

        return {
          success: data.success ?? true,
          tool,
          output: data.output || "Action executed successfully.",
          durationMs,
          observation: data.observation
        };
      } catch (err: any) {
        return {
          success: false,
          tool,
          output: "",
          error: err?.message || String(err),
          durationMs: Date.now() - startTime
        };
      }
    }

    // Direct in-memory execution fallback (e.g. during headless unit testing)
    const durationMs = Date.now() - startTime;
    return {
      success: true,
      tool,
      output: `Executed ${tool} with parameters: ${JSON.stringify(params)}`,
      durationMs,
      observation: ComputerObserver.inspectScreen(params.appName || "Visual Studio Code")
    };
  }
}
