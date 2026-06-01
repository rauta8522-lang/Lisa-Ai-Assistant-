import { getLisaResponse } from "./geminiService";

export async function generateNotes(topic: string) {
  const prompt = `
You are a professional study notes generator.

IMPORTANT:
- Do NOT act as Lisa.
- Do NOT joke.
- Do NOT add emotions.
- Do NOT add conversation.
- Generate only study notes.

Topic: ${topic}

Format:
# Title

## Introduction

## Definition

## Detailed Explanation

## Important Points

## Diagram

## Exam Questions

## Summary

Use easy English.
`;
  
  return await getLisaResponse(prompt, []);
}