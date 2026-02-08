"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";

export default function Terminal({ wsUrl }: { wsUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!ref.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      theme: { background: "#000000" },
    });

    // Import FitAddon dynamically to avoid SSR issues
    import("@xterm/addon-fit").then(({ FitAddon }) => {
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (ref.current) {
        term.open(ref.current);
        term.focus();

        // Fit terminal after DOM is ready
        setTimeout(() => {
          try {
            fitAddon.fit();
          } catch (e) {
            // Ignore fit errors when terminal is hidden
          }
        }, 0);
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setStatus("connected");
      ws.onerror = () => setStatus("error");
      ws.onmessage = (e) => term.write(e.data);

      term.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });

      return () => {
        ws.close();
        wsRef.current = null;
        term.dispose();
      };
    });
  }, [wsUrl]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-xs px-2 py-1 bg-neutral-900 text-neutral-400">
        {status === "connecting" && "Connecting…"}
        {status === "connected" && "Terminal connected"}
        {status === "error" && "Connection error"}
      </div>
      <div ref={ref} className="flex-1" />
    </div>
  );
}
