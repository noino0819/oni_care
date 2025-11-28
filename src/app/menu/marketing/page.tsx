"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function MarketingConsentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pushAgreed, setPushAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConsent();
  }, []);

  const fetchConsent = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setPushAgreed(data.marketing_push_agreed || false);
      setMarketingAgreed(data.marketing_sms_agreed || false);
    } catch (error) {
      console.error("Error fetching consent:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type: "push" | "marketing") => {
    const newValue = type === "push" ? !pushAgreed : !marketingAgreed;
    
    if (type === "push") {
      setPushAgreed(newValue);
    } else {
      setMarketingAgreed(newValue);
    }

    setSaving(true);

    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [type === "push" ? "marketing_push_agreed" : "marketing_sms_agreed"]: newValue,
        }),
      });
    } catch (error) {
      console.error("Error updating consent:", error);
      // 롤백
      if (type === "push") {
        setPushAgreed(!newValue);
      } else {
        setMarketingAgreed(!newValue);
      }
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">마케팅 정보 수신동의</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 앱 푸시 동의 */}
        <div className="mb-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">앱 푸시(광고성) 수신동의(선택)</h3>
            <button
              onClick={() => handleToggle("push")}
              disabled={saving}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                pushAgreed ? "bg-[#9F85E3]" : "bg-gray-300"
              } ${saving ? "opacity-50" : ""}`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  pushAgreed ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* 테이블 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="flex border-b border-gray-200">
              <div className="w-28 px-3 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-r border-gray-200">
                이용목적
              </div>
              <div className="flex-1 px-3 py-3 text-sm text-gray-900">
                이용목적
              </div>
            </div>
            <div className="flex border-b border-gray-200">
              <div className="w-28 px-3 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-r border-gray-200">
                수집항목
              </div>
              <div className="flex-1 px-3 py-3 text-sm text-gray-900">
                수집항목
              </div>
            </div>
            <div className="flex">
              <div className="w-28 px-3 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-r border-gray-200">
                보유 및 이용기간
              </div>
              <div className="flex-1 px-3 py-3 text-sm text-gray-900">
                보유 및 이용기간
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="space-y-1 mb-4">
            <p className="text-xs text-gray-500">* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.</p>
            <p className="text-xs text-gray-500">* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.</p>
            <p className="text-xs text-gray-500">* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.</p>
          </div>

          {/* 추가 안내 */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>- 수신동의 시 맞춤 상품 추천 등의 정보를 푸시로 전송합니다.</p>
            <p>- 안내 내용2</p>
            <p>- 안내 내용3</p>
          </div>
        </div>

        {/* 마케팅 수신 동의 */}
        <div>
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">마케팅 수신동의(선택)</h3>
            <button
              onClick={() => handleToggle("marketing")}
              disabled={saving}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                marketingAgreed ? "bg-[#9F85E3]" : "bg-gray-300"
              } ${saving ? "opacity-50" : ""}`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                  marketingAgreed ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* 테이블 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="flex border-b border-gray-200">
              <div className="w-28 px-3 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-r border-gray-200">
                이용목적
              </div>
              <div className="flex-1 px-3 py-3 text-sm text-gray-900">
                이용목적
              </div>
            </div>
            <div className="flex border-b border-gray-200">
              <div className="w-28 px-3 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-r border-gray-200">
                수집항목
              </div>
              <div className="flex-1 px-3 py-3 text-sm text-gray-900">
                수집항목
              </div>
            </div>
            <div className="flex">
              <div className="w-28 px-3 py-3 bg-gray-50 text-sm text-gray-600 font-medium border-r border-gray-200">
                보유 및 이용기간
              </div>
              <div className="flex-1 px-3 py-3 text-sm text-gray-900">
                보유 및 이용기간
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="space-y-1 mb-4">
            <p className="text-xs text-gray-500">* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.</p>
            <p className="text-xs text-gray-500">* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.</p>
            <p className="text-xs text-gray-500">* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.</p>
          </div>

          {/* 추가 안내 */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>- 수신동의 시 맞춤 상품 추천 등의 정보를 푸시로 전송합니다.</p>
            <p>- 안내 내용2</p>
            <p>- 안내 내용3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
