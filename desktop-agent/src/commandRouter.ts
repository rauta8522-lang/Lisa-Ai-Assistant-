import { AgentMessage, ComputerToolName } from "./types.js";
import { ApplicationController } from "./applicationController.js";
import { FileController } from "./fileController.js";
import { TerminalController } from "./terminalController.js";
import { ScreenObserver } from "./screenObserver.js";
import { PermissionManager } from "./permissionManager.js";
import { WindowsController } from "./windowsController.js";

export class CommandRouter {
  private permissionManager: PermissionManager;
  private fileController: FileController;
  private terminalController: TerminalController;

  constructor(permissionManager: PermissionManager) {
    this.permissionManager = permissionManager;
    this.fileController = new FileController(permissionManager);
    this.terminalController = new TerminalController(permissionManager);
  }

  public async executeCommand(msg: AgentMessage): Promise<AgentMessage> {
    const startTime = Date.now();
    const tool = msg.tool as ComputerToolName;
    const params = msg.params || {};

    let output = "";
    let isSuccessful = true;
    let errorMessage: string | undefined = undefined;
    let verification: any = {};

    try {
      switch (tool) {
        case "open_application": {
          const appName = params.appName || "Visual Studio Code";
          const res = await ApplicationController.openApplication(appName, params.workspacePath);
          isSuccessful = res.success;
          output = res.message;
          errorMessage = res.error;
          verification.processRunning = res.success;
          break;
        }

        case "focus_application":
        case "window_focus": {
          const appName = params.appName || "Visual Studio Code";
          const focused = await WindowsController.focusWindow(appName);
          isSuccessful = focused;
          output = focused ? `Focused ${appName} window on desktop.` : `Could not focus ${appName}. Window not found.`;
          break;
        }

        case "close_application": {
          const appName = params.appName || "Visual Studio Code";
          const res = await ApplicationController.closeApplication(appName);
          isSuccessful = res.success;
          output = res.message;
          break;
        }

        case "create_folder": {
          const folder = params.folderPath || "project";
          const res = this.fileController.createFolder(folder);
          isSuccessful = res.success;
          output = res.success ? `Created folder at ${res.path}` : `Failed to create folder: ${res.error}`;
          errorMessage = res.error;
          verification.fileCreated = res.success;
          break;
        }

        case "create_file":
        case "write_file":
        case "save_file": {
          const fileName = params.fileName || "script.py";
          const content = params.content || "";
          const res = this.fileController.writeFile(fileName, content, params.workspacePath);
          isSuccessful = res.success;
          output = res.success
            ? `Saved ${fileName} (${res.bytesWritten} bytes) on Windows PC at ${res.filePath}`
            : `Failed to write file: ${res.error}`;
          errorMessage = res.error;
          verification.fileCreated = res.success;
          break;
        }

        case "read_file": {
          const fileName = params.fileName || "";
          const res = this.fileController.readFile(fileName, params.workspacePath);
          isSuccessful = res.success;
          output = res.success ? res.content : `Error reading file: ${res.error}`;
          errorMessage = res.error;
          break;
        }

        case "list_directory": {
          const res = this.fileController.listDirectory(params.folderPath || params.workspacePath);
          isSuccessful = res.success;
          output = res.success ? res.files.join("\n") : `Error listing directory: ${res.error}`;
          errorMessage = res.error;
          break;
        }

        case "run_command": {
          const cmd = params.command || "";
          const res = await this.terminalController.runCommand(cmd, params.cwd || params.workspacePath);
          isSuccessful = res.success;
          output = res.stdout || res.stderr || (res.success ? "Command executed successfully." : "Execution failed");
          errorMessage = res.error;
          verification.exitCode = res.exitCode;
          break;
        }

        case "verify_command_result": {
          const cmd = params.command || "";
          const res = await this.terminalController.runCommand(cmd, params.cwd || params.workspacePath);
          isSuccessful = res.success;
          output = res.stdout || res.stderr;
          verification.exitCode = res.exitCode;
          break;
        }

        case "inspect_screen":
        case "take_screenshot": {
          const appName = params.appName;
          const obs = await ScreenObserver.inspectScreen(appName);
          output = obs.screenMessage;
          isSuccessful = true;
          break;
        }

        case "type_text":
        case "keyboard_type": {
          const textToType = params.text || "";
          const res = await WindowsController.keyboardType(textToType);
          isSuccessful = res.success;
          output = res.message;
          errorMessage = res.success ? undefined : res.message;
          break;
        }

        case "press_key":
        case "keyboard_press":
        case "keyboard_hotkey": {
          const key = params.key || params.hotkey || "";
          const res = await WindowsController.keyboardHotkey(key);
          isSuccessful = res.success;
          output = res.message;
          errorMessage = res.success ? undefined : res.message;
          break;
        }

        case "click":
        case "mouse_click": {
          const res = await WindowsController.mouseClick(params.x, params.y, false);
          isSuccessful = res.success;
          output = res.message;
          errorMessage = res.success ? undefined : res.message;
          break;
        }

        case "mouse_double_click": {
          const res = await WindowsController.mouseClick(params.x, params.y, true);
          isSuccessful = res.success;
          output = res.message;
          errorMessage = res.success ? undefined : res.message;
          break;
        }

        case "mouse_move": {
          const res = await WindowsController.mouseMove(params.x || 0, params.y || 0);
          isSuccessful = res.success;
          output = res.message;
          errorMessage = res.success ? undefined : res.message;
          break;
        }

        default: {
          output = `Agent action "${tool}" processed.`;
          isSuccessful = true;
          break;
        }
      }
    } catch (err: any) {
      isSuccessful = false;
      output = "";
      errorMessage = err?.message || String(err);
    }

    const durationMs = Date.now() - startTime;

    return {
      type: "result",
      requestId: msg.requestId,
      taskId: msg.taskId,
      tool: msg.tool,
      success: isSuccessful,
      output,
      error: errorMessage,
      durationMs,
      verification,
      observation: {
        timestamp: Date.now(),
        application: params.appName || "Windows OS",
        isSuccessful,
        message: output
      }
    };
  }
}
