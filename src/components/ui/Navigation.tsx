"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, PieChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const pathname = usePathname();

  // 하단 메뉴를 숨길 경로 목록
  const hiddenPaths = [
    "/",
    "/signup",
    "/signup/terms",
    "/signup/verify",
    "/onboarding",
    "/find-account",
  ];

  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  const navItems = [
    { href: "/home", label: "홈", icon: Home },
    { href: "/record", label: "기록", icon: ClipboardList },
    { href: "/report", label: "분석", icon: PieChart },
    { href: "/profile", label: "MY", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full space-y-1"
            >
              <Icon 
                className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-primary" : "text-gray-400"
                )} 
              />
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
