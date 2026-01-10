"use client";

import { startSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStart = async () => {
    const data = await startSession();

    startTransition(() => {
      router.push(
        `/session/${data.sessionId}?ws=${encodeURIComponent(data.wsUrl)}`
      );
    });
  };

  return (
    <main className="h-screen flex items-center justify-center bg-neutral-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-[320px] space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Collab Platform</h1>

        <p className="text-sm text-gray-500">
          Start an isolated coding session with a live terminal.
        </p>

        <button
          onClick={handleStart}
          disabled={isPending}
          className="w-full py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Starting session…" : "Start Session"}
        </button>
      </div>
    </main>
  );
}
