import { WebSocketServer } from "ws";
import http from "http";
import { setupWSConnection } from "y-websocket/bin/utils";

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

server.listen(1234, () => {
  console.log("Yjs WebSocket server running on ws://localhost:1234");
});
