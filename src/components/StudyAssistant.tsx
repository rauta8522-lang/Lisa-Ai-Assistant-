import React, { useEffect } from "react";
import HandwrittenNotes from "./HandwrittenNotes";
import { downloadPDF, setNotesForPDF } from "./PDFGenerator";

interface Props {
  notes: string;
  diagramPrompt: string;
}

export default function StudyAssistant({
  notes,
  diagramPrompt,
}: Props) {
  const diagramUrl = diagramPrompt
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(
        diagramPrompt
      )}`
    : "";

  // Store notes and diagram info for PDF generation
  useEffect(() => {
    if (notes) {
      setNotesForPDF(notes, diagramUrl);
    }
  }, [notes, diagramUrl]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[36px] border border-slate-700/80 bg-slate-950/95 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.35)] backdrop-blur-xl text-slate-100">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Study Assistant</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Notes & Diagrams</h2>
        </div>
        <button
          onClick={() => {
            setTimeout(() => {
              downloadPDF();
            }, 500);
          }}
          disabled={!notes}
          className="rounded-3xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          PDF
        </button>
      </div>

      {notes ? (
        <div id="pdf-content" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-700/80 bg-slate-900/95 p-4">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <HandwrittenNotes notes={notes} />
            {diagramUrl && (
              <img
                src={diagramUrl}
                alt="Diagram"
                crossOrigin="anonymous"
                className="mt-4 w-full rounded-3xl border border-slate-700/80 shadow-[0_20px_60px_rgba(15,23,42,0.35)]"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-4 rounded-[32px] border border-dashed border-slate-700/80 bg-slate-950/90 p-8 text-center text-slate-400">
          <div className="rounded-full bg-slate-800/80 p-4 text-2xl text-slate-100">📘</div>
          <p className="text-base font-semibold text-white">No notes yet</p>
          <p className="max-w-sm text-sm text-slate-400">Ask Lisa to generate study notes or diagrams and they will appear here in a polished format.</p>
        </div>
      )}
    </div>
  );
}