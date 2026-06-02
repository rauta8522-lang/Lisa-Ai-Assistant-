import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateNotes(topic: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(`
Create COMPLETE EXAM-ORIENTED STUDY NOTES on:

${topic}

IMPORTANT RULES:

- Do NOT act like Lisa
- Do NOT add jokes
- Do NOT add conversation
- Start directly with notes
- Use proper Markdown formatting
- Make notes suitable for university exams
- Highlight important definitions
- Use tables wherever required
- Every major topic must contain diagrams
- Every chapter must contain at least one flowchart
- Include previous year questions
- Include viva questions
- Include 5 marks answers
- Include 10 marks answers
- Use neat exam-oriented formatting

FORMAT:

# Topic Name

## Introduction

Write a detailed introduction.

---

## Definition

Provide proper textbook definitions.

Highlight important definitions.

---

## Key Concepts

Explain all concepts in simple language.

---

## Important Points

- Point 1
- Point 2
- Point 3
- Point 4

---

## Detailed Explanation

Explain all major concepts in detail.

---

## Diagram

Provide labelled exam-oriented diagrams.

Example:

Heat Engine

       QH
       ↓
 ┌─────────┐
 │ Engine  │
 └─────────┘
       ↓ W
       ↓
      QC

Provide multiple diagrams if needed.

---

## Flowchart

Provide flowcharts wherever applicable.

Example:

Animal Kingdom
│
├── Non-Chordata
│
└── Chordata
    ├── Pisces
    ├── Amphibia
    ├── Reptilia
    ├── Aves
    └── Mammalia

---

## Important Table

Create comparison tables whenever useful.

Example:

| Feature | Open System | Closed System |
|----------|------------|------------|
| Mass Transfer | Yes | No |
| Energy Transfer | Yes | Yes |

---

## Key Facts

- Fact 1
- Fact 2
- Fact 3

---

## Previous Year Questions

Provide important university exam questions.

---

## Viva Questions

Provide 5 viva questions with short answers.

Example:

Q1. What is Thermodynamics?

Ans. Thermodynamics is the science dealing with heat and work interactions.

---

## 5 Marks Questions

Generate 5 important university-level 5 marks questions.

For each question provide:

- Answer
- Important points
- Required diagram
- Flowchart if applicable

Example:

Q1. Explain Heat Engine.

Answer:
...

Diagram:

       QH
       ↓
 ┌─────────┐
 │ Engine  │
 └─────────┘
       ↓ W
       ↓
      QC

---

## 10 Marks Questions

Generate 5 important university-level 10 marks questions.

For each question provide:

- Detailed Answer
- Step-by-step explanation
- Labelled diagram
- Flowchart
- Important exam points

Example:

Q1. Explain Classification of Animal Kingdom.

Flowchart:

Animal Kingdom
│
├── Non-Chordata
│
└── Chordata
    ├── Pisces
    ├── Amphibia
    ├── Reptilia
    ├── Aves
    └── Mammalia

Important Exam Points:
- Point 1
- Point 2

---

## Exam Notes

Provide important last-minute revision points.

---

## Summary

Provide short revision notes for quick exam preparation.

Return ONLY notes in Markdown format.
`);

    const notes = result.response.text();

    return {
      notes,
      diagramPrompt: `${topic} educational textbook diagram`,
    };
  } catch (error) {
    console.error("Notes Generation Error:", error);

    return {
      notes: `
# Error

Unable to generate notes.

Possible reasons:

- Gemini API quota exhausted
- Invalid API key
- Internet issue
- Gemini service unavailable

Please try again later.
`,
      diagramPrompt: topic,
    };
  }
}