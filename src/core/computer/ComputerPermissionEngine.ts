import { ComputerToolName, RiskLevel, PermissionEvaluation } from "./ComputerTaskTypes";

export class ComputerPermissionEngine {
  // Disallowed sensitive patterns that are strictly blocked under all circumstances
  private static FORBIDDEN_PATTERNS = [
    /\.env\b/i,
    /id_rsa/i,
    /\.aws\/credentials/i,
    /\.ssh\b/i,
    /password/i,
    /passwd\b/i,
    /shadow\b/i,
    /api[-_]?key/i,
    /secret[-_]?key/i,
    /private[-_]?key/i,
    /token\b/i,
    /\b(wget|curl)\s+https?:\/\/.*(pastebin|temp|drop|webhook)/i,
    /\brm\s+-rf\s+\/(?!\w)/i,
    /\b(mkfs|dd\s+if=|fdisk|parted)\b/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\binit\s+0\b/i
  ];

  // Destructive command keywords requiring HIGH risk confirmation
  private static DESTRUCTIVE_KEYWORDS = [
    "delete",
    "remove",
    "drop",
    "truncate",
    "uninstall",
    "kill",
    "pkill",
    "format",
    "overwrite",
    "unlink",
    "rmdir"
  ];

  /**
   * Evaluates the risk and permission requirements for a given computer tool and parameters.
   */
  public static evaluateToolAction(
    tool: ComputerToolName,
    params: Record<string, any>,
    context?: { isNewWorkspace?: boolean; targetFileExists?: boolean; userName?: string }
  ): PermissionEvaluation {
    const serializedParams = JSON.stringify(params || {}).toLowerCase();

    // 1. Absolute Security Check: Block credentials, private keys, and data exfiltration
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(serializedParams)) {
        return {
          allowed: false,
          riskLevel: "high",
          requiresPrompt: false,
          reason: "Security Guardrail: Access to sensitive system files, keys, credentials, or destructive root commands is strictly blocked."
        };
      }
    }

    // 2. High-Risk Category: Deletions, Destructive Commands, System Changes
    if (
      this.DESTRUCTIVE_KEYWORDS.some((kw) => serializedParams.includes(kw)) ||
      params.command?.includes("rm ") ||
      params.command?.includes("del ") ||
      params.command?.includes("shutdown")
    ) {
      const promptText = `Boss, ye action files delete ya modify kar sakti hai: "${params.command || tool}". Kya main proceed karun?`;
      return {
        allowed: true,
        riskLevel: "high",
        requiresPrompt: true,
        reason: "Destructive action: Deleting or permanently altering system resources.",
        promptText,
        confirmationToken: this.generateToken(tool)
      };
    }

    // 3. Medium-Risk Category: Modifying existing files, installing packages
    if (tool === "edit_file" || (tool === "write_file" && context?.targetFileExists)) {
      const target = params.filePath || params.fileName || "existing file";
      return {
        allowed: true,
        riskLevel: "medium",
        requiresPrompt: true,
        reason: `Modifying existing file: ${target}`,
        promptText: `Boss, "${target}" file modify hogi. Proceed karun?`,
        confirmationToken: this.generateToken(tool)
      };
    }

    if (
      tool === "run_command" &&
      (params.command?.includes("install") ||
        params.command?.includes("pip ") ||
        params.command?.includes("npm ") ||
        params.command?.includes("git push"))
    ) {
      return {
        allowed: true,
        riskLevel: "medium",
        requiresPrompt: true,
        reason: "Installing software packages or pushing repository changes.",
        promptText: `Boss, software packages install hone ja rahe hain: "${params.command}". Theek hai na?`,
        confirmationToken: this.generateToken(tool)
      };
    }

    // 4. Low-Risk Category: Open apps, read files, write code in fresh workspaces, run tests
    if (
      tool === "open_application" ||
      tool === "focus_application" ||
      tool === "close_application" ||
      tool === "read_file" ||
      tool === "list_directory" ||
      tool === "open_url" ||
      tool === "take_screenshot" ||
      tool === "inspect_screen" ||
      tool === "wait" ||
      tool === "verify_application_state" ||
      tool === "verify_command_result" ||
      tool === "create_folder" ||
      (tool === "create_file" && context?.isNewWorkspace) ||
      (tool === "write_file" && context?.isNewWorkspace) ||
      (tool === "run_command" && this.isSafeDevCommand(params.command))
    ) {
      return {
        allowed: true,
        riskLevel: "low",
        requiresPrompt: false,
        reason: "Standard safe development/inspection operation."
      };
    }

    // Default to Low Risk for safe UI interactions
    return {
      allowed: true,
      riskLevel: "low",
      requiresPrompt: false,
      reason: "Safe local computer action."
    };
  }

  private static isSafeDevCommand(command?: string): boolean {
    if (!command) return true;
    const cmd = command.trim().toLowerCase();
    const safePrefixes = [
      "python ",
      "python3 ",
      "node ",
      "npx tsx ",
      "tsc --noemit",
      "cat ",
      "ls ",
      "echo ",
      "head ",
      "tail ",
      "grep ",
      "pwd",
      "whoami",
      "git status",
      "git log",
      "git diff"
    ];
    return safePrefixes.some((p) => cmd.startsWith(p));
  }

  private static generateToken(tool: string): string {
    return `cperm_${tool}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
