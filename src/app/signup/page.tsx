import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <header className="flex items-center mb-10">
        <Link href="/login">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">회원가입</h1>
          <p className="text-muted-foreground">
            계정을 만들어 시작하세요.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none"
              >
                이름
              </label>
              <Input
                id="name"
                placeholder="홍길동"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
              >
                이메일
              </label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                비밀번호
              </label>
              <Input id="password" type="password" placeholder="8자 이상" />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium leading-none"
              >
                비밀번호 확인
              </label>
              <Input id="confirm-password" type="password" placeholder="비밀번호 재입력" />
            </div>
          </div>

          <Link href="/onboarding" className="block w-full mt-8">
          <Button className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90">
            회원가입
          </Button>
        </Link>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
