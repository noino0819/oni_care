"use client";

import { useState, useRef } from "react";
import {
  FatIcon,
  SaturatedFatIcon,
  SugarIcon,
  CarbsIcon,
  CholesterolIcon,
  SodiumIcon,
  ProteinIcon,
  FiberIcon,
} from "@/components/icons";

type NutrientStatus = "adequate" | "excessive" | "deficient";

interface Nutrient {
  id: string;
  name: string;
  nameKo: string;
  status: NutrientStatus;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface NutritionGuideProps {
  userName?: string;
  condition?: string;
  nutrients?: Nutrient[];
}

const defaultNutrients: Nutrient[] = [
  {
    id: "fat",
    name: "fat",
    nameKo: "지방",
    status: "excessive",
    icon: FatIcon,
  },
  {
    id: "saturated_fat",
    name: "saturated_fat",
    nameKo: "포화지방",
    status: "excessive",
    icon: SaturatedFatIcon,
  },
  {
    id: "sugar",
    name: "sugar",
    nameKo: "당류",
    status: "excessive",
    icon: SugarIcon,
  },
  {
    id: "carbs",
    name: "carbs",
    nameKo: "탄수화물",
    status: "adequate",
    icon: CarbsIcon,
  },
  {
    id: "cholesterol",
    name: "cholesterol",
    nameKo: "콜레스테롤",
    status: "adequate",
    icon: CholesterolIcon,
  },
  {
    id: "sodium",
    name: "sodium",
    nameKo: "나트륨",
    status: "deficient",
    icon: SodiumIcon,
  },
  {
    id: "protein",
    name: "protein",
    nameKo: "단백질",
    status: "adequate",
    icon: ProteinIcon,
  },
  {
    id: "fiber",
    name: "fiber",
    nameKo: "식이섬유",
    status: "deficient",
    icon: FiberIcon,
  },
];

type TabType = "adequate" | "excessive" | "deficient";

export function NutritionGuide({
  userName = "김건강",
  condition = "고중성지방혈증",
  nutrients = defaultNutrients,
}: NutritionGuideProps) {
  const [activeTab, setActiveTab] = useState<TabType>("adequate");
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs: { key: TabType; label: string }[] = [
    { key: "adequate", label: "적정" },
    { key: "excessive", label: "과다" },
    { key: "deficient", label: "부족" },
  ];

  const filteredNutrients = nutrients.filter((n) => n.status === activeTab);

  const getStatusColor = (status: NutrientStatus) => {
    switch (status) {
      case "adequate":
        return "bg-green-50 border-green-200";
      case "excessive":
        return "bg-amber-50 border-amber-200";
      case "deficient":
        return "bg-red-50 border-red-200";
    }
  };

  const getStatusBadgeColor = (status: NutrientStatus) => {
    switch (status) {
      case "adequate":
        return "bg-green-100 text-green-700";
      case "excessive":
        return "bg-amber-100 text-amber-700";
      case "deficient":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 bg-gradient-to-r from-[#f8f5ff] to-white border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#9F85E3] rounded-full" />
          종합 가이드
        </h3>
      </div>

      {/* 개인화 메시지 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold text-[#9F85E3]">{userName}</span>님은{" "}
          <span className="font-semibold">{condition}</span> 관리를 위해
          <br />
          <span className="text-amber-600 font-medium">
            지방, 포화지방, 당류
          </span>{" "}
          섭취를 특별히 주의해야해요!
          <br />
          <span className="text-gray-500 text-xs">
            아래는 현재 식습관에서 관리가 필요한 영양소에요!
          </span>
        </p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          const count = nutrients.filter((n) => n.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? "text-[#9F85E3]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? "bg-[#9F85E3] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9F85E3]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 영양소 아이콘 스크롤 */}
      <div className="p-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredNutrients.length > 0 ? (
            filteredNutrients.map((nutrient) => {
              const IconComponent = nutrient.icon;
              return (
                <div
                  key={nutrient.id}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border ${getStatusColor(
                    nutrient.status
                  )}`}
                >
                  <IconComponent size={48} />
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {nutrient.nameKo}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadgeColor(
                      nutrient.status
                    )}`}
                  >
                    {nutrient.status === "adequate"
                      ? "적정"
                      : nutrient.status === "excessive"
                      ? "과다"
                      : "부족"}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center py-6 text-gray-400 text-sm">
              해당하는 영양소가 없습니다
            </div>
          )}
        </div>
        {filteredNutrients.length > 4 && (
          <div className="flex justify-center mt-2">
            <div className="flex gap-1">
              {Array.from({
                length: Math.ceil(filteredNutrients.length / 4),
              }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === 0 ? "bg-[#9F85E3]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

