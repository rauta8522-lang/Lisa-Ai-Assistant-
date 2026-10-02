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

export interface AgentConfig {
  serverUrl: string;
  deviceId: string;
  deviceName: string;
  deviceToken?: string;
  workspaceDir: string;
  allowDestructiveActions: boolean;
}

export interface AgentMessage {
  type: "auth" | "ping" | "pong" | "command" | "result" | "status" | "error";
  token?: string;
  deviceId?: string;
  deviceName?: string;
  os?: string;
  agentVersion?: string;
  requestId?: string;
  tool?: ComputerToolName;
  params?: Record<string, any>;
  taskId?: string;
  workspacePath?: string;
  success?: boolean;
  output?: string;
  error?: string;
  durationMs?: number;
  observation?: {
    timestamp: number;
    application: string;
    isSuccessful: boolean;
    message: string;
    screenState?: any;
    terminalOutput?: string;
    exitCode?: number;
  };
  verification?: {
    processRunning?: boolean;
    fileCreated?: boolean;
    exitCode?: number;
    details?: string;
  };
}

export interface RegisteredApplication {
  id: string;
  name: string;
  processNames: string[];
  executableNames: string[];
  windowsCandidatePaths: string[];
  defaultLaunchArgs?: string[];
  category: "editor" | "browser" | "terminal" | "utility" | "office";
}
