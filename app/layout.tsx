import type { Metadata, Viewport } from "next";
import "./globals.css";
import PetRouter from "@/lib/components/pet-router";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#fdfaf7",
};

export const metadata: Metadata = {
  title: "Charlie",
  description: "Cat sitting pour Charlie",
  manifest: "/charlie-management/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Charlie",
  },
  openGraph: {
    title: "Charlie",
    description: "Cat sitting pour Charlie",
    images: ["/charlie-management/charlie.jpg"],
  },
  icons: {
    icon: "/charlie-management/charlie.jpg",
    apple: "/charlie-management/charlie.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-charlie-50 min-h-screen font-sans">
        <PetRouter>{children}</PetRouter>
      </body>
    </html>
  );
}
