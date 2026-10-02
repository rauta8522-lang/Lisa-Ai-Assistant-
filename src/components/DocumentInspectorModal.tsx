import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Upload, X, ShieldAlert, Sparkles, Table, CheckCircle2, FileSearch, HelpCircle, BookOpen, PenTool, Presentation } from "lucide-react";
import { DocumentRecord } from "../core/documents/DocumentIntelligenceEngine";
import { ThemePalette } from "../utils/theme";
import StudyStudio from "./StudyStudio";
import PDFMaker from "./PDFMaker";
import PresentationMaker from "./PresentationMaker";

interface DocumentInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocument: DocumentRecord | null;
  onDocumentLoaded: (doc: DocumentRecord) => void;
  parseDocument: (fileData: string, fileName: string, fileType: string, mimeType: string) => Promise<DocumentRecord | null>;
  activePalette: ThemePalette;
  userName: string;
}

export const DocumentInspectorModal: React.FC<DocumentInspectorModalProps> = ({
  isOpen,
  onClose,
  activeDocument,
  onDocumentLoaded,
  parseDocument,
  activePalette,
  userName
}) => {
  const [activeTab, setActiveTab] = useState<"intelligence" | "presentations" | "study" | "pdf">("intelligence");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState("general");
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const doc = await parseDocument(base64, file.name, selectedFileType, file.type || "image/jpeg");
      if (doc) {
        onDocumentLoaded(doc);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl max-h-[85vh] bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex flex-col bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <FileSearch size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-wide">Lisa Document Intelligence & Maker</h2>
                  <p className="text-[11px] text-zinc-400">Universal hub for analysis, study, and document creation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-navigation Tabs */}
            <div className="flex gap-1 p-1 bg-black/20 rounded-xl self-start overflow-x-auto no-scrollbar max-w-full">
              <button
                onClick={() => setActiveTab("intelligence")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === "intelligence"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <FileSearch size={14} />
                Documents
              </button>
              <button
                onClick={() => setActiveTab("presentations")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === "presentations"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Presentation size={14} />
                Presentations
              </button>
              <button
                onClick={() => setActiveTab("study")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === "study"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <BookOpen size={14} />
                Study Studio
              </button>
              <button
                onClick={() => setActiveTab("pdf")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === "pdf"
                    ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <PenTool size={14} />
                PDF Maker
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "intelligence" && (
              <div className="p-6 space-y-6">
                {/* Upload Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Select Document Category:</label>
                    <select
                      value={selectedFileType}
                      onChange={(e) => setSelectedFileType(e.target.value)}
                      className="bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50"
                    >
                      <option value="general">General Document / PDF</option>
                      <option value="prescription">Medical Prescription</option>
                      <option value="lab_report">Lab / Blood Report</option>
                      <option value="medical_report">Medical Clinical Report</option>
                      <option value="zoo_brochure">Zoo / Travel Brochure</option>
                      <option value="receipt">Receipt / Invoice</option>
                      <option value="ticket">Ticket / Itinerary</option>
                      <option value="textbook">Textbook / School Material</option>
                      <option value="technical">Technical / Business Document</option>
                    </select>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragOver ? "border-cyan-500 bg-cyan-500/10" : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-4 space-y-2">
                        <Sparkles className="animate-spin text-cyan-400" size={28} />
                        <p className="text-xs font-medium text-cyan-300">Parsing document structure, OCR, & extracting entities...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 rounded-full bg-white/5 border border-white/10 text-cyan-400">
                          <Upload size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">Drag & drop your document here, or click to browse</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Supports PDF, images, scans, prescriptions, receipts, and brochures</p>
                        </div>
                        <label className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-xs font-medium text-white shadow-md transition-all cursor-pointer">
                          Browse Files
                          <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,.txt" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Document View */}
                {activeDocument ? (
                  <div className="space-y-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText size={18} className="text-cyan-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-white">{activeDocument.fileName}</h3>
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                              {activeDocument.fileType}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Parsed & indexed into memory. Follow-up questions supported without re-uploading.</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Active in Context
                      </span>
                    </div>

                    {/* Medical Safety Disclaimer if needed */}
                    {activeDocument.medicalDisclaimerNeeded && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-200 text-[11px]">
                        <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Clinical Safety Notice:</span> Lisa has extracted facts and lab values from this document, but does not diagnose, prescribe, or replace qualified medical professionals. Always consult your doctor.
                        </div>
                      </div>
                    )}

                    {/* Executive Summary */}
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Executive Summary</h4>
                      <p className="text-xs text-zinc-200 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">
                        {activeDocument.summary}
                      </p>
                    </div>

                    {/* Entities & Dates */}
                    {Object.keys(activeDocument.extractedStructure.entities).length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Extracted Entities & Key Details</h4>
                        <div className="grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-lg border border-white/5">
                          {Object.entries(activeDocument.extractedStructure.entities).map(([k, v]) => (
                            <div key={k} className="text-[11px]">
                              <span className="text-zinc-400">{k}:</span> <span className="text-white font-medium">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted Tables */}
                    {activeDocument.extractedStructure.tables && activeDocument.extractedStructure.tables.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                          <Table size={12} className="text-cyan-400" /> Extracted Tables
                        </h4>
                        {activeDocument.extractedStructure.tables.map((tbl, idx) => (
                          <div key={idx} className="overflow-x-auto rounded-lg border border-white/10 bg-black/40">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-white/5 text-zinc-300 border-b border-white/10">
                                <tr>
                                  {tbl.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="px-3 py-2 font-semibold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 text-zinc-200">
                                {tbl.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-white/[0.02]">
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="px-3 py-2">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                    <HelpCircle size={28} className="mx-auto text-zinc-500" />
                    <p className="text-xs text-zinc-400">No document currently active. Upload a file above to start Universal Document Intelligence.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "study" && (
              <div className="h-[60vh] relative">
                <StudyStudio
                  isOpen={true}
                  onClose={() => setActiveTab("intelligence")}
                  palette={activePalette}
                  userName={userName}
                />
              </div>
            )}

            {activeTab === "pdf" && (
              <div className="h-[60vh] relative">
                <PDFMaker />
              </div>
            )}

            {activeTab === "presentations" && (
              <div className="p-6 h-[60vh] overflow-y-auto">
                <PresentationMaker />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-zinc-400">
            <span>Powered by Universal Document Intelligence & Gemini Vision</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
