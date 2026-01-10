export function connectTerminal(
  onMessage: (data: string) => void
): WebSocket {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);

  ws.onmessage = (event) => {
    onMessage(event.data);
  };

  return ws;
}
