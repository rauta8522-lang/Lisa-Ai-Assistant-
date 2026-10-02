import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Monitor,
  Terminal,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { ComputerTaskPlan, ComputerStep, ComputerAgentStatus } from "../core/computer/ComputerTaskTypes";
import { ThemePalette } from "../utils/theme";

interface ComputerAgentWidgetProps {
  plan: ComputerTaskPlan | null;
  status: ComputerAgentStatus;
  currentStep?: ComputerStep | null;
  palette: ThemePalette;
  onConfirm: (approved: boolean) => void;
  onCancel: () => void;
  onResume?: () => void;
  onClose?: () => void;
}

export const ComputerAgentWidget: React.FC<ComputerAgentWidgetProps> = ({
  plan,
  status,
  palette,
  onConfirm,
  onCancel,
  onResume,
  onClose
}) => {
  const [expanded, setExpanded] = React.useState(true);

  if (!plan && status === "idle") return null;

  const getStatusBadge = () => {
    switch (status) {
      case "planning":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
            <Loader2 className="w-3 h-3 animate-spin" /> Planning Task
          </span>
        );
      case "executing":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Executing Action
          </span>
        );
      case "waiting_permission":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium border border-red-500/30">
            <ShieldAlert className="w-3 h-3" /> Permission Required
          </span>
        );
      case "verifying":
      case "observing":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium border border-purple-500/30">
            <Clock className="w-3 h-3 animate-spin" /> Verifying Output
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Verified & Complete
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-medium border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Execution Error
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 font-medium border border-zinc-500/30">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const currentStep = plan?.steps[plan?.currentStepIndex || 0];
  const progressPercent = plan
    ? Math.round(((plan.currentStepIndex + (status === "completed" ? 1 : 0)) / plan.steps.length) * 100)
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] z-40 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 text-sm font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/80 border-b border-zinc-700/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Lisa Desktop Agent</div>
              <div className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                {plan?.targetApplication || "Desktop Environment"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-md hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && plan && (
          <div className="p-4 space-y-3">
            {/* Task Title & Progress */}
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-300 font-medium mb-1">
                <span className="truncate max-w-[220px]">{plan.title}</span>
                <span className="text-zinc-400 font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Permission Prompt Box */}
            {status === "waiting_permission" && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-200 leading-relaxed">
                    {plan.confirmationPrompt || "This action requires confirmation before proceeding."}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onConfirm(false)}
                    className="px-3 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onConfirm(true)}
                    className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors font-medium shadow-md shadow-red-900/30"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              </div>
            )}

            {/* Step list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {plan.steps.map((step, idx) => {
                const isCurrent = idx === plan.currentStepIndex && status === "executing";
                const isDone = step.status === "completed";
                const isFail = step.status === "failed";

                return (
                  <div
                    key={step.id || idx}
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs transition-colors ${
                      isCurrent
                        ? "bg-fuchsia-950/30 border border-fuchsia-500/30 text-fuchsia-200"
                        : isDone
                        ? "bg-zinc-800/40 text-zinc-400"
                        : isFail
                        ? "bg-rose-950/30 border border-rose-500/30 text-rose-300"
                        : "bg-zinc-800/20 text-zinc-500"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isFail ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
                      ) : (
                        <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-mono text-zinc-500">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{step.description}</div>
                      {step.output && isDone && (
                        <div className="text-[10px] font-mono text-emerald-400/80 truncate mt-0.5">
                          ✓ {step.output.slice(0, 60)}
                        </div>
                      )}
                      {step.error && (
                        <div className="text-[10px] font-mono text-rose-400 truncate mt-0.5">
                          ✗ {step.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs">
              <span className="text-[11px] text-zinc-500 font-mono">
                {plan.workspacePath ? `workspace: ${plan.workspacePath.split("/").pop()}` : ""}
              </span>
              <div className="flex items-center gap-2">
                {status === "executing" && (
                  <button
                    onClick={onCancel}
                    className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    Stop Agent
                  </button>
                )}
                {status === "failed" && onResume && (
                  <button
                    onClick={onResume}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-medium transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-3 h-3" /> Retry Task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
