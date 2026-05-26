// lib/api.ts
const API_URL = 'http://localhost:5000/api';

export const saveContactToBackend = async (contact: any) => {
  try {
    const response = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    return await response.json();
  } catch (error) {
    console.error("Backend error:", error);
  }
};