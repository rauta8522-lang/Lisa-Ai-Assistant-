import { AgentMessage, ComputerToolName } from "./types.js";
import { CommandRouter } from "./commandRouter.js";
import { PermissionManager } from "./permissionManager.js";

export interface TaskExecutionOptions {
  timeoutMs?: number;
  onProgress?: (step: number, total: number, output: string) => void;
}

export class TaskExecutor {
  private router: CommandRouter;
  private permissionManager: PermissionManager;
  private isBusy: boolean = false;
  private activeTaskId: string | null = null;

  constructor(router: CommandRouter, permissionManager: PermissionManager) {
    this.router = router;
    this.permissionManager = permissionManager;
  }

  public isExecuting(): boolean {
    return this.isBusy;
  }

  public getActiveTaskId(): string | null {
    return this.activeTaskId;
  }

  /**
   * Executes an incoming agent command with strict safety boundaries and timeout controls.
   */
  public async executeSingleTask(
    msg: AgentMessage,
    options: TaskExecutionOptions = {}
  ): Promise<AgentMessage> {
    const timeout = options.timeoutMs || 35000;
    this.isBusy = true;
    this.activeTaskId = msg.taskId || msg.requestId || "task_local";

    const executionPromise = this.router.executeCommand(msg);

    const timeoutPromise = new Promise<AgentMessage>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeout}ms on local desktop.`));
      }, timeout);
    });

    try {
      const result = await Promise.race([executionPromise, timeoutPromise]);
      return result;
    } catch (err: any) {
      return {
        type: "result",
        requestId: msg.requestId,
        taskId: msg.taskId,
        tool: msg.tool,
        success: false,
        output: "",
        error: err?.message || String(err),
        durationMs: timeout,
        observation: {
          timestamp: Date.now(),
          application: msg.params?.appName || "Windows OS",
          isSuccessful: false,
          message: `Execution error on desktop agent: ${err?.message || String(err)}`
        }
      };
    } finally {
      this.isBusy = false;
      this.activeTaskId = null;
    }
  }
}
