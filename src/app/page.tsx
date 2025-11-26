import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-primary/5">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary tracking-tight">Greating Care</h1>
          <p className="text-muted-foreground">건강한 식습관의 시작</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input type="email" placeholder="이메일" />
            <Input type="password" placeholder="비밀번호" />
          </div>
          <Link href="/login" className="w-full block">
            <Button className="w-full" size="lg">
              로그인
            </Button>
          </Link>
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
          <Link href="/signup" className="w-full block">
            <Button variant="outline" className="w-full" size="lg">
              회원가입
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
