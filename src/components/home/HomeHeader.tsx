import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HomeHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10">
      <h1 className="text-xl font-bold text-primary tracking-tight">Greating Care</h1>
      <Button variant="ghost" size="icon" className="text-gray-500">
        <Bell className="h-6 w-6" />
      </Button>
    </header>
  );
}
