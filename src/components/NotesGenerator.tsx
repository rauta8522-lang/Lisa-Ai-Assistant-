import React from "react";

interface Props {
  notes: string;
}

export default function NotesGenerator({ notes }: Props) {
  if (!notes) return null;

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
      whitespace-pre-wrap
      "
    >
      {notes}
    </div>
  );
}