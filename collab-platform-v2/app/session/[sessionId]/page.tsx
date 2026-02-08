import Session from "./session";

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <Session sessionId={sessionId} />;
}
