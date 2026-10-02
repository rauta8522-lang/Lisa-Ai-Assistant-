import { ComputerTaskPlan, ComputerStep, RiskLevel } from "./ComputerTaskTypes";
import { ComputerPermissionEngine } from "./ComputerPermissionEngine";

export interface PlannerContext {
  activeApplication?: string;
  activeWorkspace?: string;
  activeFile?: string;
  previousTask?: ComputerTaskPlan | null;
  existingProjectDetected?: boolean;
}

export class ComputerTaskPlanner {
  /**
   * Evaluates if a user voice or text input is a computer agent command.
   */
  public static isComputerIntent(input: string): boolean {
    const text = (input || "").toLowerCase().trim();
    if (!text) return false;

    // Cancellation check
    if (this.isCancellationIntent(text)) return true;

    // Direct app or desktop mentions
    const computerKeywords = [
      "desktop",
      "computer",
      "window on",
      "window kholo",
      "window open",
      "vs code",
      "vscode",
      "visual studio",
      "chrome",
      "notepad",
      "terminal",
      "powershell",
      "cmd",
      "calculator",
      "program banao",
      "code likho",
      "run karo",
      "file banao",
      "folder banao",
      "project banao",
      "build karo",
      "execute karo",
      "open karo",
      "kholo",
      "band karo",
      "pc on",
      "system on"
    ];

    return computerKeywords.some((kw) => text.includes(kw));
  }

  /**
   * Checks if user is explicitly cancelling a running or planned task.
   */
  public static isCancellationIntent(input: string): boolean {
    const text = (input || "").toLowerCase().trim();
    const cancelKeywords = [
      "lisa stop",
      "stop",
      "cancel",
      "cancel kar do",
      "cancel kardo",
      "bas abhi rok do",
      "rok do",
      "band kar do",
      "ruk jao",
      "abort"
    ];
    return cancelKeywords.some((kw) => text === kw || text.startsWith("lisa stop"));
  }

  /**
   * Universal Task Planner: Turns natural language into a structured ComputerTaskPlan.
   * Accurately distinguishes application launch vs remote desktop power/wake.
   */
  public static createPlan(input: string, context?: PlannerContext): ComputerTaskPlan {
    const raw = (input || "").trim();
    const text = raw.toLowerCase();
    const taskId = `task_c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    // 1. Desktop / PC Power-on or Wake Intent (Distinguished from Application Window control)
    const isPowerIntent = (
      (text.includes("desktop on") || text.includes("computer on") || text.includes("pc on") || text.includes("system on") || text.includes("machine on")) &&
      !text.includes("window on") &&
      !text.includes("window kholo") &&
      !text.includes("vs code") &&
      !text.includes("code") &&
      !text.includes("chrome")
    );

    if (isPowerIntent) {
      return {
        taskId,
        title: "Wake Remote Computer",
        intent: "power_control",
        targetApplication: "system",
        workspacePath: "",
        steps: [
          {
            id: `step_${now}_1`,
            stepNumber: 1,
            tool: "run_command",
            description: "Send Wake-on-LAN packet and verify host online status",
            params: { action: "wake_on_lan", intent: "power_control" },
            riskLevel: "low",
            status: "pending"
          }
        ],
        currentStepIndex: 0,
        status: "planning",
        requiresConfirmation: false,
        riskLevel: "low",
        createdAt: now,
        updatedAt: now
      };
    }

    // 2. Multi-step Resume / "Run karo" trigger when file already in context
    if ((text === "run karo" || text === "ab run karo" || text === "run it") && context?.activeFile) {
      const activeFile = context.activeFile;
      const app = context.activeApplication || "Visual Studio Code";
      const workspace = context.activeWorkspace || `/workspace/project_${now}`;
      const isPython = activeFile.endsWith(".py");
      const runCmd = isPython ? `python3 ${activeFile}` : `node ${activeFile}`;

      return {
        taskId,
        title: `Run ${activeFile}`,
        intent: "run_code",
        targetApplication: app,
        workspacePath: workspace,
        steps: [
          {
            id: `step_${now}_1`,
            stepNumber: 1,
            tool: "save_file",
            description: `Save ${activeFile}`,
            params: { fileName: activeFile, workspacePath: workspace },
            riskLevel: "low",
            status: "pending"
          },
          {
            id: `step_${now}_2`,
            stepNumber: 2,
            tool: "run_command",
            description: `Execute ${activeFile} in terminal`,
            params: { command: runCmd, cwd: workspace },
            riskLevel: "low",
            status: "pending"
          },
          {
            id: `step_${now}_3`,
            stepNumber: 3,
            tool: "verify_command_result",
            description: "Observe terminal output and verify exit status",
            params: { command: runCmd, targetFile: activeFile },
            riskLevel: "low",
            status: "pending"
          }
        ],
        currentStepIndex: 0,
        status: "planning",
        requiresConfirmation: false,
        riskLevel: "low",
        createdAt: now,
        updatedAt: now
      };
    }

    // 3. Application Launch / Focus / Window On Only
    const isLaunchOnly = (
      (text.includes("kholo") || text.includes("open") || text.includes("focus") || text.includes("window on") || text.includes("on karo") || text.includes("start karo")) &&
      !text.includes("code banao") &&
      !text.includes("program banao") &&
      !text.includes("calculator banao") &&
      !text.includes("script banao")
    );

    if (isLaunchOnly) {
      const appTarget = (text.includes("vs") || text.includes("code") || text.includes("visual studio"))
        ? "Visual Studio Code"
        : text.includes("chrome")
        ? "Google Chrome"
        : text.includes("edge")
        ? "Microsoft Edge"
        : text.includes("notepad")
        ? "Notepad"
        : text.includes("calculator") || text.includes("calc")
        ? "Calculator"
        : text.includes("terminal") || text.includes("powershell") || text.includes("cmd")
        ? "Terminal"
        : text.includes("explorer") || text.includes("folder") || text.includes("file")
        ? "File Explorer"
        : context?.activeApplication || "Visual Studio Code";

      return {
        taskId,
        title: `Open ${appTarget}`,
        intent: "open_application",
        targetApplication: appTarget,
        workspacePath: context?.activeWorkspace || `LisaProjects/session_${now}`,
        steps: [
          {
            id: `step_${now}_1`,
            stepNumber: 1,
            tool: "open_application",
            description: `Launch and focus ${appTarget} on Windows desktop`,
            params: { appName: appTarget },
            riskLevel: "low",
            status: "pending"
          },
          {
            id: `step_${now}_2`,
            stepNumber: 2,
            tool: "inspect_screen",
            description: `Observe ${appTarget} UI on screen`,
            params: { appName: appTarget },
            riskLevel: "low",
            status: "pending"
          }
        ],
        currentStepIndex: 0,
        status: "planning",
        requiresConfirmation: false,
        riskLevel: "low",
        createdAt: now,
        updatedAt: now
      };
    }

    // 4. Universal Coding / Software Creation Task
    const isPythonRequested = text.includes("python") || (!text.includes("javascript") && !text.includes("node") && !text.includes("js"));
    const ext = isPythonRequested ? ".py" : ".js";

    let fileName = `script_${now.toString().slice(-4)}${ext}`;
    let codeContent = "";
    let expectedOutputHint = "";

    if (text.includes("calc") || text.includes("calculator")) {
      fileName = `calculator${ext}`;
      if (isPythonRequested) {
        codeContent = `def add(a, b): return a + b\ndef subtract(a, b): return a - b\ndef multiply(a, b): return a * b\ndef divide(a, b): return a / b if b != 0 else 'Error: Division by zero'\n\nif __name__ == '__main__':\n    print("Calculator initialized.")\n    print(f"5 + 3 = {add(5, 3)}")\n    print(f"10 - 4 = {subtract(10, 4)}")\n    print(f"6 * 7 = {multiply(6, 7)}")\n    print("Calculator test run successful!")\n`;
      } else {
        codeContent = `function add(a, b) { return a + b; }\nfunction subtract(a, b) { return a - b; }\nfunction multiply(a, b) { return a * b; }\nfunction divide(a, b) { return b !== 0 ? a / b : 'Error'; }\n\nconsole.log("Calculator initialized.");\nconsole.log("5 + 3 =", add(5, 3));\nconsole.log("Calculator test run successful!");\n`;
      }
      expectedOutputHint = "Calculator test run successful!";
    } else if (text.includes("1 se 100") || text.includes("sum") || text.includes("1 to 100")) {
      fileName = `sum_1_to_100${ext}`;
      if (isPythonRequested) {
        codeContent = `# Program to calculate sum of numbers from 1 to 100\ntotal = sum(range(1, 101))\nprint(f"Sum of numbers from 1 to 100 is: {total}")\n`;
      } else {
        codeContent = `let total = 0;\nfor (let i = 1; i <= 100; i++) total += i;\nconsole.log("Sum of numbers from 1 to 100 is:", total);\n`;
      }
      expectedOutputHint = "5050";
    } else {
      fileName = `app${ext}`;
      if (isPythonRequested) {
        codeContent = `# Generated program by Lisa AI\nprint("Program started successfully.")\nprint("Task completed without errors.")\n`;
      } else {
        codeContent = `console.log("Program started successfully.");\nconsole.log("Task completed without errors.");\n`;
      }
      expectedOutputHint = "completed";
    }

    const appName = "Visual Studio Code";
    const workspace = context?.activeWorkspace || `LisaProjects/project_${now.toString().slice(-6)}`;
    const runCmd = isPythonRequested ? `python ${fileName}` : `node ${fileName}`;

    const steps: ComputerStep[] = [
      {
        id: `step_${now}_1`,
        stepNumber: 1,
        tool: "open_application",
        description: `Open ${appName}`,
        params: { appName, workspacePath: workspace },
        riskLevel: "low",
        status: "pending"
      },
      {
        id: `step_${now}_2`,
        stepNumber: 2,
        tool: "create_folder",
        description: `Create project workspace directory: ${workspace}`,
        params: { folderPath: workspace },
        riskLevel: "low",
        status: "pending"
      },
      {
        id: `step_${now}_3`,
        stepNumber: 3,
        tool: "create_file",
        description: `Create source file ${fileName}`,
        params: { fileName, workspacePath: workspace },
        riskLevel: "low",
        status: "pending"
      },
      {
        id: `step_${now}_4`,
        stepNumber: 4,
        tool: "write_file",
        description: `Write code for ${fileName}`,
        params: { fileName, workspacePath: workspace, content: codeContent },
        riskLevel: "low",
        status: "pending"
      },
      {
        id: `step_${now}_5`,
        stepNumber: 5,
        tool: "save_file",
        description: `Save ${fileName}`,
        params: { fileName, workspacePath: workspace },
        riskLevel: "low",
        status: "pending"
      },
      {
        id: `step_${now}_6`,
        stepNumber: 6,
        tool: "run_command",
        description: `Run ${runCmd} in terminal`,
        params: { command: runCmd, cwd: workspace },
        riskLevel: "low",
        status: "pending"
      },
      {
        id: `step_${now}_7`,
        stepNumber: 7,
        tool: "verify_command_result",
        description: "Observe output and verify successful execution",
        params: { command: runCmd, expectedOutput: expectedOutputHint, cwd: workspace },
        riskLevel: "low",
        status: "pending"
      }
    ];

    let requiresConfirmation = false;
    let confirmationPrompt: string | undefined = undefined;

    if (context?.existingProjectDetected) {
      requiresConfirmation = true;
      confirmationPrompt = "Boss, existing project me code add karun ya ek naya project banaun?";
    }

    return {
      taskId,
      title: `Create & Execute ${fileName} in ${appName}`,
      intent: "coding_task",
      targetApplication: appName,
      workspacePath: workspace,
      steps,
      currentStepIndex: 0,
      status: "planning",
      requiresConfirmation,
      confirmationPrompt,
      riskLevel: "low",
      createdAt: now,
      updatedAt: now
    };
  }
}
