import React from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  notes: string;
}

export default function HandwrittenNotes({ notes }: Props) {
  return (
    <div
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
          "repeating-linear-gradient(white, white 31px, #dbeafe 32px)",
          fontFamily: "Caveat",
          fontSize: "28px",
      }}
    >
      <h1 className="text-2xl font-bold mb-4">
        📖 Notes
      </h1>
    

      <ReactMarkdown>
         {notes}
      </ReactMarkdown>
    </div>
  );
}