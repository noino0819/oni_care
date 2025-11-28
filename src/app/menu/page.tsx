"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Bell, ChevronRight, User } from "lucide-react";
import { MenuPageSkeleton } from "@/components/ui/LoadingSpinner";

// 아이콘 컴포넌트들
const NoticeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChallengeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PointIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface User {
  id: string;
  name?: string;
  email: string;
}

export default function MenuPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/");
          return;
        }

        // 사용자 정보 가져오기
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          name: userData?.name || "회원",
          email: session.user.email || "",
        });

        // 읽지 않은 알림 개수 가져오기
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .eq("is_read", false);

        setUnreadCount(count || 0);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const quickMenuItems = [
    { href: "/menu/notices", label: "공지사항", icon: NoticeIcon },
    { href: "/challenge", label: "챌린지", icon: ChallengeIcon },
    { href: "/points", label: "포인트", icon: PointIcon },
  ];

  const nutritionMenuItems = [
    { href: "/record", label: "식사기록" },
    { href: "/supplement", label: "영양제" },
  ];

  const activityMenuItems = [
    { href: "/challenge", label: "챌린지" },
    { href: "/content", label: "컨텐츠" },
    { href: "/points", label: "포인트" },
    { href: "/history", label: "나의 히스토리" },
  ];

  const accountMenuItems = [
    { href: "/menu/profile-edit", label: "회원정보수정" },
    { href: "/menu/marketing", label: "마케팅 정보 수신동의" },
    { href: "/menu/account-link", label: "계정 연동 관리" },
    { href: "/menu/inquiry", label: "1:1 문의하기" },
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 헤더 - 항상 표시 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">전체 메뉴</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      <div className="px-4">
        {/* 프로필 섹션 - 로딩 시 스켈레톤 */}
        {loading ? (
          <>
            <div className="py-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="py-5 border-b border-gray-100">
              <div className="flex justify-around">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-gray-200 rounded-2xl animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            {[1, 2, 3].map((section) => (
              <div key={section} className="py-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center justify-between px-4 py-4 border-b border-gray-100 last:border-0">
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
        <>
        {/* 프로필 섹션 */}
        <div className="py-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {user?.name || "회원"}<span className="font-normal text-gray-600"> 님</span>
            </span>
          </div>
          <Link href="/menu/notifications" className="relative p-2">
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* 강조 메뉴 (퀵메뉴) */}
        <div className="py-5 border-b border-gray-100">
          <div className="flex justify-around">
            {quickMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                  <item.icon />
                </div>
                <span className="text-xs text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 영양 섹션 */}
        <div className="py-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">영양</h2>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            {nutritionMenuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-4 hover:bg-gray-100 transition-colors ${
                  index !== nutritionMenuItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-gray-800">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* 활동 섹션 */}
        <div className="py-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">활동</h2>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            {activityMenuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-4 hover:bg-gray-100 transition-colors ${
                  index !== activityMenuItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-gray-800">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* 회원정보 관리 섹션 */}
        <div className="py-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">회원정보 관리</h2>
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            {accountMenuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-4 hover:bg-gray-100 transition-colors ${
                  index !== accountMenuItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-gray-800">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* 하단 링크 및 로그아웃 */}
        <div className="py-6 flex items-center justify-center gap-4 text-sm">
          <Link href="/privacy" className="text-gray-500 hover:text-gray-700 underline">
            개인정보 처리방침
          </Link>
          <Link href="/terms" className="text-gray-500 hover:text-gray-700 underline">
            이용약관
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            로그아웃
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

