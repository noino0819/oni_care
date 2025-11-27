"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Notice } from "@/types/menu";

// 7일 이내 등록 여부 확인
function isNew(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

// 날짜 포맷
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export default function NoticesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const { data, error } = await supabase
          .from("notices")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotices(data || []);
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotices();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">공지사항</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]"></div>
        </div>
      ) : notices.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-40">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            지금은 공지사항이 없어요
          </p>
          <p className="text-sm text-gray-500">
            중요한 공지가 생기면 바로 알려드릴께요!
          </p>
        </div>
      ) : (
        <div className="px-4">
          <div className="py-4">
            <h2 className="text-base font-semibold text-gray-900 mb-1">공지사항</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/menu/notices/${notice.id}`}
                className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors -mx-4 px-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 truncate">{notice.title}</p>
                    {isNew(notice.created_at) && (
                      <span className="text-xs font-semibold text-[#9F85E3]">NEW</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(notice.created_at)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

