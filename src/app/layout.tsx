import type { Metadata } from "next";
import Navigation from "@/components/ui/Navigation";
import "./globals.css";
import Script from "next/script";

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
        <Script
          src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
