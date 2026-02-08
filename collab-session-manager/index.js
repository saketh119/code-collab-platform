import express from "express";
import cors from "cors";
import { exec } from "child_process";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

/**
 * sessionId -> { containerName }
 */
const sessions = new Map();

/**
 * START SESSION
 */
app.post("/start-session", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID required" });
  }

  const sessionId = crypto.randomUUID();
  const containerName = `collab_${sessionId}`;

  exec(`docker run -d -P --name ${containerName} collab-runtime`, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to start session" });
    }

    // Store session in memory
    sessions.set(sessionId, { containerName });

    exec(`docker inspect ${containerName}`, async (err2, stdout) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Failed to inspect container" });
      }

      const info = JSON.parse(stdout)[0];
      const port = info.NetworkSettings.Ports["3000/tcp"][0].HostPort;

      // Save session to database
      try {
        await prisma.codeSession.create({
          data: {
            id: sessionId,
            containerName,
            ownerId: userId,
            participants: [userId],
            isPublic: false,
          },
        });

        res.json({
          sessionId,
          wsUrl: `ws://localhost:${port}`,
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Clean up container if DB save fails
        exec(`docker rm -f ${containerName}`, () => { });
        res.status(500).json({ error: "Failed to save session" });
      }
    });
  });
});

/**
 * GET USER SESSIONS
 */
app.get("/sessions/:userId", async (req, res) => {
  try {
    const sessions = await prisma.codeSession.findMany({
      where: { ownerId: req.params.userId },
      orderBy: { lastActive: "desc" },
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

/**
 * SAVE FILE INSIDE CONTAINER
 */
app.post("/save-file", (req, res) => {
  const { sessionId, content } = req.body;

  const session = sessions.get(sessionId);
  if (!session) {
    console.log("SESSION LOOKUP FAILED:", sessionId);
    return res.status(404).json({ error: "Session not found" });
  }

  const { containerName } = session;
  const escaped = JSON.stringify(content);

  const cmd = `docker exec ${containerName} sh -c "cd /app/workspace && printf %s ${escaped} > main.js"`;

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
 * RUN CODE INSIDE CONTAINER
 */
app.post("/run-code/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const { containerName } = session;
  const cmd = `docker exec ${containerName} sh -c "cd /app/workspace && node main.js 2>&1"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Execution error:", err);
      return res.json({ output: stderr || err.message });
    }

    res.json({ output: stdout });
  });
});

/**
 * STOP SESSION
 */
app.post("/stop-session/:id", async (req, res) => {
  const sessionId = req.params.id;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  exec(`docker rm -f ${session.containerName}`, async () => {
    sessions.delete(sessionId);

    // Delete from database
    try {
      await prisma.codeSession.delete({
        where: { id: sessionId },
      });
    } catch (error) {
      console.error("Failed to delete session from DB:", error);
    }

    res.json({ message: "Session stopped" });
  });
});

app.listen(4000, () => {
  console.log("Session Manager running on http://localhost:4000");
});
