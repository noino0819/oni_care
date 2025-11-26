"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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

        <form className="flex-1 flex flex-col">
          <div className="flex-1 space-y-5">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">성별</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button type="button" variant="outline" className="h-14 rounded-xl text-base">
                      남성
                    </Button>
                    <Button type="button" variant="outline" className="h-14 border-primary text-primary bg-primary/5 rounded-xl text-base">
                      여성
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">생년월일</label>
                  <Input type="date" className="rounded-xl h-12" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">키 (cm)</label>
                    <Input type="number" placeholder="170" className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">몸무게 (kg)</label>
                    <Input type="number" placeholder="65" className="rounded-xl h-12" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {["매우 적음", "적음", "보통", "많음", "매우 많음"].map((level) => (
                  <Button 
                    key={level} 
                    type="button" 
                    variant="outline" 
                    className="w-full justify-start h-14 px-4 text-left font-normal rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5 text-base"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            )}

            {step === 3 && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium">주간 목표</label>
                  {["주 0.5kg 감량", "주 0.25kg 감량", "현재 체중 유지", "주 0.25kg 증량", "주 0.5kg 증량"].map((goal) => (
                    <Button 
                      key={goal} 
                      type="button" 
                      variant="outline" 
                      className="w-full justify-start h-14 px-4 text-left font-normal rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5 text-base"
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium">목표 체중 (kg)</label>
                  <Input type="number" placeholder="60" className="rounded-xl h-12" />
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
              <Link href="/home" className="w-full block">
                <Button className="w-full h-14 text-base font-semibold rounded-xl" size="lg">
                  완료
                </Button>
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
