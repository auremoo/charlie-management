import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f86c14",
};

export const metadata: Metadata = {
  title: "Charlie 🐱",
  description: "Application de cat sitting pour Charlie",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Charlie",
  },
  openGraph: {
    title: "Charlie 🐱",
    description: "Application de cat sitting pour Charlie",
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
      <body className="bg-charlie-50 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
