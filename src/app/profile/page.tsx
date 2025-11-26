import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Settings, Bell, LogOut, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">마이페이지</h1>
      </header>

      <div className="flex items-center space-x-4 mb-8">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">김건강</h2>
          <p className="text-muted-foreground">health@example.com</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-0 divide-y">
            {[
              { icon: Settings, label: "계정 설정" },
              { icon: Bell, label: "알림 설정" },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
