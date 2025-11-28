"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Home, Printer, Info } from "lucide-react";

interface DiagnosisResult {
  user: {
    name: string;
    gender: string;
    age: number;
    height: number;
    weight: number;
    diseases: string[];
    interests: string[];
  };
  diagnosisDate: string;
  eatScore: number;
  eatScoreMessage: string;
  deficientNutrients: string[];
  excessiveNutrients: string[];
  averageScore: number;
  recommendedCalories: number;
  basalMetabolicRate: number;
  currentCalories: number;
  calorieStatus: "excessive" | "deficient" | "adequate";
  diseaseManagement: {
    disease: string;
    tips: string[];
  } | null;
}

const DISEASE_MAP: Record<string, string> = {
  diabetes: "당뇨",
  hypertension: "고혈압",
  hyperlipidemia: "고중성지방혈증",
  hypercholesterolemia: "고콜레스테롤혈증",
  fatty_liver: "지방간",
  osteoporosis: "골다공증",
  obesity: "비만",
};

export default function DiagnosisResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API 호출로 대체
    setIsLoading(true);
    setTimeout(() => {
      setResult({
        user: {
          name: "테스트",
          gender: "female",
          age: 40,
          height: 165,
          weight: 55,
          diseases: ["osteoporosis"],
          interests: ["immunity", "muscle", "weight_control"],
        },
        diagnosisDate: "2025.02.05",
        eatScore: 92,
        eatScoreMessage: "식이섬유 섭취량이 부족하고, 당류 과다하여 잇스코어가 감점 되었어요.",
        deficientNutrients: ["식이섬유"],
        excessiveNutrients: ["당류"],
        averageScore: 94,
        recommendedCalories: 1900,
        basalMetabolicRate: 1292,
        currentCalories: 1528,
        calorieStatus: "deficient",
        diseaseManagement: {
          disease: "골다공증",
          tips: [
            "칼슘과 비타민D 섭취를 늘려주세요.",
            "나트륨 섭취를 줄이세요.",
            "적절한 체중 부하 운동을 해주세요.",
          ],
        },
      });
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">결과를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <X className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">그리팅 영양진단</h1>
          <button onClick={() => router.push("/home")} className="p-1">
            <Home className="w-6 h-6 text-[#7B9B5C]" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 사용자 정보 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{result.user.name}님</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>설문일자: {result.diagnosisDate}</span>
              <button className="flex items-center gap-1 text-[#7B9B5C]">
                <Printer className="w-4 h-4" />
                프린트 하기
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">고객정보</span>
              <p className="font-medium">
                {result.user.gender === "female" ? "여성" : "남성"} / {result.user.age}세
              </p>
            </div>
            <div>
              <span className="text-gray-500">키/몸무게</span>
              <p className="font-medium">{result.user.height}cm / {result.user.weight}kg</p>
            </div>
            <div>
              <span className="text-gray-500">질병</span>
              <p className="font-medium">
                {result.user.diseases.map((d) => DISEASE_MAP[d] || d).join(", ") || "없음"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">관심사</span>
              <p className="font-medium">
                {result.user.interests.slice(0, 3).map((i) => {
                  const map: Record<string, string> = {
                    immunity: "면역력",
                    muscle: "근력",
                    weight_control: "체중조절",
                  };
                  return map[i] || i;
                }).join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* EAT SCORE */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold">EAT SCORE</h3>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">적정 섭취량과 비교한 나의 실제 섭취량 점수</p>

          <div className="bg-[#FFF8E6] rounded-xl p-4 mb-4">
            <p className="text-sm">
              <span className="text-orange-500 font-medium">
                {result.deficientNutrients.join(", ")}
              </span>{" "}
              섭취량이 부족하고,{" "}
              <span className="text-red-500 font-medium">
                {result.excessiveNutrients.join(", ")}
              </span>{" "}
              과다하여 잇스코어가 감점 되었어요.
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{result.eatScore}점</span>
              <span className="text-gray-400">/ 100점</span>
            </div>
          </div>

          {/* 점수 바 */}
          <div className="relative h-4 bg-gray-200 rounded-full mb-4">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
              style={{ width: `${result.eatScore}%` }}
            />
            <div
              className="absolute -top-6 flex flex-col items-center"
              style={{ left: `${result.eatScore}%`, transform: "translateX(-50%)" }}
            >
              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                {result.eatScore}점
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>0점</span>
            <span>100점</span>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>40대 여성</p>
            <p>평균 잇스코어</p>
            <p className="font-bold text-gray-900">{result.averageScore}점</p>
          </div>
        </div>

        {/* 나의 하루 칼로리 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-lg font-bold mb-2">나의 하루 칼로리</h3>
          <p className="text-sm text-gray-500 mb-4">
            인적사항, BMI, 활동량을 기준으로 산출한 권장 및 섭취 열량
          </p>

          <div className={`rounded-xl p-4 mb-4 ${
            result.calorieStatus === "deficient" ? "bg-blue-50" : 
            result.calorieStatus === "excessive" ? "bg-red-50" : "bg-green-50"
          }`}>
            <p className="text-sm">
              <span className="font-medium text-[#7B9B5C]">{result.user.name}님</span> 하루 섭취 열량(kcal)이 권장 열량 대비{" "}
              <span className={`font-medium ${
                result.calorieStatus === "deficient" ? "text-blue-500" :
                result.calorieStatus === "excessive" ? "text-red-500" : "text-green-500"
              }`}>
                {result.calorieStatus === "deficient" ? "부족해요" :
                 result.calorieStatus === "excessive" ? "과다해요" : "적정해요"}
              </span>
            </p>
          </div>

          {/* 칼로리 그래프 */}
          <div className="relative mb-8">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>1,000kcal</span>
              <span>2,000kcal</span>
              <span>3,000kcal</span>
              <span>4,000kcal</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-lg">
              {/* 기초대사량 표시 */}
              <div
                className="absolute top-0 h-full bg-gray-400 rounded-l-lg"
                style={{ width: `${(result.basalMetabolicRate / 4000) * 100}%` }}
              />
              {/* 현재 섭취량 */}
              <div
                className="absolute -bottom-8 flex flex-col items-center"
                style={{ left: `${(result.currentCalories / 4000) * 100}%`, transform: "translateX(-50%)" }}
              >
                <div className="w-2 h-2 rounded-full bg-gray-800" />
                <span className="text-xs text-gray-600 mt-1">섭취</span>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <div className="text-center">
                <p className="text-xs text-gray-500">기초대사량</p>
                <p className="font-medium">{result.basalMetabolicRate.toLocaleString()}kcal</p>
              </div>
              <div className="text-center bg-[#7B9B5C] text-white px-4 py-2 rounded-xl">
                <p className="text-xs">권장</p>
                <p className="font-bold">{result.recommendedCalories.toLocaleString()}kcal</p>
              </div>
            </div>
          </div>
        </div>

        {/* 질병 관리법 */}
        {result.diseaseManagement && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-lg font-bold mb-4">질병 관리법</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-[#7B9B5C] mb-2">{result.diseaseManagement.disease}</p>
              <ul className="space-y-2">
                {result.diseaseManagement.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-[#7B9B5C]">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 맞춤 식사 추천 받기 버튼 */}
        <button
          onClick={() => router.push("/nutrition/recommendation")}
          className="w-full bg-[#F5E6A3] text-gray-800 py-4 rounded-xl font-medium text-lg"
        >
          맞춤 식사 추천 받기
        </button>
      </div>
    </div>
  );
}

