export class AgentSecurity {
  // Strict forbidden patterns that will never be executed by the local agent
  private static FORBIDDEN_COMMAND_PATTERNS = [
    /\b(format|diskpart|mkfs)\b/i,
    /\b(del|rmdir|rm)\s+([a-z]:\\|\/)(?!\w)/i,
    /\b(net\s+user|net\s+localgroup)\s+.*\/add/i,
    /\b(reg\s+delete|reg\s+add)\s+hklm/i,
    /\.aws[\\\/]credentials/i,
    /\.ssh[\\\/]id_rsa/i,
    /\b(mimikatz|pwdump)\b/i,
    /\b(curl|wget|certutil)\s+.*(pastebin|temp|drop|webhook)/i
  ];

  public static isSafeCommand(command: string): { safe: boolean; reason?: string } {
    if (!command || !command.trim()) {
      return { safe: false, reason: "Empty command string." };
    }

    for (const pattern of this.FORBIDDEN_COMMAND_PATTERNS) {
      if (pattern.test(command)) {
        return {
          safe: false,
          reason: `Command blocked by local agent security policy: Pattern matched "${pattern.source}"`
        };
      }
    }

    return { safe: true };
  }

  public static sanitizePath(targetPath: string, allowedWorkspaceRoot: string): { safe: boolean; resolvedPath: string; error?: string } {
    const path = require("path");
    try {
      const resolved = path.resolve(targetPath);
      const root = path.resolve(allowedWorkspaceRoot);

      // Must be within root unless explicit permission override
      if (!resolved.toLowerCase().startsWith(root.toLowerCase())) {
        return {
          safe: false,
          resolvedPath: resolved,
          error: `Path "${resolved}" is outside allowed workspace directory "${root}". Access denied.`
        };
      }

      return { safe: true, resolvedPath: resolved };
    } catch (e: any) {
      return { safe: false, resolvedPath: "", error: e?.message || String(e) };
    }
  }
}
