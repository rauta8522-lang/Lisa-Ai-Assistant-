import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateNotes(topic: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

 const prompt = `
Create COMPLETE EXAM-ORIENTED STUDY NOTES on:

${topic}

IMPORTANT RULES:
- Do NOT act like Lisa
- Do NOT add jokes
- Do NOT add conversation
- Do NOT add any introduction message
- Start directly with notes
- Use professional formatting
- Use Markdown headings

Format:

# Topic Name

## Introduction

Detailed introduction.

## Definition

Proper definition.

## Key Concepts

Explain all concepts in simple English.

## Important Points

- Point 1
- Point 2
- Point 3

## Detailed Explanation

Explain all major topics.

## Diagrams

Create neat text diagrams (ASCII diagrams).

Example:

Heat Engine

        QH
        ↓
   +---------+
   | Engine  |
   +---------+
        ↓
        W

        ↓
        QC

Add all important diagrams related to the topic.

## Flowchart

Create flowcharts wherever applicable.

Example:

Animal Kingdom
│
├── Non-Chordata
│
└── Chordata

## Key Facts

- Fact 1
- Fact 2

## Exam Notes

Important exam-oriented points.

## Frequently Asked Questions

1. Question
2. Question

## Summary

Short revision notes.

Return only notes.
`;

  const result = await model.generateContent(prompt);

  return result.response.text();
}