"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
    Copy,
    ExternalLink,
    LogOut,
    Plus,
    Share2,
    Trash2,
    User,
} from "lucide-react";

type CodeSession = {
    id: string;
    containerName: string;
    isPublic: boolean;
    lastActive: string;
    createdAt: string;
    participants: string[];
};

type User = {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

export function DashboardClient({
    user,
    sessions,
}: {
    user: User;
    sessions: CodeSession[];
}) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateSession = async () => {
        setIsCreating(true);
        try {
            const response = await fetch("http://localhost:4000/start-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error("Failed to create session");
                return;
            }

            toast.success("Session created!");
            router.push(`/session/${data.sessionId}?ws=${encodeURIComponent(data.wsUrl)}`);
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsCreating(false);
        }
    };

    const handleShareSession = async (sessionId: string) => {
        const url = `${window.location.origin}/session/${sessionId}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        try {
            const response = await fetch(`http://localhost:4000/stop-session/${sessionId}`, {
                method: "POST",
            });

            if (!response.ok) {
                toast.error("Failed to delete session");
                return;
            }

            toast.success("Session deleted");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
            Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            "day"
        );
    };

    return (
        <div className="min-h-screen bg-neutral-100">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            Collab Platform
                        </h1>
                        <p className="text-sm text-neutral-600">
                            Collaborative Coding Workspace
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                            <User className="w-4 h-4" />
                            <span>{user.name || user.email}</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:text-neutral-900 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Create Session Button */}
                <div className="mb-8">
                    <button
                        onClick={handleCreateSession}
                        disabled={isCreating}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        {isCreating ? "Creating..." : "New Session"}
                    </button>
                </div>

                {/* Sessions Grid */}
                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                        Your Sessions
                    </h2>

                    {sessions.length === 0 ? (
                        <div className="bg-white rounded-lg p-12 text-center">
                            <p className="text-neutral-600">
                                No sessions yet. Create one to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border border-neutral-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-neutral-900 mb-1">
                                                Session
                                            </h3>
                                            <p className="text-xs text-neutral-500 font-mono">
                                                {session.id.slice(0, 8)}...
                                            </p>
                                        </div>
                                        {session.isPublic && (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                                Public
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-sm text-neutral-600 mb-4 space-y-1">
                                        <p>Created {formatDate(session.createdAt)}</p>
                                        <p>Active {formatDate(session.lastActive)}</p>
                                        <p>{session.participants.length} participant(s)</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/session/${session.id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded text-sm transition"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Open
                                        </button>
                                        <button
                                            onClick={() => handleShareSession(session.id)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded text-sm transition"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSession(session.id)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
