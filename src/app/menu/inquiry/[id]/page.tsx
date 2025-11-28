"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronDown, MessageCircle, FileText, User } from "lucide-react";
import { Inquiry, InquiryType } from "@/types/menu";

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [inquiryTypes, setInquiryTypes] = useState<InquiryType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!params.id) return;

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

        // 문의 상세 가져오기
        const { data: inquiryData, error } = await supabase
          .from("inquiries")
          .select(`
            *,
            inquiry_type:inquiry_types(*)
          `)
          .eq("id", params.id)
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;

        setInquiry(inquiryData);
        setSelectedTypeId(inquiryData.inquiry_type_id);
        setContent(inquiryData.content);

        // 문의 유형 가져오기
        const { data: typesData } = await supabase
          .from("inquiry_types")
          .select("*")
          .eq("is_active", true)
          .order("display_order");

        setInquiryTypes(typesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/menu/inquiry");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id, supabase, router]);

  const handleUpdate = async () => {
    if (!selectedTypeId || !content.trim()) {
      alert("문의 유형과 내용을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("inquiries")
        .update({
          inquiry_type_id: selectedTypeId,
          content: content.trim(),
        })
        .eq("id", params.id);

      if (error) throw error;

      setIsEditing(false);
      // 데이터 새로고침
      const { data: updatedData } = await supabase
        .from("inquiries")
        .select(`
          *,
          inquiry_type:inquiry_types(*)
        `)
        .eq("id", params.id)
        .single();

      if (updatedData) {
        setInquiry(updatedData);
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
      alert("수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = inquiryTypes.find((t) => t.id === selectedTypeId);
  const statusText = inquiry?.status === "answered" ? "답변 완료" : "미답변";
  const statusColor = inquiry?.status === "answered" ? "text-[#9F85E3]" : "text-gray-500";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]"></div>
      </div>
    );
  }

  if (!inquiry) {
    return null;
  }

  const canEdit = inquiry.status === "pending" && !isEditing;
  const isEditMode = inquiry.status === "pending" && isEditing;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-20 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">1:1 문의하기</h1>
          <span className={`text-sm font-medium ${statusColor}`}>
            {isEditMode ? "등록중" : statusText}
          </span>
        </div>
      </header>

      <div className="px-4">
        {/* 안내 배너 */}
        <div className="bg-gray-50 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">그리팅 케어 문의하기</p>
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
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">문의 유형</h3>
          </div>
          
          {isEditMode ? (
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
          ) : (
            <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
              <span className="text-gray-800">
                {inquiry.inquiry_type?.name || "문의 유형"}
              </span>
            </div>
          )}
        </div>

        {/* 문의 내용 */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">문의 내용</h3>
          </div>
          
          {isEditMode ? (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="문의 내용을 입력해 주세요"
                maxLength={500}
                className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#9F85E3] transition-colors"
              />
              <p className="text-right text-sm text-gray-400 mt-1">
                {content.length}/500
              </p>
            </>
          ) : (
            <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 min-h-[120px]">
              <p className="text-gray-800 whitespace-pre-wrap">{inquiry.content}</p>
            </div>
          )}
        </div>

        {/* 답변 내용 (답변 완료 시에만) */}
        {inquiry.status === "answered" && inquiry.answer && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">답변 내용</h3>
            </div>
            <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 min-h-[120px]">
              <p className="text-gray-800 whitespace-pre-wrap">{inquiry.answer}</p>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
        {isEditMode ? (
          <button
            onClick={handleUpdate}
            disabled={submitting || !selectedTypeId || !content.trim()}
            className={`w-full py-4 text-white text-center font-semibold rounded-full transition-colors ${
              submitting || !selectedTypeId || !content.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#9F85E3] hover:bg-[#8B74D1]"
            }`}
          >
            {submitting ? "수정 중..." : "등록하기"}
          </button>
        ) : canEdit ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-4 bg-[#9F85E3] text-white text-center font-semibold rounded-full hover:bg-[#8B74D1] transition-colors"
          >
            수정하기
          </button>
        ) : (
          <button
            onClick={() => router.push("/menu/inquiry")}
            className="w-full py-4 bg-[#9F85E3] text-white text-center font-semibold rounded-full hover:bg-[#8B74D1] transition-colors"
          >
            확인
          </button>
        )}
      </div>
    </div>
  );
}


