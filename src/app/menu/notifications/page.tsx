"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";
import { NotificationsPageSkeleton } from "@/components/ui/LoadingSpinner";
import { Notification } from "@/types/menu";

// 날짜 포맷 (오늘이면 "오늘", 아니면 "MM월 DD일")
function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // 오늘인지 확인
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return "오늘";
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일`;
}

// 7일 이내 알림만 필터링
function isWithinSevenDays(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/");
          return;
        }

        // 7일 이내 알림만 가져오기
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotifications(data || []);

        // 읽음 처리
        if (data && data.length > 0) {
          const unreadIds = data.filter((n) => !n.is_read).map((n) => n.id);
          if (unreadIds.length > 0) {
            await supabase
              .from("notifications")
              .update({ is_read: true })
              .in("id", unreadIds);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [supabase, router]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link_url) {
      router.push(notification.link_url);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">알림</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      {loading ? (
        <div className="px-4 py-4">
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-40">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            아직은 확인할 알림이 없어요
          </p>
          <p className="text-sm text-gray-500">
            확인할 알림이 생기면 알려드릴께요!
          </p>
        </div>
      ) : (
        <div className="px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">알림</h2>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-gray-50 rounded-xl p-4 ${
                  notification.link_url ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 아이콘/이미지 */}
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {notification.icon_url ? (
                      <Image
                        src={notification.icon_url}
                        alt=""
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-gray-400"
                      >
                        <path
                          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.73 21a2 2 0 0 1-3.46 0"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{notification.title}</p>
                    {notification.content && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                    )}
                  </div>
                </div>

                {/* 날짜 */}
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-400">
                    {formatNotificationDate(notification.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

