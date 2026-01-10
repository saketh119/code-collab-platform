//start or stop session logic
import { useState } from "react";
import { startSession } from "@/lib/api";
import { useRouter } from "next/navigation";

export function useSession() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionId = await startSession();
      router.push(`/session/${sessionId}`);
    } catch (err) {
      setError("Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  return {
    createSession,
    loading,
    error,
  };
}
