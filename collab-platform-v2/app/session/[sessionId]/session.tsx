"use client";

import { useSearchParams } from "next/navigation";
import Terminal from "@/components/Terminal";
import Editor from "@/components/editor/Editor";

export default function Session({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams();
  const wsUrl = searchParams.get("ws");

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-white">
      {/* Header */}
      <header className="h-12 px-4 flex items-center border-b border-neutral-800">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400">Session</span>
          <span className="text-xs text-neutral-500">{sessionId}</span>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col">
        {/* Editor */}
        <div className="flex-1 border-b border-neutral-800">
          <Editor sessionId={sessionId} />
        </div>

        {/* Terminal */}
        <div className="h-64">
          {wsUrl && <Terminal wsUrl={wsUrl} />}
        </div>
      </div>
    </div>
  );
}
