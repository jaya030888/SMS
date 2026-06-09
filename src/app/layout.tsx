import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maa Gauri PVT ITI",
  description: "Student management system for Maa Gauri Private ITI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
