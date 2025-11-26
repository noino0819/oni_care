import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <header className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <div className="flex flex-col items-center space-y-2 mb-12">
          {/* Logo Placeholder - Text based for now as per Figma analysis */}
          <h1 className="text-2xl font-bold text-primary tracking-tight">Greating Care</h1>
        </div>

        <div className="space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
            <p className="text-muted-foreground">
              서비스 이용을 위해 로그인해주세요.
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  비밀번호
                </label>
                <Input id="password" type="password" />
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

            <Link href="/home" className="w-full block">
              <Button className="w-full h-12 text-base font-semibold rounded-xl" size="lg">
                로그인
              </Button>
            </Link>
          </form>

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
