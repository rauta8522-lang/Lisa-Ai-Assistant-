import os from "os";
import path from "path";
import fs from "fs";

export class PermissionManager {
  private allowedWorkspace: string;

  constructor(customWorkspace?: string) {
    if (customWorkspace && customWorkspace.trim()) {
      this.allowedWorkspace = path.resolve(customWorkspace);
    } else {
      // Default to %USERPROFILE%\Documents\LisaProjects on Windows, or ~/LisaProjects on other OS
      const home = os.homedir();
      this.allowedWorkspace = path.join(home, "Documents", "LisaProjects");
    }

    // Ensure allowed workspace root exists
    try {
      if (!fs.existsSync(this.allowedWorkspace)) {
        fs.mkdirSync(this.allowedWorkspace, { recursive: true });
      }
    } catch (e) {
      console.warn("[AGENT PERMISSION] Failed to initialize default workspace dir:", e);
    }
  }

  public getAllowedWorkspace(): string {
    return this.allowedWorkspace;
  }

  public resolveSafePath(relativePathOrName: string, subfolder?: string): string {
    let target = this.allowedWorkspace;
    if (subfolder && subfolder.trim()) {
      const cleanSub = path.basename(subfolder);
      target = path.join(target, cleanSub);
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
    }

    const cleanName = path.basename(relativePathOrName);
    return path.join(target, cleanName);
  }
}
