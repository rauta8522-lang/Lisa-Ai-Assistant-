import React, { useState } from "react";
import { FileText, Image as ImageIcon, Presentation, Loader2, Save } from "lucide-react";
import { auth, db } from "../config/firebase";
import { collection, addDoc } from "firebase/firestore";

interface PresentationSlide {
  title: string;
  bulletPoints: string[];
  imagePrompt: string;
}

interface PresentationData {
  topic: string;
  slides: PresentationSlide[];
  createdAt: number;
}

export default function PresentationMaker() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPresentation, setGeneratedPresentation] = useState<PresentationData | null>(null);

  const generatePresentation = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/presentation/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const parsed: PresentationData = JSON.parse(data.text || "{}");
      setGeneratedPresentation({ ...parsed, topic, createdAt: Date.now() });
    } catch (error) {
      console.error("Presentation generation failed", error);
      alert("Failed to generate presentation.");
    } finally {
      setLoading(false);
    }
  };

  const savePresentationToFirestore = async () => {
    if (!auth.currentUser || !generatedPresentation) return;
    try {
      const col = collection(db, "users", auth.currentUser.email!, "presentations");
      await addDoc(col, generatedPresentation);
      alert("Presentation saved!");
    } catch (e) {
      console.error("Error saving presentation: ", e);
      alert("Error saving presentation.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
          <Presentation size={18} className="text-emerald-400" />
          <span>Presentation Maker</span>
        </h3>
        <p className="text-xs text-white/50 font-sans">
          Enter a topic, and I'll generate a presentation for you.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500 transition-all"
          placeholder="e.g. AI Technology Trends 2026"
        />
        
        <button
          onClick={generatePresentation}
          disabled={loading || !topic.trim()}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 className="animate-spin" size={16}/> Generating...</> : "Create Presentation"}
        </button>
      </div>
      
      {generatedPresentation && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <button
            onClick={savePresentationToFirestore}
            className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300"
          >
            <Save size={14} /> Save Presentation
          </button>
          
          {generatedPresentation.slides.map((slide, i) => (
            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
              <h4 className="text-sm font-semibold text-white">{slide.title}</h4>
              <ul className="text-xs text-white/70 list-disc pl-4">
                {slide.bulletPoints.map((bp, j) => <li key={j}>{bp}</li>)}
              </ul>
              <p className="text-[10px] text-emerald-300/60 font-mono">Image Prompt: {slide.imagePrompt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
