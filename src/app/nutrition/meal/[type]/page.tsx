"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Search,
  ChevronDown,
  Check,
  X,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  servingSize: string;
  servingGrams: number;
  quantity: number;
}

interface MenuSet {
  id: string;
  category: string;
  name: string;
  foods: FoodItem[];
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

const MEAL_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍪",
};

// FS 회원용 오늘의 메뉴 데이터
const TODAY_MENUS: Record<string, MenuSet[]> = {
  breakfast: [
    {
      id: "b1",
      category: "한식",
      name: "전주식콩나물해장국",
      foods: [
        {
          id: "b1-1",
          name: "전주식콩나물해장국",
          calories: 134.8,
          carbs: 10,
          protein: 8,
          fat: 6,
          servingSize: "1회섭취량",
          servingGrams: 315,
          quantity: 1,
        },
        {
          id: "b1-2",
          name: "현미밥",
          calories: 205,
          carbs: 40,
          protein: 5,
          fat: 1,
          servingSize: "1회섭취량",
          servingGrams: 120,
          quantity: 1,
        },
        {
          id: "b1-3",
          name: "연근조림",
          calories: 52.1,
          carbs: 10,
          protein: 2,
          fat: 0.5,
          servingSize: "1회섭취량",
          servingGrams: 68.5,
          quantity: 1,
        },
        {
          id: "b1-4",
          name: "포기김치",
          calories: 20,
          carbs: 3,
          protein: 1,
          fat: 0.3,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
        {
          id: "b1-5",
          name: "누룽지",
          calories: 85,
          carbs: 18,
          protein: 2,
          fat: 0.5,
          servingSize: "1회섭취량",
          servingGrams: 30,
          quantity: 1,
        },
        {
          id: "b1-6",
          name: "김구이",
          calories: 25,
          carbs: 2,
          protein: 2,
          fat: 1,
          servingSize: "1회섭취량",
          servingGrams: 5,
          quantity: 1,
        },
        {
          id: "b1-7",
          name: "계란후라이",
          calories: 90,
          carbs: 1,
          protein: 6,
          fat: 7,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
      ],
    },
    {
      id: "b2",
      category: "양식",
      name: "시리얼",
      foods: [
        {
          id: "b2-1",
          name: "흰우유",
          calories: 130,
          carbs: 10,
          protein: 6,
          fat: 7,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "b2-2",
          name: "주스",
          calories: 90,
          carbs: 22,
          protein: 0.5,
          fat: 0,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "b2-3",
          name: "식빵",
          calories: 150,
          carbs: 28,
          protein: 5,
          fat: 2,
          servingSize: "1회섭취량",
          servingGrams: 60,
          quantity: 1,
        },
        {
          id: "b2-4",
          name: "크로와상",
          calories: 230,
          carbs: 26,
          protein: 4,
          fat: 12,
          servingSize: "1회섭취량",
          servingGrams: 60,
          quantity: 1,
        },
        {
          id: "b2-5",
          name: "베이컨구이",
          calories: 120,
          carbs: 0,
          protein: 8,
          fat: 10,
          servingSize: "1회섭취량",
          servingGrams: 30,
          quantity: 1,
        },
        {
          id: "b2-6",
          name: "그린샐러드",
          calories: 45,
          carbs: 5,
          protein: 2,
          fat: 2,
          servingSize: "1회섭취량",
          servingGrams: 100,
          quantity: 1,
        },
        {
          id: "b2-7",
          name: "바나나",
          calories: 89,
          carbs: 23,
          protein: 1,
          fat: 0.3,
          servingSize: "1회섭취량",
          servingGrams: 120,
          quantity: 1,
        },
      ],
    },
    {
      id: "b3",
      category: "라면코너",
      name: "셀프라면",
      foods: [
        {
          id: "b3-1",
          name: "미역&참치 토핑",
          calories: 80,
          carbs: 2,
          protein: 8,
          fat: 4,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
        {
          id: "b3-2",
          name: "포기김치",
          calories: 20,
          carbs: 3,
          protein: 1,
          fat: 0.3,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
        {
          id: "b3-3",
          name: "반달단무지",
          calories: 15,
          carbs: 3,
          protein: 0.3,
          fat: 0,
          servingSize: "1회섭취량",
          servingGrams: 30,
          quantity: 1,
        },
      ],
    },
  ],
  lunch: [
    {
      id: "l1",
      category: "한식",
      name: "매콤순대볶음",
      foods: [
        {
          id: "l1-1",
          name: "매콤순대볶음",
          calories: 450,
          carbs: 30,
          protein: 18,
          fat: 28,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "l1-2",
          name: "공기밥",
          calories: 300,
          carbs: 65,
          protein: 5,
          fat: 0.5,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "l1-3",
          name: "된장국",
          calories: 80,
          carbs: 6,
          protein: 5,
          fat: 3,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "l1-4",
          name: "포기김치",
          calories: 20,
          carbs: 3,
          protein: 1,
          fat: 0.3,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
        {
          id: "l1-5",
          name: "단무지",
          calories: 15,
          carbs: 3,
          protein: 0.3,
          fat: 0,
          servingSize: "1회섭취량",
          servingGrams: 30,
          quantity: 1,
        },
      ],
    },
    {
      id: "l2",
      category: "탕/찌개",
      name: "황태콩나물해장국",
      foods: [
        {
          id: "l2-1",
          name: "황태콩나물해장국",
          calories: 350,
          carbs: 15,
          protein: 25,
          fat: 18,
          servingSize: "1회섭취량",
          servingGrams: 400,
          quantity: 1,
        },
        {
          id: "l2-2",
          name: "공기밥",
          calories: 300,
          carbs: 65,
          protein: 5,
          fat: 0.5,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "l2-3",
          name: "포기김치",
          calories: 20,
          carbs: 3,
          protein: 1,
          fat: 0.3,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
        {
          id: "l2-4",
          name: "깍두기",
          calories: 15,
          carbs: 3,
          protein: 0.5,
          fat: 0.1,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
      ],
    },
    {
      id: "l3",
      category: "면류",
      name: "유니짜장면",
      foods: [
        {
          id: "l3-1",
          name: "유니짜장면",
          calories: 650,
          carbs: 90,
          protein: 15,
          fat: 20,
          servingSize: "1회섭취량",
          servingGrams: 400,
          quantity: 1,
        },
        {
          id: "l3-2",
          name: "단무지",
          calories: 20,
          carbs: 4,
          protein: 0.3,
          fat: 0,
          servingSize: "1회섭취량",
          servingGrams: 30,
          quantity: 1,
        },
        {
          id: "l3-3",
          name: "양파절임",
          calories: 15,
          carbs: 3,
          protein: 0.3,
          fat: 0,
          servingSize: "1회섭취량",
          servingGrams: 30,
          quantity: 1,
        },
      ],
    },
  ],
  dinner: [
    {
      id: "d1",
      category: "한식",
      name: "삼겹살정식",
      foods: [
        {
          id: "d1-1",
          name: "삼겹살구이",
          calories: 550,
          carbs: 0,
          protein: 25,
          fat: 50,
          servingSize: "1회섭취량",
          servingGrams: 150,
          quantity: 1,
        },
        {
          id: "d1-2",
          name: "공기밥",
          calories: 300,
          carbs: 65,
          protein: 5,
          fat: 0.5,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "d1-3",
          name: "된장찌개",
          calories: 100,
          carbs: 8,
          protein: 6,
          fat: 4,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "d1-4",
          name: "쌈채소",
          calories: 20,
          carbs: 4,
          protein: 1,
          fat: 0.2,
          servingSize: "1회섭취량",
          servingGrams: 100,
          quantity: 1,
        },
        {
          id: "d1-5",
          name: "포기김치",
          calories: 20,
          carbs: 3,
          protein: 1,
          fat: 0.3,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
      ],
    },
    {
      id: "d2",
      category: "생선",
      name: "고등어구이정식",
      foods: [
        {
          id: "d2-1",
          name: "고등어구이",
          calories: 250,
          carbs: 0,
          protein: 22,
          fat: 18,
          servingSize: "1회섭취량",
          servingGrams: 120,
          quantity: 1,
        },
        {
          id: "d2-2",
          name: "현미밥",
          calories: 200,
          carbs: 40,
          protein: 5,
          fat: 1,
          servingSize: "1회섭취량",
          servingGrams: 150,
          quantity: 1,
        },
        {
          id: "d2-3",
          name: "미역국",
          calories: 80,
          carbs: 5,
          protein: 3,
          fat: 2,
          servingSize: "1회섭취량",
          servingGrams: 200,
          quantity: 1,
        },
        {
          id: "d2-4",
          name: "포기김치",
          calories: 20,
          carbs: 3,
          protein: 1,
          fat: 0.3,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
      ],
    },
    {
      id: "d3",
      category: "비빔",
      name: "비빔밥",
      foods: [
        {
          id: "d3-1",
          name: "비빔밥",
          calories: 550,
          carbs: 75,
          protein: 15,
          fat: 18,
          servingSize: "1회섭취량",
          servingGrams: 400,
          quantity: 1,
        },
        {
          id: "d3-2",
          name: "계란후라이",
          calories: 90,
          carbs: 1,
          protein: 6,
          fat: 7,
          servingSize: "1회섭취량",
          servingGrams: 50,
          quantity: 1,
        },
      ],
    },
  ],
  snack: [
    {
      id: "s1",
      category: "음료",
      name: "아메리카노",
      foods: [
        {
          id: "s1-1",
          name: "아메리카노",
          calories: 10,
          carbs: 2,
          protein: 0,
          fat: 0,
          servingSize: "1회섭취량",
          servingGrams: 355,
          quantity: 1,
        },
      ],
    },
    {
      id: "s2",
      category: "빵/디저트",
      name: "크로와상",
      foods: [
        {
          id: "s2-1",
          name: "크로와상",
          calories: 230,
          carbs: 26,
          protein: 4,
          fat: 12,
          servingSize: "1회섭취량",
          servingGrams: 60,
          quantity: 1,
        },
      ],
    },
  ],
};

// 자주 먹는 음식 샘플
const FREQUENT_FOODS: FoodItem[] = [
  {
    id: "f1",
    name: "흰쌀밥",
    calories: 300,
    carbs: 65,
    protein: 5,
    fat: 0.5,
    servingSize: "1회섭취량",
    servingGrams: 210,
    quantity: 1,
  },
  {
    id: "f2",
    name: "된장찌개",
    calories: 120,
    carbs: 8,
    protein: 8,
    fat: 6,
    servingSize: "1회섭취량",
    servingGrams: 200,
    quantity: 1,
  },
  {
    id: "f3",
    name: "김치",
    calories: 15,
    carbs: 3,
    protein: 1,
    fat: 0.3,
    servingSize: "1회섭취량",
    servingGrams: 50,
    quantity: 1,
  },
  {
    id: "f4",
    name: "계란프라이",
    calories: 90,
    carbs: 1,
    protein: 6,
    fat: 7,
    servingSize: "1회섭취량",
    servingGrams: 50,
    quantity: 1,
  },
];

// 최근 먹은 음식 샘플
const RECENT_FOODS: FoodItem[] = [
  {
    id: "r1",
    name: "닭가슴살",
    calories: 165,
    carbs: 0,
    protein: 31,
    fat: 3.6,
    servingSize: "1회섭취량",
    servingGrams: 100,
    quantity: 1,
  },
  {
    id: "r2",
    name: "사과",
    calories: 52,
    carbs: 14,
    protein: 0.3,
    fat: 0.2,
    servingSize: "1회섭취량",
    servingGrams: 150,
    quantity: 1,
  },
  {
    id: "r3",
    name: "바나나",
    calories: 89,
    carbs: 23,
    protein: 1.1,
    fat: 0.3,
    servingSize: "1회섭취량",
    servingGrams: 120,
    quantity: 1,
  },
];

export default function MealRecordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const initialMealType = params.type as string;
  const dateParam = searchParams.get("date");

  const [selectedMealType, setSelectedMealType] = useState(initialMealType);
  const [currentTab, setCurrentTab] = useState<"today" | "frequent" | "recent">(
    "today"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFsMember, setIsFsMember] = useState(true); // FS 회원 여부 (실제로는 API에서 가져옴)

  // 선택된 메뉴 (두 번째 화면용)
  const [selectedMenu, setSelectedMenu] = useState<MenuSet | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);

  // 식사 날짜/시간
  const [mealDate, setMealDate] = useState(
    dateParam || new Date().toISOString().split("T")[0]
  );
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const isPM = hours >= 12;
    const displayHours = hours % 12 || 12;
    return {
      period: isPM ? "PM" : "AM",
      hours: displayHours.toString().padStart(2, "0"),
      minutes: "00",
    };
  });

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // FS 회원 여부 확인
  useEffect(() => {
    const checkFsMember = async () => {
      try {
        const response = await fetch("/api/nutrition");
        if (response.ok) {
          const data = await response.json();
          setIsFsMember(data.isFsMember ?? true); // 기본값 true (개발 환경)
        }
      } catch (error) {
        console.error(error);
        // API 오류 시에도 오늘의 메뉴 표시 (개발 환경)
        setIsFsMember(true);
      }
    };
    checkFsMember();
  }, []);

  // 메뉴 선택 시 음식 목록 설정
  const handleSelectMenu = (menu: MenuSet) => {
    setSelectedMenu(menu);
    setSelectedFoods(menu.foods.map((f) => ({ ...f, quantity: 1 })));
  };

  // 음식 수량 변경 (0.1 단위)
  const updateQuantity = (foodId: string, delta: number) => {
    setSelectedFoods((prev) =>
      prev.map((f) =>
        f.id === foodId
          ? {
              ...f,
              quantity: Math.max(
                0.1,
                Math.round((f.quantity + delta * 0.1) * 10) / 10
              ),
            }
          : f
      )
    );
  };

  // 음식 삭제
  const removeFood = (foodId: string) => {
    setSelectedFoods((prev) => prev.filter((f) => f.id !== foodId));
  };

  // 단일 음식 추가
  const addSingleFood = (food: FoodItem) => {
    setSelectedMenu({
      id: "single",
      category: "",
      name: food.name,
      foods: [food],
    });
    setSelectedFoods([{ ...food, quantity: 1 }]);
  };

  // 총 칼로리 계산
  const totalCalories = selectedFoods.reduce(
    (sum, f) => sum + f.calories * f.quantity,
    0
  );

  // 저장
  const saveMealRecord = async () => {
    if (selectedFoods.length === 0) {
      alert("음식을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/nutrition/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: selectedMealType,
          mealDate,
          mealTime: `${mealTime.period} ${mealTime.hours}:${mealTime.minutes}`,
          foods: selectedFoods.map((f) => ({
            name: f.name,
            calories: f.calories * f.quantity,
            carbs: f.carbs * f.quantity,
            protein: f.protein * f.quantity,
            fat: f.fat * f.quantity,
            servingSize: f.servingSize,
            quantity: f.quantity,
          })),
        }),
      });

      if (response.ok) {
        router.push("/nutrition");
      } else {
        throw new Error("저장 실패");
      }
    } catch (error) {
      console.error(error);
      router.push("/nutrition");
    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로가기
  const handleBack = () => {
    if (selectedMenu) {
      setSelectedMenu(null);
      setSelectedFoods([]);
    } else {
      router.back();
    }
  };

  // 오늘의 메뉴 목록
  const todayMenus = TODAY_MENUS[selectedMealType] || [];

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // ==================== 두 번째 화면: 음식 상세 ====================
  if (selectedMenu) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* 헤더 */}
        <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={handleBack} className="p-1">
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button className="p-1">
              <Search className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          {/* 끼니 선택 탭 */}
          <div className="flex gap-2">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-sm font-medium transition-colors",
                    selectedMealType === type
                      ? "bg-[#9B8BB5] text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {MEAL_LABELS[type]}
                </button>
              )
            )}
          </div>

          {/* 날짜/시간 선택 */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowDatePicker(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200"
            >
              <span className="text-sm text-gray-500">식사 날짜</span>
              <div className="flex items-center gap-1">
                <span className="text-lg font-medium text-gray-800">
                  {formatDate(mealDate)}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </button>
            <button
              onClick={() => setShowTimePicker(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200"
            >
              <span className="text-sm text-gray-500">식사 시간</span>
              <div className="flex items-center gap-1">
                <span className="text-lg font-medium text-gray-800">
                  {mealTime.period} {mealTime.hours}:{mealTime.minutes}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          </div>

          {/* 메뉴 이름 */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-2xl">🍽️</span>
            <h2 className="text-xl font-bold text-gray-800">
              {selectedMenu.name}
            </h2>
          </div>

          {/* 음식 목록 */}
          <div className="space-y-3">
            {selectedFoods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{food.name}</h3>
                    <p className="text-sm text-gray-500">
                      {food.servingSize} {food.servingGrams}g |{" "}
                      {Math.round(food.calories * food.quantity)}kcal
                    </p>
                  </div>
                  <button onClick={() => removeFood(food.id)} className="p-1">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="flex justify-end">
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2">
                    <button
                      onClick={() => updateQuantity(food.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-gray-800 min-w-[50px] text-center">
                      {food.quantity}인분
                    </span>
                    <button
                      onClick={() => updateQuantity(food.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <button
            onClick={saveMealRecord}
            disabled={selectedFoods.length === 0 || isLoading}
            className={cn(
              "w-full py-4 rounded-xl font-bold text-lg transition-colors",
              selectedFoods.length > 0
                ? "bg-[#9B8BB5] text-white"
                : "bg-gray-200 text-gray-400"
            )}
          >
            {isLoading ? "저장 중..." : `저장하기 (${selectedFoods.length})`}
          </button>
        </div>

        {/* 시간 선택 모달 - 스피너 형태 */}
        {showTimePicker && (
          <TimePickerModal
            value={mealTime}
            onChange={setMealTime}
            onClose={() => setShowTimePicker(false)}
          />
        )}

        {/* 날짜 선택 모달 - 스피너 형태 */}
        {showDatePicker && (
          <DatePickerModal
            value={mealDate}
            onChange={setMealDate}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </div>
    );
  }

  // ==================== 첫 번째 화면: 메뉴 선택 ====================
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10">
        <div className="flex items-center px-4 py-3 gap-3">
          <button onClick={handleBack} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          {/* 검색 바 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="음식을 검색해 보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-200">
          {isFsMember && (
            <button
              onClick={() => setCurrentTab("today")}
              className={cn(
                "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                currentTab === "today"
                  ? "text-[#7B9B5C] border-[#7B9B5C]"
                  : "text-gray-500 border-transparent"
              )}
            >
              오늘의 메뉴
            </button>
          )}
          <button
            onClick={() => setCurrentTab("frequent")}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              currentTab === "frequent"
                ? "text-[#7B9B5C] border-[#7B9B5C]"
                : "text-gray-500 border-transparent"
            )}
          >
            자주먹는
          </button>
          <button
            onClick={() => setCurrentTab("recent")}
            className={cn(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              currentTab === "recent"
                ? "text-[#7B9B5C] border-[#7B9B5C]"
                : "text-gray-500 border-transparent"
            )}
          >
            최근
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* 오늘의 메뉴 탭 */}
        {currentTab === "today" && isFsMember && (
          <div className="space-y-4">
            {/* 끼니 표시 */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MEAL_ICONS[selectedMealType]}</span>
              <span className="text-lg font-bold text-gray-800">
                {MEAL_LABELS[selectedMealType]}
              </span>
            </div>

            {/* 메뉴 목록 */}
            <div className="space-y-3">
              {todayMenus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => handleSelectMenu(menu)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-200 text-left flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      {menu.category}
                    </p>
                    <h3 className="font-bold text-gray-800 mb-2">
                      {menu.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {menu.foods.map((f) => f.name).join(", ")}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#9B8BB5] flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#9B8BB5]" />
                  </div>
                </button>
              ))}

              {todayMenus.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>오늘의 {MEAL_LABELS[selectedMealType]} 메뉴가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 자주먹는 탭 */}
        {currentTab === "frequent" && (
          <div className="space-y-3">
            {FREQUENT_FOODS.map((food) => (
              <button
                key={food.id}
                onClick={() => addSingleFood(food)}
                className="w-full bg-white rounded-xl p-4 border border-gray-200 text-left flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-800">{food.name}</h3>
                  <p className="text-sm text-gray-500">
                    {food.servingSize} {food.servingGrams}g | {food.calories}
                    kcal
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <Check className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 최근 탭 */}
        {currentTab === "recent" && (
          <div className="space-y-3">
            {RECENT_FOODS.map((food) => (
              <button
                key={food.id}
                onClick={() => addSingleFood(food)}
                className="w-full bg-white rounded-xl p-4 border border-gray-200 text-left flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-800">{food.name}</h3>
                  <p className="text-sm text-gray-500">
                    {food.servingSize} {food.servingGrams}g | {food.calories}
                    kcal
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <Check className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 스피너 휠 컴포넌트 ====================
function WheelPicker({
  items,
  selectedIndex,
  onSelect,
  suffix = "",
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  suffix?: string;
}) {
  const visibleItems = 5; // 보이는 아이템 수
  const itemHeight = 44; // 아이템 높이

  return (
    <div className="relative h-[220px] overflow-hidden flex-1">
      {/* 선택 영역 하이라이트 */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[44px] bg-[#C5D84B]/30 rounded-lg pointer-events-none z-10" />

      {/* 스크롤 영역 */}
      <div
        className="absolute inset-0 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          paddingTop: itemHeight * 2,
          paddingBottom: itemHeight * 2,
        }}
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          const index = Math.round(scrollTop / itemHeight);
          if (index !== selectedIndex && index >= 0 && index < items.length) {
            onSelect(index);
          }
        }}
        ref={(el) => {
          if (el && el.scrollTop !== selectedIndex * itemHeight) {
            el.scrollTop = selectedIndex * itemHeight;
          }
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "h-[44px] flex items-center justify-center text-xl transition-all snap-center cursor-pointer",
              index === selectedIndex
                ? "text-gray-900 font-bold"
                : "text-gray-400"
            )}
            onClick={() => onSelect(index)}
          >
            {item}
            {suffix}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 날짜 선택 모달 ====================
function DatePickerModal({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
}) {
  const date = new Date(value);
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [day, setDay] = useState(date.getDate());

  const years = Array.from({ length: 5 }, (_, i) => (2023 + i).toString());
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const handleConfirm = () => {
    const newDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    onChange(newDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full rounded-t-3xl animate-slide-up">
        {/* 핸들 바 */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 스피너 영역 */}
        <div className="flex px-6 py-4">
          {/* 년 */}
          <WheelPicker
            items={years}
            selectedIndex={years.indexOf(year.toString())}
            onSelect={(index) => setYear(parseInt(years[index]))}
            suffix=" 년"
          />
          {/* 월 */}
          <WheelPicker
            items={months}
            selectedIndex={month - 1}
            onSelect={(index) => setMonth(index + 1)}
            suffix=" 월"
          />
          {/* 일 */}
          <WheelPicker
            items={days}
            selectedIndex={day - 1}
            onSelect={(index) => setDay(index + 1)}
            suffix=" 일"
          />
        </div>

        {/* 확인 버튼 */}
        <div className="px-4 pb-8">
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-[#C5D84B] text-white rounded-xl font-bold text-lg"
          >
            선택
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 시간 선택 모달 ====================
function TimePickerModal({
  value,
  onChange,
  onClose,
}: {
  value: { period: string; hours: string; minutes: string };
  onChange: (time: { period: string; hours: string; minutes: string }) => void;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState(value.period === "PM" ? "오후" : "오전");
  const [hours, setHours] = useState(parseInt(value.hours));
  const [minutes, setMinutes] = useState(parseInt(value.minutes));

  const periods = ["오전", "오후"];
  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutesList = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  const handleConfirm = () => {
    onChange({
      period: period === "오후" ? "PM" : "AM",
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full rounded-t-3xl animate-slide-up">
        {/* 핸들 바 */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 스피너 영역 */}
        <div className="flex px-6 py-4">
          {/* 오전/오후 */}
          <WheelPicker
            items={periods}
            selectedIndex={periods.indexOf(period)}
            onSelect={(index) => setPeriod(periods[index])}
          />
          {/* 시 */}
          <WheelPicker
            items={hoursList}
            selectedIndex={hours - 1}
            onSelect={(index) => setHours(index + 1)}
            suffix=" 시"
          />
          {/* 분 */}
          <WheelPicker
            items={minutesList}
            selectedIndex={minutes}
            onSelect={(index) => setMinutes(index)}
            suffix=" 분"
          />
        </div>

        {/* 확인 버튼 */}
        <div className="px-4 pb-8">
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-[#C5D84B] text-white rounded-xl font-bold text-lg"
          >
            선택
          </button>
        </div>
      </div>
    </div>
  );
}
