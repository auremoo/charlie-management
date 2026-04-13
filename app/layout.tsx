import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Charlie 🐱",
  description: "Application de cat sitting pour Charlie",
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
      <body className={`${geist.className} bg-charlie-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
