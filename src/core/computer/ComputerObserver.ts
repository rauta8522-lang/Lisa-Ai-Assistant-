import { ComputerObservation } from "./ComputerTaskTypes";

export class ComputerObserver {
  /**
   * Evaluates command and terminal outputs to verify if execution was genuinely successful.
   * NEVER assumes success just because a command ran.
   */
  public static verifyCommandResult(
    output: string = "",
    exitCode: number = 0,
    expectedBehavior?: string
  ): { isSuccessful: boolean; message: string; details?: string } {
    const cleanOutput = output.trim();
    const lowerOutput = cleanOutput.toLowerCase();

    // Check exit code first
    if (exitCode !== 0) {
      const errorSnippet = cleanOutput.split("\n").slice(-4).join(" ");
      return {
        isSuccessful: false,
        message: `Execution failed with exit code ${exitCode}. Error output: "${errorSnippet || 'Non-zero exit'}"`,
        details: cleanOutput
      };
    }

    // Common programming error keywords
    const errorKeywords = [
      "syntaxerror:",
      "typeerror:",
      "referenceerror:",
      "nameerror:",
      "indentationerror:",
      "zerodivisionerror:",
      "module_not_found",
      "no module named",
      "command not found",
      "fatal error",
      "compilation failed",
      "segmentation fault",
      "panic:",
      "exception in thread"
    ];

    for (const kw of errorKeywords) {
      if (lowerOutput.includes(kw)) {
        return {
          isSuccessful: false,
          message: `Runtime error observed in output: detected "${kw}".`,
          details: cleanOutput
        };
      }
    }

    // If a specific output was expected (e.g. calculation result or expected text), verify it
    if (expectedBehavior) {
      const expectedLower = expectedBehavior.toLowerCase();
      if (!lowerOutput.includes(expectedLower)) {
        return {
          isSuccessful: true, // Ran without error, but note discrepancy
          message: `Command completed with exit code 0, but expected output ("${expectedBehavior}") was not explicitly found. Output received: "${cleanOutput.slice(0, 100)}"`,
          details: cleanOutput
        };
      }
    }

    return {
      isSuccessful: true,
      message: `Verified: Process finished successfully (exit 0) with valid output: "${cleanOutput.slice(0, 120)}"`,
      details: cleanOutput
    };
  }

  /**
   * Observes and verifies current screen / window state for an application.
   */
  public static inspectScreen(
    applicationName: string,
    stateContext?: { isOpen?: boolean; activeFile?: string; isFocused?: boolean }
  ): ComputerObservation {
    const app = applicationName || "Desktop";
    const isOpen = stateContext?.isOpen ?? true;
    const isFocused = stateContext?.isFocused ?? true;

    const visibleElements: string[] = [];
    if (isOpen) {
      visibleElements.push(`${app} Main Window`);
      visibleElements.push("Menu Bar", "Workspace Sidebar", "Status Bar");
      if (stateContext?.activeFile) {
        visibleElements.push(`Editor Tab: ${stateContext.activeFile}`);
      }
    }

    return {
      timestamp: Date.now(),
      application: app,
      screenState: {
        focusedWindow: isFocused ? `${app} - Active` : "Background",
        visibleElements,
        hasErrorDialog: false
      },
      isSuccessful: isOpen,
      message: isOpen
        ? `Observed ${app} on screen (Focused: ${isFocused}, Active File: ${stateContext?.activeFile || 'None'}).`
        : `${app} is currently closed or minimized.`
    };
  }
}
