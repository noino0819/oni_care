"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreVertical } from "lucide-react";

interface Terms {
  id: string;
  code: string;
  title: string;
  content: string;
  version: string;
}

export default function TermsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<Terms | null>(null);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      // 실제 구현 시 API 호출
      // const res = await fetch("/api/terms/service");
      // const data = await res.json();
      
      // 임시 데이터
      setTerms({
        id: "1",
        code: "terms_service",
        title: "서비스 이용약관",
        content: `제 1조 (목적)

이 약관은 현대그린푸드가 운영하는 그리팅 케어 어플에서 제공하는 서비스다.

제 2조 (정의)

"서비스"란 회사가 제공하는 모든 서비스를 말합니다.
"회원"이란 이 약관에 따라 이용계약을 체결하고 서비스를 이용하는 고객을 말합니다.
"아이디(ID)"란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인한 문자 또는 숫자의 조합을 말합니다.

제 3조 (약관의 게시 및 개정)

회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터 적용일자 전일까지 공지합니다.

제 4조 (서비스의 제공)

회사는 다음의 서비스를 제공합니다.
1. 건강관리 서비스
2. 식단 기록 서비스
3. 영양 정보 제공 서비스
4. 기타 회사가 정하는 서비스

제 5조 (회원가입)

회원가입은 이용자가 이 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.

제 6조 (회원 탈퇴 및 자격 상실)

회원은 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원탈퇴를 처리합니다.
탈퇴 후 30일 이후 재가입이 가능합니다.

제 7조 (개인정보보호)

회사는 회원의 개인정보를 보호하기 위해 관계 법령이 정하는 바에 따라 개인정보처리방침을 수립하고 이를 공개합니다.`,
        version: "1.0",
      });
    } catch (error) {
      console.error("Error fetching terms:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">서비스 이용약관</h1>
          <button className="p-1">
            <MoreVertical className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </header>

      {/* 내용 */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {terms?.content}
          </div>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => router.back()}
          className="w-full py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}

