export function generateStaticParams() {
  return [];
}

export const revalidate = 0;

export default function PetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
