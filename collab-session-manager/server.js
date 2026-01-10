import fs from "fs/promises";
import path from "path";

/**
 * Save file to workspace
 * POST /save-file
 * body: { sessionId, content }
 */
app.post("/save-file", async (req, res) => {
  const { sessionId, content } = req.body;

  if (!sessionId || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    // Each session container maps /workspace
    const workspacePath = path.join(
      "/var/lib/collab-sessions",
      sessionId,
      "workspace",
      "main.code"
    );

    await fs.writeFile(workspacePath, content, "utf8");

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save file" });
  }
});
// Save file INSIDE the Docker container (container-only storage)
app.post("/save-file", (req, res) => {
  const { sessionId, content } = req.body;

  if (!sessionId || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const session = sessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const containerId = session.containerId;

  // Write file inside the container
  const cmd = `docker exec ${containerId} sh -c "printf %s ${JSON.stringify(
    content
  )} > /workspace/main.code"`;

  exec(cmd, (err) => {
    if (err) {
      console.error("Save failed:", err);
      return res.status(500).json({ error: "Failed to save file" });
    }

    res.json({ ok: true });
  });
});
