import type { Metadata } from "next";
import Navigation from "@/components/ui/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greating Care",
  description: "Your personal health and diet manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-background text-foreground pb-16">
        {children}
        <Navigation />
      </body>
    </html>
  );
}
