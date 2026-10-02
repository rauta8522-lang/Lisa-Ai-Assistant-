export type ComputerToolName =
  | "open_application"
  | "focus_application"
  | "window_focus"
  | "close_application"
  | "create_file"
  | "read_file"
  | "write_file"
  | "edit_file"
  | "save_file"
  | "create_folder"
  | "list_directory"
  | "open_url"
  | "type_text"
  | "keyboard_type"
  | "keyboard_press"
  | "keyboard_hotkey"
  | "click"
  | "mouse_click"
  | "mouse_double_click"
  | "mouse_move"
  | "scroll"
  | "press_key"
  | "run_command"
  | "read_terminal_output"
  | "take_screenshot"
  | "inspect_screen"
  | "wait"
  | "verify_application_state"
  | "verify_command_result";

export type RiskLevel = "low" | "medium" | "high";

export type ComputerAgentStatus =
  | "idle"
  | "planning"
  | "waiting_permission"
  | "executing"
  | "observing"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

export interface ToolInputSchema {
  [param: string]: {
    type: "string" | "number" | "boolean" | "object";
    required?: boolean;
    description: string;
  };
}

export interface ComputerToolDefinition {
  name: ComputerToolName;
  description: string;
  schema: ToolInputSchema;
  defaultRisk: RiskLevel;
  timeoutMs: number;
}

export interface ComputerApplication {
  id: string;
  name: string;
  category: "editor" | "browser" | "terminal" | "utility" | "office" | "viewer" | "system";
  command: string;
  fileExtensions?: string[];
  isOpen?: boolean;
  isFocused?: boolean;
  activeFile?: string;
  workspacePath?: string;
}

export interface ComputerStep {
  id: string;
  stepNumber: number;
  tool: ComputerToolName;
  description: string;
  params: Record<string, any>;
  riskLevel: RiskLevel;
  status: "pending" | "waiting_permission" | "executing" | "completed" | "failed" | "skipped";
  output?: string;
  error?: string;
  verified?: boolean;
  verificationMessage?: string;
  durationMs?: number;
  observedAt?: number;
}

export interface ComputerTaskPlan {
  taskId: string;
  title: string;
  intent: string;
  targetApplication: string;
  workspacePath: string;
  steps: ComputerStep[];
  currentStepIndex: number;
  status: ComputerAgentStatus;
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
  riskLevel: RiskLevel;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  interrupted?: boolean;
  lastVerifiedState?: string;
  userSpokenResponse?: string;
  errorSummary?: string;
  recoveryCount?: number;
}

export interface PermissionEvaluation {
  allowed: boolean;
  riskLevel: RiskLevel;
  requiresPrompt: boolean;
  reason: string;
  promptText?: string;
  confirmationToken?: string;
}

export interface AgentExecutionCallback {
  onStatusChange?: (status: ComputerAgentStatus, plan: ComputerTaskPlan | null) => void;
  onConfirmationRequired?: (promptText: string, plan: ComputerTaskPlan, token?: string) => void;
  onStepProgress?: (step: ComputerStep, current: number, total: number) => void;
  onLisaSpeak?: (spokenPhrase: string) => Promise<void> | void;
}

export interface PlannerSessionContext {
  activeApplication?: string;
  activeWorkspace?: string;
  activeFile?: string;
  previousTask?: ComputerTaskPlan | null;
  existingProjectDetected?: boolean;
}

export interface ComputerObservation {
  timestamp: number;
  application: string;
  screenState?: {
    focusedWindow?: string;
    visibleElements?: string[];
    hasErrorDialog?: boolean;
  };
  terminalOutput?: string;
  exitCode?: number;
  isSuccessful: boolean;
  message: string;
}

export interface ComputerTelemetry {
  tasksRequested: number;
  tasksCompleted: number;
  tasksFailed: number;
  tasksCancelled: number;
  totalDurationMs: number;
  applicationsUsed: Record<string, number>;
  toolCalls: Record<string, { count: number; failures: number }>;
  permissionRequests: number;
  permissionGranted: number;
  permissionDenied: number;
  safetyBlocks: number;
  reconnectRecoveries: number;
  recentTasks: Array<{
    id: string;
    title: string;
    app: string;
    status: ComputerAgentStatus;
    durationMs: number;
    timestamp: number;
    error?: string;
  }>;
}
