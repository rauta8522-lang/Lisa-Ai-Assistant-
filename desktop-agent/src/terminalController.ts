import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import { AgentSecurity } from "./security.js";
import { PermissionManager } from "./permissionManager.js";

const execAsync = promisify(exec);

export class TerminalController {
  private permissionManager: PermissionManager;

  constructor(permissionManager: PermissionManager) {
    this.permissionManager = permissionManager;
  }

  public async runCommand(
    command: string,
    cwd?: string,
    timeoutMs: number = 30000
  ): Promise<{ success: boolean; stdout: string; stderr: string; exitCode: number; error?: string }> {
    const secCheck = AgentSecurity.isSafeCommand(command);
    if (!secCheck.safe) {
      return {
        success: false,
        stdout: "",
        stderr: secCheck.reason || "Blocked by security filter",
        exitCode: 1,
        error: secCheck.reason
      };
    }

    const targetDir = cwd || this.permissionManager.getAllowedWorkspace();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: targetDir,
        timeout: timeoutMs,
        shell: os.platform() === "win32" ? "powershell.exe" : "/bin/bash"
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0
      };
    } catch (err: any) {
      return {
        success: false,
        stdout: err.stdout ? String(err.stdout).trim() : "",
        stderr: err.stderr ? String(err.stderr).trim() : err.message || String(err),
        exitCode: typeof err.code === "number" ? err.code : 1,
        error: err.message || String(err)
      };
    }
  }
}
