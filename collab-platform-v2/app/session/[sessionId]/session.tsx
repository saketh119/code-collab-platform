"use client";

import { useSearchParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import TerminalTabs from "@/components/TerminalTabs";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Play, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Session({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams();
  const wsUrl = searchParams.get("ws");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await fetch(`http://localhost:4000/run-code/${sessionId}`, {
        method: "POST",
      });

      if (!response.ok) {
        toast.error("Failed to run code");
        return;
      }

      toast.success("Code executed! Check terminal for output.");
    } catch (error) {
      toast.error("Failed to connect to session manager");
    } finally {
      setIsRunning(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Session link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-white">
      {/* Header */}
      <header className="h-12 px-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-950">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400">Session</span>
          <span className="text-xs text-neutral-500 font-mono">{sessionId.slice(0, 12)}...</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded transition"
          >
            <Play className="w-4 h-4" />
            {isRunning ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 rounded transition"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </header>

      {/* Resizable workspace */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="vertical">
          {/* Editor Panel */}
          <Panel defaultSize={65} minSize={30}>
            <div className="h-full bg-neutral-900">
              <Editor sessionId={sessionId} />
            </div>
          </Panel>

          {/* Resize Handle */}
          <Separator className="h-1 bg-neutral-800 hover:bg-blue-500 transition cursor-row-resize" />

          {/* Terminal Panel */}
          <Panel defaultSize={35} minSize={20}>
            {wsUrl && <TerminalTabs initialWsUrl={wsUrl} />}
          </Panel>
        </Group>
      </div>
    </div>
  );
}
