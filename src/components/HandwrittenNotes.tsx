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
    

      <ReactMarkdown
  components={{
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-6 mt-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mb-4 mt-8 underline">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold mb-3 mt-5">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc ml-8 mb-4">
        {children}
      </ul>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-black">
        {children}
      </strong>
    ),
  }}
     >
     {notes}
    </ReactMarkdown>
    </div>
  );
}