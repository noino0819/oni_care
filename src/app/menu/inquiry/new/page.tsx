"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronDown, MessageCircle } from "lucide-react";
import { InquiryType } from "@/types/menu";

export default function NewInquiryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [inquiryTypes, setInquiryTypes] = useState<InquiryType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/");
          return;
        }

        // 사용자 이름 가져오기
        const { data: userData } = await supabase
          .from("users")
          .select("name")
          .eq("id", session.user.id)
          .single();

        setUserName(userData?.name || "회원");

        // 문의 유형 가져오기
        const { data: typesData } = await supabase
          .from("inquiry_types")
          .select("*")
          .eq("is_active", true)
          .order("display_order");

        setInquiryTypes(typesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!selectedTypeId || !content.trim()) {
      alert("문의 유형과 내용을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/");
        return;
      }

      const { error } = await supabase.from("inquiries").insert({
        user_id: session.user.id,
        inquiry_type_id: selectedTypeId,
        content: content.trim(),
        status: "pending",
      });

      if (error) throw error;

      router.push("/menu/inquiry");
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("문의 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = inquiryTypes.find((t) => t.id === selectedTypeId);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-20 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">1:1 문의하기</h1>
          <span className="text-sm font-medium text-[#9F85E3]">등록중</span>
        </div>
      </header>

      <div className="px-4">
        {/* 안내 배너 */}
        <div className="bg-gray-50 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">안녕하세요 {userName}님</p>
              <p className="text-sm text-gray-500 mt-1">
                휴일을 제외한 평일에는 2일 이내에 답변드릴께요
              </p>
              <p className="text-sm text-gray-500">
                문의 상태는 나의 문의 내역에서 확인하실 수 있어요
              </p>
            </div>
          </div>
        </div>

        {/* 문의 유형 */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">문의 유형</h3>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white"
            >
              <span className={selectedType ? "text-gray-800" : "text-gray-400"}>
                {selectedType ? selectedType.name : "문의 유형을 선택해주세요"}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {inquiryTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedTypeId(type.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedTypeId === type.id ? "bg-[#9F85E3]/5 text-[#9F85E3]" : "text-gray-800"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 문의 내용 */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">문의 내용</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="질문내용을 작성해주세요(500자 이내)"
            maxLength={500}
            className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#9F85E3] transition-colors"
          />
          <p className="text-right text-sm text-gray-400 mt-1">
            {content.length}/500
          </p>
        </div>
      </div>

      {/* 등록하기 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedTypeId || !content.trim()}
          className={`w-full py-4 text-white text-center font-semibold rounded-full transition-colors ${
            submitting || !selectedTypeId || !content.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#9F85E3] hover:bg-[#8B74D1]"
          }`}
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}

