"use client";

import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { saveFile } from "@/lib/api";
import { useSession } from "next-auth/react";

function getUserColor(userId: string): string {
  // Generate consistent color from user ID
  const colors = [
    "#ff4d4f",
    "#40a9ff",
    "#73d13d",
    "#9254de",
    "#faad14",
    "#13c2c2",
    "#eb2f96",
    "#52c41a",
  ];
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function Editor({ sessionId }: { sessionId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const saveTimeout = useRef<any>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (initializedRef.current || !session?.user) return;
    initializedRef.current = true;

    let editor: any;
    let binding: any;
    let provider: WebsocketProvider | null = null;
    let ydoc: Y.Doc | null = null;

    async function init() {
      if (!containerRef.current || !session?.user) return;

      // 🔒 Client-only imports
      const monaco = await import("monaco-editor");
      const { MonacoBinding } = await import("y-monaco");

      // 1️⃣ Yjs document
      ydoc = new Y.Doc();

      provider = new WebsocketProvider(
        "ws://localhost:1234",
        sessionId,
        ydoc
      );

      const yText = ydoc.getText("monaco");

      // 2️⃣ User identity (awareness)
      const user = { name: session.user.name, color: getUserColor(session.user.id) };
      provider.awareness.setLocalState({ user });

      // 3️⃣ Monaco model (single, normalized)
      const model = monaco.editor.createModel(
        "",
        "javascript",
        monaco.Uri.parse(`inmemory://model/${sessionId}.js`)
      );
      model.setEOL(monaco.editor.EndOfLineSequence.LF);

      // 4️⃣ Editor
      editor = monaco.editor.create(containerRef.current, {
        model,
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 14,
      });

      // 5️⃣ Bind Monaco ↔ Yjs
      binding = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        provider.awareness
      );

      // 6️⃣ Auto-save from Yjs (debounced)
      yText.observe(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);

        saveTimeout.current = setTimeout(() => {
          saveFile(sessionId, yText.toString()).catch(console.error);
        }, 2000);
      });
    }

    init();

    return () => {
      binding?.destroy();
      provider?.destroy();
      ydoc?.destroy();
      editor?.dispose();
    };
  }, [sessionId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
