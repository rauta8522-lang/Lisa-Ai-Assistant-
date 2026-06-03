import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { setNotesForPDF } from "./PDFGenerator";

// Custom highlight component for marking important text
const Highlight = ({ children, color = "yellow" }: { children: React.ReactNode; color?: string }) => {
  const colors: { [key: string]: string } = {
    yellow: "bg-yellow-200",
    green: "bg-green-200",
    blue: "bg-blue-200",
    pink: "bg-pink-200",
    orange: "bg-orange-200",
    purple: "bg-purple-200",
  };
  return (
    <span
      className={`px-1 rounded-sm`}
      style={{
        backgroundColor: colors[color] || colors.yellow,
        fontWeight: "600",
      }}
    >
      {children}
    </span>
  );
};

interface Props {
  notes: string;
}

export default function HandwrittenNotes({ notes }: Props) {
  // Store raw notes for PDF generation
  useEffect(() => {
    setNotesForPDF(notes);
  }, [notes]);

  return (
    <div
      id="notes-container"
      className="
      bg-[#fffdf7]
      text-black
      rounded-xl
      p-6
      shadow-lg
      border
      border-gray-300
      font-serif
      "
      style={{
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 31px, #93c5fd 32px)",
        fontFamily: "'Caveat', cursive",
        fontSize: "32px",
        lineHeight: "32px",
        fontWeight: "600",
        textShadow: "1px 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      <h1 className="text-3xl font-bold mb-4 text-gray-900" style={{ fontSize: "36px" }}>
        📖 Notes
      </h1>

<ReactMarkdown
  components={{
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold text-blue-800 mb-4 border-b-2 border-blue-400 pb-2" style={{ fontSize: "40px", fontWeight: "700", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="text-3xl font-bold text-red-700 mt-8 mb-4 bg-red-50 p-3 rounded" style={{ fontSize: "36px", fontWeight: "700", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold text-green-800 mt-6 mb-3" style={{ fontSize: "34px", fontWeight: "700", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
        {children}
      </h3>
    ),

    h4: ({ children }) => (
      <h4 className="text-xl font-semibold text-purple-800 mt-4 mb-2" style={{ fontSize: "32px", fontWeight: "700", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>
        {children}
      </h4>
    ),

    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-gray-900" style={{ fontSize: "32px" }}>
        {children}
      </p>
    ),

    strong: ({ children }) => (
      <strong className="text-red-700 font-bold" style={{ fontWeight: "800", color: "#b91c1c", backgroundColor: "rgba(254, 242, 242, 0.6)", padding: "0 2px", borderRadius: "2px" }}>
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="text-blue-700 italic" style={{ fontStyle: "italic", color: "#1d4ed8" }}>
        {children}
      </em>
    ),

    del: ({ children }) => (
      <del className="text-gray-500 line-through" style={{ textDecoration: "line-through", color: "#6b7280" }}>
        {children}
      </del>
    ),

    ul: ({ children }) => (
      <ul className="list-disc ml-8 mb-4" style={{ fontSize: "32px" }}>
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal ml-8 mb-4" style={{ fontSize: "32px" }}>
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="mb-2" style={{ fontSize: "32px" }}>
        {children}
      </li>
    ),

    blockquote: ({ children }) => (
      <div className="border-l-4 border-blue-600 bg-blue-50 p-4 my-4 rounded" style={{ fontSize: "30px", fontStyle: "italic", color: "#1e3a5f" }}>
        {children}
      </div>
    ),

    hr: () => (
      <hr className="my-6 border-t-2 border-dashed border-gray-400" style={{ borderColor: "#9ca3af" }} />
    ),

    code: ({ children }) => (
      <pre className="bg-gray-200 p-4 rounded-lg overflow-auto text-base my-4 border border-gray-300" style={{ fontSize: "26px", fontFamily: "'Courier New', monospace", fontWeight: "600" }}>
        {children}
      </pre>
    ),

    table: ({ children }) => (
      <table className="table-auto border-collapse border border-gray-500 w-full my-4" style={{ fontSize: "28px" }}>
        {children}
      </table>
    ),

    th: ({ children }) => (
      <th className="border border-gray-500 bg-gray-300 p-3 font-bold" style={{ fontSize: "30px" }}>
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="border border-gray-500 p-2" style={{ fontSize: "28px" }}>
        {children}
      </td>
    ),
  }}
>
  {notes}
</ReactMarkdown>

    
    </div>
  );
}