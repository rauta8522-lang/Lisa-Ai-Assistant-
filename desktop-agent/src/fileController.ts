import fs from "fs";
import path from "path";
import { PermissionManager } from "./permissionManager.js";
import { AgentSecurity } from "./security.js";

export class FileController {
  private permissionManager: PermissionManager;

  constructor(permissionManager: PermissionManager) {
    this.permissionManager = permissionManager;
  }

  public createFolder(folderPathOrName: string): { success: boolean; path: string; error?: string } {
    try {
      const allowedRoot = this.permissionManager.getAllowedWorkspace();
      let target = folderPathOrName;
      if (!path.isAbsolute(target)) {
        target = path.join(allowedRoot, folderPathOrName);
      }

      const check = AgentSecurity.sanitizePath(target, allowedRoot);
      if (!check.safe) {
        return { success: false, path: target, error: check.error };
      }

      fs.mkdirSync(check.resolvedPath, { recursive: true });
      return { success: true, path: check.resolvedPath };
    } catch (e: any) {
      return { success: false, path: folderPathOrName, error: e?.message || String(e) };
    }
  }

  public writeFile(
    fileName: string,
    content: string,
    workspacePath?: string
  ): { success: boolean; filePath: string; bytesWritten: number; error?: string } {
    try {
      const allowedRoot = this.permissionManager.getAllowedWorkspace();
      const baseDir = workspacePath ? path.resolve(workspacePath) : allowedRoot;

      const checkDir = AgentSecurity.sanitizePath(baseDir, allowedRoot);
      if (!checkDir.safe) {
        return { success: false, filePath: baseDir, bytesWritten: 0, error: checkDir.error };
      }

      if (!fs.existsSync(checkDir.resolvedPath)) {
        fs.mkdirSync(checkDir.resolvedPath, { recursive: true });
      }

      const fullPath = path.join(checkDir.resolvedPath, path.basename(fileName));
      fs.writeFileSync(fullPath, content, "utf8");

      return {
        success: true,
        filePath: fullPath,
        bytesWritten: Buffer.byteLength(content, "utf8")
      };
    } catch (e: any) {
      return { success: false, filePath: fileName, bytesWritten: 0, error: e?.message || String(e) };
    }
  }

  public readFile(fileName: string, workspacePath?: string): { success: boolean; content: string; error?: string } {
    try {
      const allowedRoot = this.permissionManager.getAllowedWorkspace();
      const baseDir = workspacePath ? path.resolve(workspacePath) : allowedRoot;
      const fullPath = path.join(baseDir, path.basename(fileName));

      if (!fs.existsSync(fullPath)) {
        return { success: false, content: "", error: `File "${fileName}" does not exist in ${baseDir}.` };
      }

      const content = fs.readFileSync(fullPath, "utf8");
      return { success: true, content };
    } catch (e: any) {
      return { success: false, content: "", error: e?.message || String(e) };
    }
  }

  public listDirectory(dirPath?: string): { success: boolean; files: string[]; path: string; error?: string } {
    try {
      const allowedRoot = this.permissionManager.getAllowedWorkspace();
      const target = dirPath ? path.resolve(dirPath) : allowedRoot;

      if (!fs.existsSync(target)) {
        return { success: false, files: [], path: target, error: "Directory does not exist." };
      }

      const entries = fs.readdirSync(target);
      return { success: true, files: entries, path: target };
    } catch (e: any) {
      return { success: false, files: [], path: dirPath || "", error: e?.message || String(e) };
    }
  }
}
