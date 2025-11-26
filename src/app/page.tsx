import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      {/* Logo Area */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Greating Care</h1>
      </div>

      {/* Login Form */}
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">이메일</label>
          <Input 
            type="email" 
            placeholder="이메일을 입력해주세요" 
            className="h-12 rounded-xl bg-gray-50 border-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">비밀번호</label>
          <Input 
            type="password" 
            placeholder="비밀번호를 입력해주세요" 
            className="h-12 rounded-xl bg-gray-50 border-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Link href="/home" className="block w-full">
            <Button className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90">
            로그인
            </Button>
        </Link>
      </div>

      {/* Find ID/PW & Signup Links */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-500">
        <Link href="/find-account" className="hover:text-gray-900">비밀번호 찾기</Link>
        <span className="h-3 w-px bg-gray-300" />
        <Link href="/signup" className="hover:text-gray-900">회원가입</Link>
      </div>

      {/* Divider */}
      <div className="relative w-full my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">또는</span>
        </div>
      </div>

      {/* SNS Login Buttons */}
      <div className="w-full space-y-3">
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl border-[#FEE500] bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90 font-medium relative"
        >
            {/* Kakao Icon Placeholder */}
            <span className="absolute left-4">💬</span>
            카카오로 시작하기
        </Button>
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl border-[#03C75A] bg-[#03C75A] text-white hover:bg-[#03C75A]/90 font-medium relative"
        >
            {/* Naver Icon Placeholder */}
            <span className="absolute left-4">N</span>
            네이버로 시작하기
        </Button>
      </div>
    </div>
  );
}
