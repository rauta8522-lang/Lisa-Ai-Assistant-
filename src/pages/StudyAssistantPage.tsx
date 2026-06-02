import React, { useState } from "react";
import NotesGenerator from "../components/NotesGenerator";
import { generateNotes } from "../services/notesService";

export default function StudyAssistantPage() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);

    try {
      const data = await generateNotes(topic);

      if (typeof data === "string") {
        setNotes(data);
      } else {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold mb-6">
        📚 Study Assistant
      </h1>

      <div className="flex gap-3 mb-6">

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic..."
          className="flex-1 px-4 py-2 rounded text-black"
        />

        <button
          onClick={handleGenerate}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Generate
        </button>

      </div>

      {loading && (
        <p>Generating Notes...</p>
      )}

      <NotesGenerator notes={notes} />
    </div>
  );
}