//terminal ws logic
import { useEffect, useRef, useState } from "react";
import { connectTerminal } from "@/lib/websockets";

export function useTerminal() {
  const [output, setOutput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = connectTerminal((data) => {
      setOutput((prev) => prev + data);
    });

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const sendInput = (input: string) => {
    if (wsRef.current) {
      wsRef.current.send(input + "\n");
    }
  };

  return {
    output,
    sendInput,
  };
}
