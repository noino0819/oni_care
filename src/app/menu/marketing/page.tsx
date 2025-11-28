"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface ConsentItem {
  title: string;
  description: string;
  rows: { label: string; value: string }[];
  notes: string[];
}

const PUSH_CONSENT: ConsentItem = {
  title: "앱 푸시(광고성) 수신동의(선택)",
  description: "",
  rows: [
    { label: "이용목적", value: "이용목적" },
    { label: "수집항목", value: "수집항목" },
    { label: "보유 및 이용기간", value: "보유 및 이용기간" },
  ],
  notes: [
    "* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.",
    "* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.",
    "* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.",
  ],
};

const MARKETING_CONSENT: ConsentItem = {
  title: "마케팅 수신동의(선택)",
  description: "",
  rows: [
    { label: "이용목적", value: "이용목적" },
    { label: "수집항목", value: "수집항목" },
    { label: "보유 및 이용기간", value: "보유 및 이용기간" },
  ],
  notes: [
    "* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.",
    "* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.",
    "* 해당항목에 동의하지 않으셔도 그리팅 케어 서비스이용에 문제가 없습니다.",
  ],
};

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

  const renderConsentSection = (item: ConsentItem, agreed: boolean, onToggle: () => void) => (
    <div className="mb-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
        <button
          onClick={onToggle}
          disabled={saving}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            agreed ? "bg-[#9F85E3]" : "bg-gray-300"
          } ${saving ? "opacity-50" : ""}`}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              agreed ? "right-1" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* 테이블 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
        {item.rows.map((row, idx) => (
          <div
            key={row.label}
            className={`flex ${idx !== item.rows.length - 1 ? "border-b border-gray-200" : ""}`}
          >
            <div className="w-28 px-3 py-2 bg-gray-50 text-sm text-gray-600 font-medium">
              {row.label}
            </div>
            <div className="flex-1 px-3 py-2 text-sm text-gray-900">
              {row.value}
            </div>
          </div>
        ))}
      </div>

      {/* 안내 문구 */}
      <div className="space-y-1">
        {item.notes.map((note, idx) => (
          <p key={idx} className="text-xs text-gray-500">{note}</p>
        ))}
      </div>

      {/* 추가 안내 */}
      <div className="mt-3 text-sm text-gray-600">
        <p>- 수신동의 시 맞춤 상품 추천 등의 정보를 푸시로 전송합니다.</p>
        <p>- 안내 내용2</p>
        <p>- 안내 내용3</p>
      </div>
    </div>
  );

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
        {renderConsentSection(PUSH_CONSENT, pushAgreed, () => handleToggle("push"))}

        <div className="border-t border-gray-100 my-6" />

        {/* 마케팅 수신 동의 */}
        {renderConsentSection(MARKETING_CONSENT, marketingAgreed, () => handleToggle("marketing"))}
      </div>
    </div>
  );
}

