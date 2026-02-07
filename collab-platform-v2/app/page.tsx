"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="h-screen flex items-center justify-center bg-neutral-100">
        <p className="text-neutral-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <div className="text-center px-8 max-w-2xl">
        <h1 className="text-6xl font-bold text-white mb-6">
          Collab Platform
        </h1>
        <p className="text-xl text-neutral-300 mb-12">
          Real-time collaborative coding with live terminals.
          <br />
          Code together, anywhere.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg bg-white text-neutral-900 font-semibold hover:bg-neutral-100 transition shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
