import Session from "./session";

export default function Page({
  params,
}: {
  params: { sessionId: string };
}) {
  return <Session sessionId={params.sessionId} />;
}
