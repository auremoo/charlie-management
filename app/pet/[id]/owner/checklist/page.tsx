import Client from "./client";

export function generateStaticParams() {
  return [];
}

export const revalidate = 0;

export default function Page() {
  return <Client />;
}
