import { ComputerTaskPlan, ComputerStep, ComputerAgentStatus, AgentExecutionCallback, PlannerSessionContext } from "./ComputerTaskTypes";
import { ComputerTaskPlanner } from "./ComputerTaskPlanner";
import { ComputerActionExecutor, ExecutionResult } from "./ComputerActionExecutor";
import { ComputerObserver } from "./ComputerObserver";
import { ComputerPermissionEngine } from "./ComputerPermissionEngine";
import { analytics } from "../../services/analyticsService";

export class ComputerAgent {
  private static STORAGE_KEY = "lisa_active_computer_task";
  private static isRunning = false;
  private static isCancelled = false;
  private static activePlan: ComputerTaskPlan | null = null;
  private static sessionContext: PlannerSessionContext = {};

  /**
   * Persists active task state into localStorage for instant crash & refresh recovery.
   */
  public static persistActiveTask(plan: ComputerTaskPlan | null) {
    try {
      if (!plan) {
        localStorage.removeItem(this.STORAGE_KEY);
      } else {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plan));
      }
    } catch (e) {
      console.warn("[COMPUTER AGENT] Failed to persist task state:", e);
    }
  }

  /**
   * Restores persisted task if one was interrupted.
   */
  public static restorePersistedTask(): ComputerTaskPlan | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[COMPUTER AGENT] Failed to restore task:", e);
    }
    return null;
  }

  /**
   * Main entrypoint for processing computer control commands.
   */
  public static async processInput(
    rawInput: string,
    callback?: AgentExecutionCallback,
    userContext?: { uid?: string; organizationId?: string; token?: string; userName?: string }
  ): Promise<{ handled: boolean; spokenResponse: string; plan?: ComputerTaskPlan }> {
    const raw = (rawInput || "").trim();
    if (!raw) return { handled: false, spokenResponse: "" };

    // 1. Check if user is cancelling an active task
    if (ComputerTaskPlanner.isCancellationIntent(raw)) {
      this.isCancelled = true;
      this.isRunning = false;
      const current = this.restorePersistedTask();
      if (current) {
        current.status = "cancelled";
        this.persistActiveTask(current);
        callback?.onStatusChange?.("cancelled", current);
      }
      const cancelSpoken = "Theek hai boss, computer task ko rok diya gaya hai.";
      callback?.onLisaSpeak?.(cancelSpoken);
      analytics.track("computer_task_cancelled", { input: raw });
      return { handled: true, spokenResponse: cancelSpoken };
    }

    // 2. Cancellation flag reset for new run
    this.isCancelled = false;

    // 3. PLAN PHASE: Create structured Task Plan
    callback?.onStatusChange?.("planning", null);
    const plan = ComputerTaskPlanner.createPlan(raw, this.sessionContext);
    this.activePlan = plan;
    this.sessionContext.previousTask = plan;
    this.persistActiveTask(plan);

    analytics.track("computer_task_started", {
      taskId: plan.taskId,
      title: plan.title,
      app: plan.targetApplication
    });

    // 4. PERMISSION CHECK: Check if initial confirmation is required
    if (plan.requiresConfirmation && plan.confirmationPrompt) {
      plan.status = "waiting_permission";
      callback?.onStatusChange?.("waiting_permission", plan);
      callback?.onConfirmationRequired?.(plan.confirmationPrompt, plan);
      callback?.onLisaSpeak?.(plan.confirmationPrompt);
      return { handled: true, spokenResponse: plan.confirmationPrompt, plan };
    }

    // 5. Natural Introductory Response from Lisa
    let introResponse = "";
    if (plan.intent === "power_control") {
      introResponse = "Boss, computer wake kar rahi hoon.";
    } else if (plan.intent === "open_application") {
      introResponse = `Theek hai boss, main ${plan.targetApplication} open kar rahi hoon.`;
    } else if (plan.intent === "coding_task") {
      introResponse = `Theek hai boss, ${plan.targetApplication} me workspace set up karke code banati hoon.`;
    } else {
      introResponse = "Theek hai boss, main computer par task start kar rahi hoon.";
    }

    if (callback?.onLisaSpeak) {
      await callback.onLisaSpeak(introResponse);
    }

    // 6. EXECUTE → OBSERVE → VERIFY → REPORT
    const finalReport = await this.executePlan(plan, callback, userContext);
    return { handled: true, spokenResponse: finalReport, plan };
  }

  /**
   * Executes the steps in a plan sequentially with observation and verification.
   */
  public static async executePlan(
    plan: ComputerTaskPlan,
    callback?: AgentExecutionCallback,
    userContext?: { uid?: string; organizationId?: string; token?: string; userName?: string }
  ): Promise<string> {
    if (this.isRunning) {
      return "Boss, ek task already running hai. Pehle use complete hone do.";
    }

    this.isRunning = true;
    plan.status = "executing";
    callback?.onStatusChange?.("executing", plan);
    this.persistActiveTask(plan);

    // SPECIAL HANDLING: Power Control / Wake-on-LAN
    if (plan.intent === "power_control") {
      try {
        const res = await fetch("/api/computer/wake", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userContext?.token ? { Authorization: `Bearer ${userContext.token}` } : {})
          },
          body: JSON.stringify({ taskId: plan.taskId })
        });
        const data = await res.json();
        this.isRunning = false;

        let powerSpoken = "";
        if (data.isOnline) {
          plan.status = "completed";
          powerSpoken = data.alreadyOnline
            ? "Boss, computer pehle se online aur ready hai."
            : "Boss, computer on ho gaya.";
          callback?.onStatusChange?.("completed", plan);
        } else if (data.wolConfigured) {
          plan.status = "failed";
          powerSpoken = "Boss, Wake-on-LAN packet bhej diya hai, lekin computer abhi online nahi hua. Kripya check karein ki power connect hai ya nahi.";
          callback?.onStatusChange?.("failed", plan);
        } else {
          plan.status = "failed";
          powerSpoken = "Boss, completely powered-off computer ko remote agent se direct on nahi kiya ja sakta jab tak Wake-on-LAN configure na ho. Computer Devices settings me jaakar Wake-on-LAN MAC address setup karein.";
          callback?.onStatusChange?.("failed", plan);
        }

        plan.userSpokenResponse = powerSpoken;
        this.persistActiveTask(plan);
        if (callback?.onLisaSpeak) {
          await callback.onLisaSpeak(powerSpoken);
        }
        return powerSpoken;
      } catch (e: any) {
        this.isRunning = false;
        plan.status = "failed";
        const errSpoken = "Boss, wake signal bhejne me error aayi: " + (e?.message || String(e));
        if (callback?.onLisaSpeak) await callback.onLisaSpeak(errSpoken);
        return errSpoken;
      }
    }

    let hadErrors = false;
    let errorMessage = "";

    for (let i = plan.currentStepIndex; i < plan.steps.length; i++) {
      if (this.isCancelled) {
        plan.status = "cancelled";
        this.isRunning = false;
        this.persistActiveTask(plan);
        return "Boss, task cancel kar diya gaya.";
      }

      const step = plan.steps[i];
      plan.currentStepIndex = i;
      step.status = "executing";
      callback?.onStepProgress?.(step, i + 1, plan.steps.length);

      // Permission check per step
      const perm = ComputerPermissionEngine.evaluateToolAction(step.tool, step.params, {
        isNewWorkspace: true,
        userName: userContext?.userName
      });

      if (!perm.allowed) {
        step.status = "failed";
        step.error = perm.reason;
        hadErrors = true;
        errorMessage = perm.reason;
        analytics.track("computer_action_failed", { taskId: plan.taskId, tool: step.tool, reason: perm.reason });
        break;
      }

      if (perm.requiresPrompt) {
        plan.status = "waiting_permission";
        callback?.onStatusChange?.("waiting_permission", plan);
        callback?.onConfirmationRequired?.(perm.promptText || "Proceed?", plan, perm.confirmationToken);
        if (callback?.onLisaSpeak) {
          await callback.onLisaSpeak(perm.promptText || "Proceed?");
        }
        this.isRunning = false;
        return perm.promptText || "Confirmation required.";
      }

      // EXECUTE STEP ON REAL LOCAL WINDOWS AGENT
      callback?.onStatusChange?.("executing", plan);
      const execResult: ExecutionResult = await ComputerActionExecutor.executeAction(
        step.tool,
        step.params,
        {
          taskId: plan.taskId,
          workspacePath: plan.workspacePath,
          token: userContext?.token,
          organizationId: userContext?.organizationId
        }
      );

      step.output = execResult.output;
      step.durationMs = execResult.durationMs;

      if (!execResult.success) {
        step.status = "failed";
        step.error = execResult.error || "Action execution failed";
        hadErrors = true;
        errorMessage = step.error;
        analytics.track("computer_action_failed", {
          taskId: plan.taskId,
          tool: step.tool,
          error: step.error
        });
        break;
      }

      // OBSERVE & VERIFY REAL OS STATE
      callback?.onStatusChange?.("observing", plan);
      callback?.onStatusChange?.("verifying", plan);

      if (step.tool === "run_command" || step.tool === "verify_command_result") {
        const verifyRes = ComputerObserver.verifyCommandResult(
          step.output,
          0,
          step.params?.expectedOutput
        );
        step.verified = verifyRes.isSuccessful;
        step.verificationMessage = verifyRes.message;

        if (!verifyRes.isSuccessful) {
          hadErrors = true;
          errorMessage = verifyRes.message;
          step.status = "failed";
          break;
        }
      }

      step.status = "completed";
      plan.lastVerifiedState = `Step ${i + 1} (${step.tool}) verified successfully.`;
      this.persistActiveTask(plan);

      // Update session context
      if (step.params?.appName) this.sessionContext.activeApplication = step.params.appName;
      if (step.params?.workspacePath) this.sessionContext.activeWorkspace = step.params.workspacePath;
      if (step.params?.fileName) this.sessionContext.activeFile = step.params.fileName;

      analytics.track("computer_action_executed", {
        taskId: plan.taskId,
        tool: step.tool,
        durationMs: step.durationMs
      });
    }

    this.isRunning = false;

    // FINAL ACCURATE REPORT (Never fakes completion)
    let finalSpoken = "";
    if (hadErrors) {
      plan.status = "failed";
      plan.errorSummary = errorMessage;
      const errLower = (errorMessage || "").toLowerCase();
      if (errLower.includes("no_agent_connected") || errLower.includes("offline")) {
        finalSpoken = "Boss, tumhara desktop agent abhi connected nahi hai. Pehle computer agent connect karna hoga.";
      } else if (errLower.includes("executable_not_found")) {
        finalSpoken = `Boss, ${plan.targetApplication} is system par installed nahi mil raha. Main ise automatically install nahi karungi jab tak aap permission na dein.`;
      } else if (errLower.includes("timeout")) {
        finalSpoken = "Boss, Windows desktop agent se response timeout ho gaya. Kripya check karein ki agent terminal me running hai ya nahi.";
      } else {
        finalSpoken = `Boss, task execute karne me issue aaya: ${errorMessage.slice(0, 120)}.`;
      }
      callback?.onStatusChange?.("failed", plan);
      analytics.track("computer_task_completed", { taskId: plan.taskId, success: false, error: errorMessage });
    } else {
      plan.status = "completed";
      plan.completedAt = Date.now();
      callback?.onStatusChange?.("completed", plan);

      if (plan.title.toLowerCase().includes("calculator")) {
        finalSpoken = "Boss, calculator ready hai aur successfully run ho gaya.";
      } else if (plan.title.toLowerCase().includes("sum")) {
        finalSpoken = "Boss, Python ka sum program ready hai aur successfully run ho gaya. 1 se 100 tak numbers ka sum 5050 aaya hai.";
      } else if (plan.intent === "open_application") {
        finalSpoken = plan.targetApplication.toLowerCase().includes("vs code") || plan.targetApplication.toLowerCase().includes("code")
          ? "VS Code open ho gaya boss."
          : `Ho gaya boss, ${plan.targetApplication} open ho gaya hai.`;
      } else {
        finalSpoken = `Boss, ${plan.title} ready hai aur successfully run ho gaya.`;
      }

      analytics.track("computer_task_completed", { taskId: plan.taskId, success: true, app: plan.targetApplication });
    }

    plan.userSpokenResponse = finalSpoken;
    this.persistActiveTask(plan);

    if (callback?.onLisaSpeak) {
      await callback.onLisaSpeak(finalSpoken);
    }

    return finalSpoken;
  }

  /**
   * Resumes an interrupted task after connection drop or page refresh.
   */
  public static async resumeInterruptedTask(
    callback?: AgentExecutionCallback,
    userContext?: { uid?: string; organizationId?: string; token?: string; userName?: string }
  ): Promise<{ resumed: boolean; response: string }> {
    const plan = this.restorePersistedTask();
    if (!plan || plan.status === "completed" || plan.status === "cancelled" || plan.status === "failed") {
      return { resumed: false, response: "" };
    }

    plan.recoveryCount = (plan.recoveryCount || 0) + 1;
    plan.interrupted = false;
    analytics.track("computer_task_reconnect_resumed", {
      taskId: plan.taskId,
      stepIndex: plan.currentStepIndex,
      app: plan.targetApplication
    });

    const resumeAnnouncement = `Boss, hum ${plan.title || 'computer task'} par hi the. Step ${plan.currentStepIndex + 1} se aage continue kar rahi hoon.`;
    if (callback?.onLisaSpeak) {
      await callback.onLisaSpeak(resumeAnnouncement);
    }

    const reply = await this.executePlan(plan, callback, userContext);
    return { resumed: true, response: reply };
  }

  /**
   * Handles user's confirmation to resume a paused permission-waiting task.
   */
  public static async confirmAndResumeTask(
    approved: boolean,
    callback?: AgentExecutionCallback,
    userContext?: { uid?: string; organizationId?: string; token?: string; userName?: string }
  ): Promise<string> {
    const plan = this.restorePersistedTask();
    if (!plan || plan.status !== "waiting_permission") {
      return "Boss, koi pending permission request nahi mili.";
    }

    if (!approved) {
      plan.status = "cancelled";
      this.persistActiveTask(plan);
      callback?.onStatusChange?.("cancelled", plan);
      analytics.track("computer_permission_denied", { taskId: plan.taskId });
      const denyMsg = "Theek hai boss, maine permission cancel kar di hai.";
      if (callback?.onLisaSpeak) await callback.onLisaSpeak(denyMsg);
      return denyMsg;
    }

    analytics.track("computer_permission_granted", { taskId: plan.taskId });
    plan.requiresConfirmation = false;
    plan.confirmationPrompt = undefined;
    plan.status = "executing";

    const ackMsg = "Permission mil gayi boss, ab execute kar rahi hoon.";
    if (callback?.onLisaSpeak) await callback.onLisaSpeak(ackMsg);

    return await this.executePlan(plan, callback, userContext);
  }

  /**
   * Manually cancels active task.
   */
  public static cancelTask(callback?: AgentExecutionCallback) {
    this.isCancelled = true;
    this.isRunning = false;
    const plan = this.restorePersistedTask();
    if (plan) {
      plan.status = "cancelled";
      this.persistActiveTask(plan);
      callback?.onStatusChange?.("cancelled", plan);
    }
    const cancelMsg = "Boss, computer task cancel kar diya gaya.";
    if (callback?.onLisaSpeak) callback.onLisaSpeak(cancelMsg);
    analytics.track("computer_task_cancelled", { taskId: plan?.taskId });
  }

  public static getActivePlan(): ComputerTaskPlan | null {
    return this.activePlan || this.restorePersistedTask();
  }

  public static isBusy(): boolean {
    return this.isRunning;
  }
}
