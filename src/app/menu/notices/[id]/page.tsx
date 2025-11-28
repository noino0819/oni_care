"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";
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

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotice() {
      if (!params.id) return;

      try {
        const { data, error } = await supabase
          .from("notices")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setNotice(data);
      } catch (error) {
        console.error("Error fetching notice:", error);
        router.push("/menu/notices");
      } finally {
        setLoading(false);
      }
    }

    fetchNotice();
  }, [params.id, supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]"></div>
      </div>
    );
  }

  if (!notice) {
    return null;
  }

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

      <div className="px-4 py-6">
        {/* 제목 및 날짜 */}
        <div className="border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-gray-900">{notice.title}</h2>
            {isNew(notice.created_at) && (
              <span className="text-sm font-semibold text-[#9F85E3]">NEW</span>
            )}
          </div>
          <p className="text-sm text-gray-400">{formatDate(notice.created_at)}</p>
        </div>

        {/* 본문 */}
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {notice.content}
          </p>
        </div>

        {/* 이미지 */}
        {notice.image_url && (
          <div className="mt-6 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={notice.image_url}
              alt={notice.title}
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}


