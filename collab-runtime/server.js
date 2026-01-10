import { WebSocketServer } from "ws";
import { createTerminal } from "./terminal.js";

const PORT = 3000;

const wss = new WebSocketServer({ port: PORT });

console.log(`Runtime started on port ${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");

  const terminal = createTerminal((data) => {
    ws.send(data);
  });

  ws.on("message", (msg) => {
    terminal.write(msg.toString());
  });

  ws.on("close", () => {
    terminal.kill();
    console.log("Client disconnected");
  });
});
