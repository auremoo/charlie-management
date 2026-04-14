import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Charlie",
  },
  openGraph: {
    title: "Charlie",
    description: "Cat sitting pour Charlie",
    images: ["/charlie.jpg"],
  },
  icons: {
    icon: "/charlie.jpg",
    apple: "/charlie.jpg",
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
        {children}
      </body>
    </html>
  );
}
