import { WindowsController } from "./windowsController.js";
import { ApplicationController } from "./applicationController.js";

export class ScreenObserver {
  /**
   * Observes current desktop state, active process, and window titles.
   */
  public static async inspectScreen(targetAppName?: string): Promise<{
    activeWindows: string[];
    isTargetRunning: boolean;
    targetAppName?: string;
    screenMessage: string;
  }> {
    const windows = await WindowsController.getActiveWindows();
    let isTargetRunning = false;

    if (targetAppName) {
      const appDef = ApplicationController.matchApplication(targetAppName);
      if (appDef) {
        for (const proc of appDef.processNames) {
          if (await WindowsController.isProcessRunning(proc)) {
            isTargetRunning = true;
            break;
          }
        }
      }
    }

    return {
      activeWindows: windows.slice(0, 10),
      isTargetRunning,
      targetAppName,
      screenMessage: targetAppName
        ? `Application ${targetAppName} is ${isTargetRunning ? "running and active" : "not running"} on desktop.`
        : `Desktop has ${windows.length} active application windows.`
    };
  }
}
