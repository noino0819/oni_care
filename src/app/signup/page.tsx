"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Back Button and Progress */}
      <header className="flex items-center justify-between p-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2"
          onClick={step === 1 ? undefined : prevStep}
          asChild={step === 1}
        >
          {step === 1 ? (
            <Link href="/login">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>
        <div className="text-sm font-semibold">
          <span className="text-primary">{step}</span> / 3
        </div>
        <div className="w-10" /> {/* Spacer */}
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
          <h1 className="text-2xl font-bold tracking-tight">
            {step === 1 && "Create Account"}
            {step === 2 && "Physical Info"}
            {step === 3 && "Set Your Goal"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 && "Enter your details to sign up."}
            {step === 2 && "Tell us about yourself for better analysis."}
            {step === 3 && "What do you want to achieve?"}
          </p>
        </div>

        <form className="flex-1 flex flex-col">
          <div className="flex-1 space-y-5">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="Min. 8 characters" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input type="password" placeholder="Re-enter password" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button type="button" variant="outline" className="h-12 rounded-xl">
                      Male
                    </Button>
                    <Button type="button" variant="outline" className="h-12 border-primary text-primary bg-primary/5 rounded-xl">
                      Female
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input type="date" className="rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height (cm)</label>
                    <Input type="number" placeholder="170" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weight (kg)</label>
                    <Input type="number" placeholder="65" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Weight (kg)</label>
                  <Input type="number" placeholder="60" className="rounded-xl" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium">Activity Level</label>
                  <div className="space-y-2">
                     {["Sedentary", "Lightly Active", "Moderately Active", "Very Active"].map((level) => (
                        <Button 
                          key={level} 
                          type="button" 
                          variant="outline" 
                          className="w-full justify-start h-12 px-4 text-left font-normal rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5"
                        >
                          {level}
                        </Button>
                     ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weekly Goal</label>
                   <div className="space-y-2">
                     {["Lose 0.5kg", "Maintain Weight", "Gain 0.5kg"].map((goal) => (
                        <Button 
                          key={goal} 
                          type="button" 
                          variant="outline" 
                          className="w-full justify-start h-12 px-4 text-left font-normal rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5"
                        >
                          {goal}
                        </Button>
                     ))}
                  </div>
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
                Next
              </Button>
            ) : (
              <Link href="/home" className="w-full block">
                <Button className="w-full h-14 text-base font-semibold rounded-xl" size="lg">
                  Complete
                </Button>
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
