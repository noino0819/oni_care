"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, PieChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/home", label: "홈", icon: Home },
    { href: "/record", label: "기록", icon: FileText },
    { href: "/report", label: "리포트", icon: PieChart },
    { href: "/profile", label: "마이", icon: User },
  ];

  // Don't show navigation on login page
  if (pathname === "/") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <div className="flex h-16 items-center justify-around px-4">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
