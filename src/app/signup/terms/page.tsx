"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Term {
  id: string;
  code: string;
  title: string;
  content: string;
  is_required: boolean;
}

export default function SignupTermsPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null); // For modal

  useEffect(() => {
    const fetchTerms = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("terms")
        .select("*")
        .order("created_at", { ascending: true }); // 순서 보장을 위해 정렬 필요 (code 등으로 정렬 추천)

      if (error) {
        console.error("Error fetching terms:", error);
        return;
      }

      if (data) {
        // 기획서 순서대로 정렬 (하드코딩된 순서 매핑)
        const order = ['terms_service', 'privacy_policy', 'sensitive_info', 'marketing', 'push_notification'];
        const sortedData = data.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
        
        setTerms(sortedData);
        
        // 초기 동의 상태 설정
        const initialAgreements: Record<string, boolean> = {};
        sortedData.forEach(term => {
          initialAgreements[term.code] = false;
        });
        setAgreements(initialAgreements);
      }
      setLoading(false);
    };

    fetchTerms();
  }, []);

  // 전체 동의 체크박스 로직
  const handleAllCheck = () => {
    const allChecked = Object.values(agreements).every(v => v);
    const newValue = !allChecked;
    
    const newAgreements = { ...agreements };
    terms.forEach(term => {
      newAgreements[term.code] = newValue;
    });
    setAgreements(newAgreements);
  };

  // 개별 체크박스 로직
  const handleCheck = (code: string) => {
    setAgreements(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // 필수 항목 동의 여부 확인
  const isRequiredChecked = terms
    .filter(term => term.is_required)
    .every(term => agreements[term.code]);

  const isAllChecked = terms.length > 0 && terms.every(term => agreements[term.code]);

  const handleNext = () => {
    if (!isRequiredChecked) return;

    // 약관 동의 정보를 sessionStorage에 저장
    sessionStorage.setItem("signup_terms", JSON.stringify(agreements));
    
    // 본인인증 페이지로 이동
    router.push("/signup/verify");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 sticky top-0 bg-white z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex-1 text-center font-medium text-lg pr-8">회원가입</div>
      </header>

      {/* Progress */}
      <div className="px-6 py-2">
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">1</div>
          <div className="h-[1px] w-4 bg-gray-300"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold">2</div>
          <div className="h-[1px] w-4 bg-gray-300"></div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-bold">3</div>
        </div>
        <div className="text-xs text-gray-500 mb-1">약관동의</div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6">
        <h1 className="text-2xl font-bold mb-8 leading-tight">
          가입을 위한 약관에<br />동의해주세요
        </h1>

        <div className="space-y-6">
          {/* 전체 동의 */}
          <div className="pb-4 border-b border-gray-100">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={handleAllCheck}
            >
              <span className="text-lg font-bold">전체동의</span>
              <div className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                isAllChecked ? "bg-primary border-primary" : "border-gray-300"
              )}>
                {isAllChecked && <Check className="h-4 w-4 text-white" />}
              </div>
            </div>
          </div>

          {/* 개별 약관들 */}
          <div className="space-y-4">
            {terms.map((term) => (
              <TermItem 
                key={term.id}
                label={`${term.title} (${term.is_required ? "필수" : "선택"})`}
                checked={agreements[term.code] || false} 
                onCheck={() => handleCheck(term.code)}
                onView={() => setSelectedTerm(term)}
              />
            ))}
          </div>
        </div>

        {/* 마케팅 동의 배너 */}
        <div className="mt-8 bg-gray-50 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">
            마케팅 수신 동의 시 <span className="font-bold text-primary">500포인트</span>를 지급해 드려요!
          </p>
        </div>

        <div className="mt-auto pt-6">
          <Button
            className="w-full h-14 text-base font-bold rounded-xl"
            size="lg"
            disabled={!isRequiredChecked}
            onClick={handleNext}
          >
            다 음
          </Button>
        </div>
      </div>

      {/* 약관 상세 모달 */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold pr-8">{selectedTerm.title} ({selectedTerm.is_required ? "필수" : "선택"})</h3>
              <button onClick={() => setSelectedTerm(null)} className="absolute right-6 top-6">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {selectedTerm.content}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button 
                className="w-full h-12 rounded-xl"
                onClick={() => setSelectedTerm(null)}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TermItem({ 
  label, 
  checked, 
  onCheck,
  onView
}: { 
  label: string; 
  checked: boolean; 
  onCheck: () => void; 
  onView: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={onCheck}>
        <div className={cn(
          "w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors",
          checked ? "bg-primary border-primary" : "border-gray-300"
        )}>
          {checked && <Check className="h-3 w-3 text-white" />}
        </div>
        <span className="text-base text-gray-600">{label}</span>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onView(); }}
        className="text-sm text-gray-400 underline decoration-gray-300 underline-offset-4 ml-2 flex-shrink-0"
      >
        보기
      </button>
    </div>
  );
}
