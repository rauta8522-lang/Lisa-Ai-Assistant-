import React from "react";
import HandwrittenNotes from "./HandwrittenNotes";
import { downloadPDF } from "./PDFGenerator";

interface Props {
  notes: string;
  diagramPrompt: string;
}

export default function StudyAssistant({
  notes,
  diagramPrompt,
}: Props) {
  if (!notes) return null;

  const diagramUrl = diagramPrompt
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(
        diagramPrompt
      )}`
    : "";

  return (
    <div
      className="absolute top-20 right-4 w-[520px] h-auto max-h-[80vh] rounded-xl shadow-2xl p-4 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-xl">
          📚 Study Assistant
        </h2>

        <button
        onClick={() => {
        setTimeout(() => {
         downloadPDF();
        }, 500); // 🔥 important delay
  }}
        >
          PDF
        </button>
      </div>

      <div
        className="flex-1 overflow-auto custom-scroll pr-2"
        style={{
          minHeight: 0,
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {/* IMPORTANT */}
        <div id="notes-container">
          <HandwrittenNotes notes={notes} />

          {diagramUrl && (
            <img
              src={diagramUrl}
              alt="Diagram"
               crossOrigin="anonymous"
              className="w-full mt-4 rounded-xl shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}