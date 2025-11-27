import type { Metadata } from "next";
import { BottomNavigation } from "@/components/home/BottomNavigation";
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
      <body className="antialiased bg-background text-foreground">
        {children}
        <BottomNavigation />
        <Script
          src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
