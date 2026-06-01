import React from "react";
import HandwrittenNotes from "./HandwrittenNotes";
import { downloadPDF } from "./PDFGenerator";

interface Props {
  notes: string;
}

export default function StudyAssistant({ notes }: Props) {
  if (!notes) return null;

  return (
    <div className="absolute top-20 right-4 w-[520px] h-[60vh] bg-white text-black rounded-xl shadow-2xl p-4 z-50 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-xl">
          📚 Study Assistant
        </h2>

        <button
          onClick={downloadPDF}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          PDF
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pr-2"style={{
      minHeight: 0,
      WebkitOverflowScrolling: "touch",
      touchAction: "pan-y",
     }}
     >
     <HandwrittenNotes notes={notes} />
     </div>

    </div>
  );
}