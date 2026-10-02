import { exec, spawn } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

export class WindowsController {
  public static isWindows(): boolean {
    return os.platform() === "win32";
  }

  /**
   * Checks if a process with the given name is currently running.
   */
  public static async isProcessRunning(processName: string): Promise<boolean> {
    const isWin = this.isWindows();
    try {
      if (isWin) {
        const { stdout } = await execAsync(`tasklist /FI "IMAGENAME eq ${processName}" /FO CSV /NH`);
        return stdout.toLowerCase().includes(processName.toLowerCase());
      } else {
        const { stdout } = await execAsync(`pgrep -f "${processName}" || true`);
        return stdout.trim().length > 0;
      }
    } catch {
      return false;
    }
  }

  /**
   * Focuses a running application window on Windows using PowerShell.
   */
  public static async focusWindow(windowTitleSubstring: string): Promise<boolean> {
    if (!this.isWindows()) return true;
    try {
      const psScript = `
        $wshell = New-Object -ComObject Wscript.Shell;
        $proc = Get-Process | Where-Object { $_.MainWindowTitle -like "*${windowTitleSubstring}*" } | Select-Object -First 1;
        if ($proc) {
          $wshell.AppActivate($proc.Id);
          exit 0;
        } else {
          exit 1;
        }
      `;
      await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, " ")}"`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Launches an application binary safely in background without blocking.
   */
  public static launchDetached(executablePath: string, args: string[] = [], cwd?: string): boolean {
    try {
      const child = spawn(executablePath, args, {
        cwd: cwd || os.homedir(),
        detached: true,
        stdio: "ignore",
        shell: this.isWindows()
      });
      child.unref();
      return true;
    } catch (e) {
      console.error(`[AGENT WINDOWS] Failed to launch ${executablePath}:`, e);
      return false;
    }
  }

  /**
   * Gets list of visible open application windows.
   */
  public static async getActiveWindows(): Promise<string[]> {
    if (!this.isWindows()) {
      return ["Active Environment"];
    }
    try {
      const psScript = `Get-Process | Where-Object { $_.MainWindowTitle.Length -gt 0 } | Select-Object -ExpandProperty MainWindowTitle`;
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${psScript}"`);
      return stdout
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } catch {
      return [];
    }
  }

  /**
   * Controlled Keyboard: Type text into active window.
   */
  public static async keyboardType(text: string): Promise<{ success: boolean; message: string }> {
    if (!this.isWindows()) {
      return { success: true, message: `Simulated typed: ${text}` };
    }
    try {
      // Escape special characters for SendKeys
      const safeText = text.replace(/[\{\}\[\]\(\)\+\^\%\~]/g, "{$&}");
      const psScript = `
        Add-Type -AssemblyName System.Windows.Forms;
        [System.Windows.Forms.SendKeys]::SendWait('${safeText.replace(/'/g, "''")}');
      `;
      await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, " ")}"`);
      return { success: true, message: `Typed text into active window.` };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to send keystrokes." };
    }
  }

  /**
   * Controlled Keyboard: Press specific key or hotkey combination (e.g. ^s for Ctrl+S, %{F4} for Alt+F4).
   */
  public static async keyboardHotkey(hotkey: string): Promise<{ success: boolean; message: string }> {
    if (!this.isWindows()) {
      return { success: true, message: `Simulated hotkey: ${hotkey}` };
    }
    try {
      const psScript = `
        Add-Type -AssemblyName System.Windows.Forms;
        [System.Windows.Forms.SendKeys]::SendWait('${hotkey.replace(/'/g, "''")}');
      `;
      await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, " ")}"`);
      return { success: true, message: `Executed hotkey ${hotkey}.` };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to execute hotkey." };
    }
  }

  /**
   * Controlled Mouse: Move cursor to coordinates.
   */
  public static async mouseMove(x: number, y: number): Promise<{ success: boolean; message: string }> {
    if (!this.isWindows()) {
      return { success: true, message: `Moved mouse to (${x}, ${y})` };
    }
    try {
      const psScript = `
        Add-Type -AssemblyName System.Windows.Forms;
        [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${Math.round(x)}, ${Math.round(y)});
      `;
      await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, " ")}"`);
      return { success: true, message: `Mouse positioned at (${x}, ${y}).` };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to move cursor." };
    }
  }

  /**
   * Controlled Mouse: Click at current position or specific coordinates.
   */
  public static async mouseClick(x?: number, y?: number, doubleClick: boolean = false): Promise<{ success: boolean; message: string }> {
    if (!this.isWindows()) {
      return { success: true, message: `Clicked mouse at (${x || 0}, ${y || 0})` };
    }
    try {
      if (typeof x === "number" && typeof y === "number") {
        await this.mouseMove(x, y);
      }
      const clickCount = doubleClick ? 2 : 1;
      const psScript = `
        Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public class MouseInput {
          [DllImport("user32.dll")]
          public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
          public static void Click(int count) {
            for(int i = 0; i < count; i++) {
              mouse_event(0x02, 0, 0, 0, 0); // MOUSEEVENTF_LEFTDOWN
              mouse_event(0x04, 0, 0, 0, 0); // MOUSEEVENTF_LEFTUP
              if (count > 1) System.Threading.Thread.Sleep(100);
            }
          }
        }
"@;
        [MouseInput]::Click(${clickCount});
      `;
      await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, " ")}"`);
      return { success: true, message: `${doubleClick ? "Double-clicked" : "Clicked"} mouse.` };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to execute mouse click." };
    }
  }
}
