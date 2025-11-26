"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    gender: "",
    birth_date: "",
    height: "",
    weight: "",
    activity_level: "",
    weekly_goal: "",
    goal_weight: "",
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // 현재 로그인한 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("로그인 정보를 찾을 수 없습니다.");
        return;
      }

      // users 테이블에 온보딩 데이터 업데이트
      const { error: updateError } = await supabase
        .from("users")
        .update({
          gender: formData.gender,
          birth_date: formData.birth_date || null,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          activity_level: formData.activity_level,
          weekly_goal: formData.weekly_goal,
          goal_weight: formData.goal_weight ? parseFloat(formData.goal_weight) : null,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // 홈 페이지로 이동
      router.push("/home");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError("온보딩 데이터 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Back Button */}
      <header className="flex items-center p-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2"
          onClick={step === 1 ? undefined : prevStep}
          asChild={step === 1}
        >
          {step === 1 ? (
            <Link href="/signup">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>
      </header>

      {/* Progress Bar */}
      <div className="px-6 mb-6">
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 1 && "기본 정보를 알려주세요"}
            {step === 2 && "평소 활동량을 알려주세요"}
            {step === 3 && "주간 목표를 설정해주세요"}
          </h1>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex-1 space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">성별</label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange("gender", "male")}
                    className={`h-14 rounded-xl text-base ${
                      formData.gender === "male"
                        ? "border-primary text-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    남성
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange("gender", "female")}
                    className={`h-14 rounded-xl text-base ${
                      formData.gender === "female"
                        ? "border-primary text-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    여성
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">생년월일</label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange("birth_date", e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">키 (cm)</label>
                  <Input
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">몸무게 (kg)</label>
                  <Input
                    type="number"
                    placeholder="65"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {[
                { label: "매우 적음", value: "sedentary" },
                { label: "적음", value: "lightly_active" },
                { label: "보통", value: "moderately_active" },
                { label: "많음", value: "very_active" },
                { label: "매우 많음", value: "extra_active" },
              ].map((level) => (
                <Button
                  key={level.value}
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange("activity_level", level.value)}
                  className={`w-full justify-start h-14 px-4 text-left font-normal rounded-xl text-base ${
                    formData.activity_level === level.value
                      ? "border-primary text-primary bg-primary/5"
                      : "hover:border-primary hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium">주간 목표</label>
                {[
                  "주 0.5kg 감량",
                  "주 0.25kg 감량",
                  "현재 체중 유지",
                  "주 0.25kg 증량",
                  "주 0.5kg 증량",
                ].map((goal) => (
                  <Button
                    key={goal}
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange("weekly_goal", goal)}
                    className={`w-full justify-start h-14 px-4 text-left font-normal rounded-xl text-base ${
                      formData.weekly_goal === goal
                        ? "border-primary text-primary bg-primary/5"
                        : "hover:border-primary hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {goal}
                  </Button>
                ))}
              </div>
              <div className="space-y-2 mt-6">
                <label className="text-sm font-medium">목표 체중 (kg)</label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.goal_weight}
                  onChange={(e) => handleInputChange("goal_weight", e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
            </>
          )}
        </div>

        <div className="pt-6 mt-auto">
          {step < 3 ? (
            <Button
              type="button"
              className="w-full h-14 text-base font-semibold rounded-xl"
              size="lg"
              onClick={nextStep}
            >
              다음
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="w-full h-14 text-base font-semibold rounded-xl disabled:opacity-50"
              size="lg"
            >
              {loading ? "저장 중..." : "완료"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
