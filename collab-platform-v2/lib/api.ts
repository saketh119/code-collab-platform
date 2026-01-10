// lib/api.ts

export async function startSession() {
  const res = await fetch("http://localhost:4000/start-session", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to start session");
  }

  // Expected: { sessionId, wsUrl }
  return res.json();
}
export async function saveFile(
  sessionId: string,
  content: string
) {
  const res = await fetch("http://localhost:4000/save-file", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, content }),
  });

  if (!res.ok) {
    throw new Error("Failed to save file");
  }
}
