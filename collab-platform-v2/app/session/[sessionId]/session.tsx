"use client";

import { useSearchParams } from "next/navigation";
import Editor from "@/components/editor/Editor";
import TerminalTabs from "@/components/TerminalTabs";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function Session({ sessionId }: { sessionId: string }) {
  const searchParams = useSearchParams();
  const wsUrl = searchParams.get("ws");

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

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 rounded transition"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </header>

      {/* Resizable workspace */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="vertical">
          {/* Editor Panel */}
          <Panel defaultSize={65} minSize={30}>
            <div className="h-full bg-neutral-900">
              <Editor sessionId={sessionId} />
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="h-1 bg-neutral-800 hover:bg-blue-500 transition cursor-row-resize" />

          {/* Terminal Panel */}
          <Panel defaultSize={35} minSize={20}>
            {wsUrl && <TerminalTabs initialWsUrl={wsUrl} />}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
