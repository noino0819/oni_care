"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function FindAccountPage() {
  const [activeTab, setActiveTab] = useState<"id" | "pw">("id");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess("비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.");
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("비밀번호 재설정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center px-4 py-4 sticky top-0 bg-white z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold ml-2">아이디/비밀번호 찾기</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={cn(
            "flex-1 py-4 text-sm font-medium text-center relative",
            activeTab === "id" ? "text-primary" : "text-gray-500"
          )}
          onClick={() => setActiveTab("id")}
        >
          아이디 찾기
          {activeTab === "id" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
        <button
          className={cn(
            "flex-1 py-4 text-sm font-medium text-center relative",
            activeTab === "pw" ? "text-primary" : "text-gray-500"
          )}
          onClick={() => setActiveTab("pw")}
        >
          비밀번호 찾기
          {activeTab === "pw" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {activeTab === "id" ? (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              아이디 찾기 기능은 추후 추가될 예정입니다.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이름</label>
                <Input
                  placeholder="이름을 입력해주세요"
                  className="h-12 rounded-xl bg-gray-50 border-none"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">휴대폰 번호</label>
                <Input
                  placeholder="휴대폰 번호를 입력해주세요"
                  className="h-12 rounded-xl bg-gray-50 border-none"
                  disabled
                />
              </div>
            </div>
            <Button
              disabled
              className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 mt-8 opacity-50"
            >
              아이디 찾기
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이메일</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력해주세요"
                  className="h-12 rounded-xl bg-gray-50 border-none"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 mt-8 disabled:opacity-50"
            >
              {loading ? "전송 중..." : "비밀번호 재설정 링크 전송"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
