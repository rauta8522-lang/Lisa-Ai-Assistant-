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
      <h1 className="text-4xl font-bold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="text-3xl font-bold text-red-600 mt-8 mb-4 bg-red-50 p-2 rounded">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="text-2xl font-semibold text-green-700 mt-6 mb-3">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-gray-800">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="list-disc ml-8 mb-4">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal ml-8 mb-4">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="mb-2">
        {children}
      </li>
    ),

    blockquote: ({ children }) => (
      <div className="border-l-4 border-blue-500 bg-blue-50 p-3 my-4 rounded">
        {children}
      </div>
    ),

    code: ({ children }) => (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-base my-4">
        {children}
      </pre>
    ),

    table: ({ children }) => (
      <table className="table-auto border-collapse border border-gray-400 w-full my-4">
        {children}
      </table>
    ),

    th: ({ children }) => (
      <th className="border border-gray-400 bg-gray-200 p-2">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="border border-gray-400 p-2">
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