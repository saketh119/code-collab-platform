import pty from "node-pty";

export function createTerminal(onData) {
  const shell =
    process.platform === "win32"
      ? "powershell.exe"
      : "bash";

  const terminal = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: "/workspace",
    env: process.env
  });

  terminal.on("data", (data) => {
    onData(data);
  });

  return terminal;
}
