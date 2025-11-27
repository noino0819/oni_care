import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <header className="flex items-center mb-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center space-y-2 mb-12">
          <h1 className="text-2xl font-bold text-primary tracking-tight">Greating Care</h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
            <p className="text-muted-foreground">
              서비스 이용을 위해 로그인해주세요.
            </p>
          </div>

          <form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            const emailInput = (document.getElementById("email") as HTMLInputElement).value;
            const passwordInput = (document.getElementById("password") as HTMLInputElement).value;
            
            // ID 로그인 지원: 이메일 형식이 아니면 @gmail.com 추가
            const email = emailInput.includes("@") ? emailInput : `${emailInput}@gmail.com`;
            
            try {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password: passwordInput,
              });
              
              if (error) throw error;
              
              window.location.href = "/home";
            } catch (error: any) {
              alert(error.message || "로그인에 실패했습니다.");
            }
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  아이디 또는 이메일
                </label>
                <Input
                  id="email"
                  placeholder="아이디 또는 이메일"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  비밀번호
                </label>
                <Input id="password" type="password" className="h-12" />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
              </div>
            </div>

            <Button className="w-full h-12 text-base font-semibold rounded-xl" size="lg" type="submit">
              로그인
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          {/* SNS Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium rounded-xl bg-[#FEE500] hover:bg-[#FEE500]/90 border-[#FEE500] text-[#000000]"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.442 1.443 4.615 3.686 6.143-.203.74-.794 2.888-.916 3.358-.145.558.204.551.43.4.179-.12 2.866-1.947 3.32-2.267.826.14 1.67.216 2.48.216 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
              </svg>
              카카오 로그인
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium rounded-xl bg-[#03C75A] hover:bg-[#03C75A]/90 border-[#03C75A] text-white"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
              </svg>
              네이버 로그인
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
