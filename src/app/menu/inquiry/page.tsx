"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronDown, ChevronUp, MessageCircle, Star, User, Ticket } from "lucide-react";
import { InquiryPageSkeleton } from "@/components/ui/LoadingSpinner";
import { FAQ, FAQCategory, Inquiry } from "@/types/menu";

// FAQ 카테고리 아이콘 매핑
const categoryIcons: Record<string, React.ReactNode> = {
  chat: <MessageCircle className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  coupon: <Ticket className="w-5 h-5" />,
};

export default function InquiryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/");
          return;
        }

        // FAQ 카테고리 가져오기
        const { data: categoriesData } = await supabase
          .from("faq_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order");

        setCategories(categoriesData || []);
        if (categoriesData && categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }

        // FAQ 가져오기
        const { data: faqsData } = await supabase
          .from("faqs")
          .select("*")
          .eq("is_active", true)
          .order("display_order");

        setFaqs(faqsData || []);

        // 내 문의내역 가져오기
        const { data: inquiriesData } = await supabase
          .from("inquiries")
          .select(`
            *,
            inquiry_type:inquiry_types(*)
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        setInquiries(inquiriesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, router]);

  // 선택된 카테고리의 FAQ 필터링
  const filteredFaqs = faqs.filter((faq) => faq.category_id === selectedCategory);

  // FAQ 개수
  const faqCount = filteredFaqs.length;

  // 선택된 카테고리 이름
  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name || "";

  // FAQ 토글
  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  // 문의 내용 15자 말줄임
  const truncateContent = (content: string, maxLength: number = 15) => {
    return content.length > maxLength ? content.slice(0, maxLength) + "..." : content;
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 헤더 - 항상 표시 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">1:1 문의하기</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      {loading ? (
        /* 로딩 시 스켈레톤 (헤더 제외) */
        <div className="px-4">
          <div className="py-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex gap-4 pb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-100 py-4 animate-pulse">
                    <div className="h-5 w-full bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="py-6 border-t border-gray-100">
            <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
      <div className="px-4">
        {/* 자주묻는 질문 섹션 */}
        <div className="py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">자주묻는 질문</h2>

          {/* 카테고리 버튼들 */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setExpandedFaq(null);
                }}
                className={`flex flex-col items-center gap-2 min-w-[64px] ${
                  selectedCategory === category.id
                    ? "text-[#9F85E3]"
                    : "text-gray-500"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#9F85E3]/10"
                      : "bg-gray-100"
                  }`}
                >
                  {categoryIcons[category.icon || "chat"] || <MessageCircle className="w-5 h-5" />}
                </div>
                <span className={`text-xs whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "font-semibold text-[#9F85E3]"
                    : "text-gray-600"
                }`}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>

          {/* FAQ 리스트 */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold text-gray-900">{selectedCategoryName}</h3>
              <span className="text-sm text-gray-400">총 {faqCount}개</span>
            </div>

            <div className="space-y-2">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="border-b border-gray-100">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#9F85E3] font-semibold">Q</span>
                      <span className="text-gray-800">{faq.question}</span>
                    </div>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedFaq === faq.id && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-start gap-2">
                        <span className="text-[#9F85E3] font-semibold">A</span>
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 나의 문의내역 섹션 */}
        <div className="py-6 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">나의 문의내역</h2>

          {inquiries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              문의 내역이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/menu/inquiry/${inquiry.id}`}
                  className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 -mx-4 px-4 transition-colors"
                >
                  <span className="text-gray-800">
                    {truncateContent(inquiry.content)}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      inquiry.status === "answered"
                        ? "bg-[#9F85E3] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {inquiry.status === "answered" ? "답변완료" : "미답변"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* 1:1 문의하기 버튼 - 항상 표시 */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <Link
          href="/menu/inquiry/new"
          className="block w-full py-4 bg-[#9F85E3] text-white text-center font-semibold rounded-full hover:bg-[#8B74D1] transition-colors"
        >
          1:1 문의하기
        </Link>
      </div>
    </div>
  );
}

