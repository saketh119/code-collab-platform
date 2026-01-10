import express from "express";
import cors from "cors";
import { exec } from "child_process";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * sessionId -> { containerName }
 */
const sessions = new Map();

/**
 * START SESSION
 */
app.post("/start-session", (req, res) => {
  const sessionId = crypto.randomUUID();
  const containerName = `collab_${sessionId}`;

  exec(`docker run -d -P --name ${containerName} collab-runtime`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to start session" });
    }

    // ✅ STORE SESSION HERE (this was missing / broken earlier)
    sessions.set(sessionId, { containerName });

    exec(`docker inspect ${containerName}`, (err2, stdout) => {
      const info = JSON.parse(stdout)[0];
      const port = info.NetworkSettings.Ports["3000/tcp"][0].HostPort;

      res.json({
        sessionId,
        wsUrl: `ws://localhost:${port}`,
      });
    });
  });
});


/**
 * SAVE FILE INSIDE CONTAINER (container-only storage)
 */
app.post("/save-file", (req, res) => {
  const { sessionId, content } = req.body;

  const session = sessions.get(sessionId);
  if (!session) {
    console.log("SESSION LOOKUP FAILED:", sessionId);
    return res.status(404).json({ error: "Session not found" });
  }

  const { containerName } = session;

  // Escape content safely
  const escaped = JSON.stringify(content);

  const cmd = `
docker exec ${containerName} sh -c "
cd /app/workspace &&
printf %s ${escaped} > main.js
"
`;

  exec(cmd, (err) => {
    if (err) {
      console.error("Save failed:", err);
      return res.status(500).json({ error: "Save failed" });
    }

    console.log("File saved inside container:", containerName);
    res.json({ ok: true });
  });
});




/**
 * STOP SESSION
 */
app.post("/stop-session/:id", (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  exec(`docker rm -f ${session.containerName}`, () => {
    sessions.delete(req.params.id);
    res.json({ message: "Session stopped" });
  });
});

app.listen(4000, () => {
  console.log("Session Manager running on http://localhost:4000");
});
