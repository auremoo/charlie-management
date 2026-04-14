import JoinClient from "./client";

export function generateStaticParams() {
  return [];
}

export const revalidate = 0;

export default function JoinWithCodePage() {
  return <JoinClient />;
}
