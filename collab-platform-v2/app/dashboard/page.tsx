import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch user's code sessions
    const sessions = await prisma.codeSession.findMany({
        where: {
            ownerId: session.user.id,
        },
        orderBy: {
            lastActive: "desc",
        },
    });

    return (
        <DashboardClient
            user={session.user}
            sessions={sessions.map((s) => ({
                id: s.id,
                containerName: s.containerName,
                isPublic: s.isPublic,
                lastActive: s.lastActive.toISOString(),
                createdAt: s.createdAt.toISOString(),
                participants: s.participants,
            }))}
        />
    );
}
