import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface IngredientData {
    id: number;
    externalName: string;
    unit: string;
    minAmount: number | null;
    maxAmount: number | null;
}

interface AnalysisResult {
    id: string;
    ingredientName: string;
    status: "deficient" | "adequate" | "excessive";
    currentAmount: number;
    minAmount: number | null;
    maxAmount: number | null;
    unit: string;
    sourceSupplements: string[];
    recommendationText: string;
}

// 상태 판정 함수 (3케이스)
function determineStatus(
    currentAmount: number,
    minAmount: number | null,
    maxAmount: number | null
): "deficient" | "adequate" | "excessive" {
    // CASE 1: min/max 둘 다 있음
    if (minAmount !== null && maxAmount !== null) {
        if (currentAmount < minAmount) return "deficient";
        if (currentAmount > maxAmount) return "excessive";
        return "adequate";
    }
    
    // CASE 2: min만 있음
    if (minAmount !== null) {
        if (currentAmount < minAmount) return "deficient";
        return "adequate";
    }
    
    // CASE 3: max만 있음
    if (maxAmount !== null) {
        if (currentAmount > maxAmount) return "excessive";
        return "adequate";
    }
    
    // 기준이 없으면 적정으로 판단
    return "adequate";
}

// 권장량 표기 텍스트 생성
function getRecommendationText(
    minAmount: number | null,
    maxAmount: number | null,
    unit: string
): string {
    if (minAmount !== null && maxAmount !== null) {
        return `${minAmount}~${maxAmount}${unit}`;
    }
    if (minAmount !== null) {
        return `${minAmount}${unit} 이상`;
    }
    if (maxAmount !== null) {
        return `${maxAmount}${unit} 미만`;
    }
    return "권장량 정보 없음";
}

// GET: 영양제 분석 결과 조회
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 사용자의 영양제 루틴 조회
        const { data: routines, error: routinesError } = await supabase
            .from("supplement_routines")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true);

        if (routinesError) {
            console.error("Routines fetch error:", routinesError);
            return NextResponse.json(
                { error: routinesError.message },
                { status: 500 }
            );
        }

        if (!routines || routines.length === 0) {
            return NextResponse.json({
                duplicates: [],
                ingredients: [],
                recommendations: [],
                supplements: [],
                analysisDate: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
                hasWarning: false,
            });
        }

        // 기능성 성분 마스터 조회
        const { data: ingredientsMaster } = await supabase
            .from("functional_ingredients")
            .select("*")
            .eq("is_active", true);

        // 성분 상호작용 조회
        const { data: interactions } = await supabase
            .from("ingredient_interactions")
            .select(`
                *,
                ingredient_1:functional_ingredients!ingredient_id_1(id, external_name),
                ingredient_2:functional_ingredients!ingredient_id_2(id, external_name)
            `)
            .eq("is_active", true);

        // 성분 분석 생성
        const { ingredients, duplicates, supplements } = analyzeSupplements(
            routines,
            ingredientsMaster || []
        );

        // 추천 성분 생성
        const recommendations = generateRecommendations(
            ingredients,
            ingredientsMaster || [],
            interactions || []
        );

        return NextResponse.json({
            duplicates,
            ingredients,
            recommendations,
            supplements,
            analysisDate: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
            hasWarning: duplicates.length > 0 || ingredients.some((i) => i.status === "excessive"),
        });
    } catch (error) {
        console.error("Supplement analysis API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analysis" },
            { status: 500 }
        );
    }
}

// 영양제 분석 함수
function analyzeSupplements(
    routines: Array<{
        id: string;
        name: string;
        brand?: string;
        dosage: string;
        scheduled_times?: Array<{ dosage: string }>;
    }>,
    ingredientsMaster: Array<{
        id: number;
        ingredient_code: string;
        external_name: string;
        daily_intake_unit: string;
        daily_intake_min: number | null;
        daily_intake_max: number | null;
    }>
) {
    // 성분별 영양제 매핑
    const ingredientToSupplements: Record<string, {
        ingredientData: IngredientData;
        supplements: string[];
        totalAmount: number;
    }> = {};

    // 영양제 요약 정보
    const supplements: Array<{ name: string; dosage: string }> = [];

    routines.forEach((routine) => {
        const supplementName = routine.name;
        
        // 섭취량 계산 (scheduled_times의 첫 번째 dosage 또는 기본값)
        let dosageCount = 1;
        const scheduledTimes = routine.scheduled_times || [];
        if (scheduledTimes.length > 0) {
            const dosageStr = scheduledTimes[0].dosage || "1정";
            const match = dosageStr.match(/(\d+)/);
            if (match) dosageCount = parseInt(match[1]);
        }

        supplements.push({
            name: supplementName,
            dosage: scheduledTimes[0]?.dosage || routine.dosage || "1정",
        });

        // 영양제 이름에서 성분 추론
        const detectedIngredients = detectIngredients(supplementName, ingredientsMaster);

        detectedIngredients.forEach(({ ingredient, amount }) => {
            const key = ingredient.ingredient_code;
            if (!ingredientToSupplements[key]) {
                ingredientToSupplements[key] = {
                    ingredientData: {
                        id: ingredient.id,
                        externalName: ingredient.external_name,
                        unit: ingredient.daily_intake_unit,
                        minAmount: ingredient.daily_intake_min,
                        maxAmount: ingredient.daily_intake_max,
                    },
                    supplements: [],
                    totalAmount: 0,
                };
            }
            ingredientToSupplements[key].supplements.push(supplementName);
            ingredientToSupplements[key].totalAmount += amount * dosageCount;
        });
    });

    // 중복 성분 찾기 (2개 이상의 영양제에서 발견된 성분)
    const duplicates: AnalysisResult[] = [];
    const ingredients: AnalysisResult[] = [];

    Object.entries(ingredientToSupplements).forEach(([key, data], index) => {
        const { ingredientData, supplements: sourceSupplements, totalAmount } = data;
        
        const status = determineStatus(
            totalAmount,
            ingredientData.minAmount,
            ingredientData.maxAmount
        );

        const recommendationText = getRecommendationText(
            ingredientData.minAmount,
            ingredientData.maxAmount,
            ingredientData.unit
        );

        const analysisResult: AnalysisResult = {
            id: `ing-${index}`,
            ingredientName: ingredientData.externalName,
            status,
            currentAmount: Math.round(totalAmount * 10) / 10,
            minAmount: ingredientData.minAmount,
            maxAmount: ingredientData.maxAmount,
            unit: ingredientData.unit,
            sourceSupplements,
            recommendationText,
        };

        ingredients.push(analysisResult);

        // 중복 성분 체크 (2개 이상의 영양제에서 발견)
        if (sourceSupplements.length >= 2) {
            duplicates.push({
                ...analysisResult,
                id: `dup-${index}`,
            });
        }
    });

    return { ingredients, duplicates, supplements };
}

// 영양제 이름에서 성분 감지
function detectIngredients(
    supplementName: string,
    ingredientsMaster: Array<{
        id: number;
        ingredient_code: string;
        external_name: string;
        internal_name: string;
        daily_intake_unit: string;
        daily_intake_min: number | null;
        daily_intake_max: number | null;
    }>
): Array<{ ingredient: typeof ingredientsMaster[0]; amount: number }> {
    const detected: Array<{ ingredient: typeof ingredientsMaster[0]; amount: number }> = [];
    const nameLower = supplementName.toLowerCase();

    // 키워드 매핑 (영양제 이름 → 성분 코드)
    const keywordMapping: Record<string, { code: string; defaultAmount: number }[]> = {
        "비타민d": [{ code: "VIT_D", defaultAmount: 1000 }],
        "비타민 d": [{ code: "VIT_D", defaultAmount: 1000 }],
        "비타민c": [{ code: "VIT_C", defaultAmount: 500 }],
        "비타민 c": [{ code: "VIT_C", defaultAmount: 500 }],
        "비타민a": [{ code: "VIT_A", defaultAmount: 300 }],
        "비타민 a": [{ code: "VIT_A", defaultAmount: 300 }],
        "오메가": [{ code: "OMEGA3", defaultAmount: 1000 }],
        "칼슘": [{ code: "CALCIUM", defaultAmount: 500 }],
        "마그네슘": [{ code: "MAGNESIUM", defaultAmount: 400 }],
        "아연": [{ code: "ZINC", defaultAmount: 10 }],
        "철분": [{ code: "IRON", defaultAmount: 14 }],
        "콜라겐": [{ code: "COLLAGEN", defaultAmount: 2000 }],
        "유산균": [{ code: "PROBIOTICS", defaultAmount: 10000000000 }],
        "프로바이오틱스": [{ code: "PROBIOTICS", defaultAmount: 10000000000 }],
        "비오틴": [{ code: "BIOTIN", defaultAmount: 30 }],
        "종합": [
            { code: "VIT_D", defaultAmount: 400 },
            { code: "VIT_C", defaultAmount: 100 },
            { code: "VIT_B1", defaultAmount: 1.2 },
        ],
        "멀티": [
            { code: "VIT_D", defaultAmount: 400 },
            { code: "VIT_C", defaultAmount: 100 },
            { code: "VIT_B1", defaultAmount: 1.2 },
        ],
        "칼마디": [
            { code: "CALCIUM", defaultAmount: 500 },
            { code: "VIT_D", defaultAmount: 400 },
        ],
        "이뮨": [
            { code: "VIT_C", defaultAmount: 500 },
            { code: "ZINC", defaultAmount: 10 },
        ],
    };

    const processedCodes = new Set<string>();

    Object.entries(keywordMapping).forEach(([keyword, ingredients]) => {
        if (nameLower.includes(keyword)) {
            ingredients.forEach(({ code, defaultAmount }) => {
                if (!processedCodes.has(code)) {
                    const masterIngredient = ingredientsMaster.find(
                        (m) => m.ingredient_code === code
                    );
                    if (masterIngredient) {
                        detected.push({
                            ingredient: masterIngredient,
                            amount: defaultAmount,
                        });
                        processedCodes.add(code);
                    }
                }
            });
        }
    });

    // 아무것도 감지되지 않으면 기본 성분 추가
    if (detected.length === 0) {
        const defaultIngredient = ingredientsMaster.find(
            (m) => m.ingredient_code === "VIT_D"
        );
        if (defaultIngredient) {
            detected.push({
                ingredient: defaultIngredient,
                amount: defaultIngredient.daily_intake_min || 400,
            });
        }
    }

    return detected;
}

// 추천 성분 생성
function generateRecommendations(
    currentIngredients: AnalysisResult[],
    ingredientsMaster: Array<{
        id: number;
        ingredient_code: string;
        external_name: string;
    }>,
    interactions: Array<{
        ingredient_id_1: number;
        ingredient_id_2: number;
        interaction_type: string;
        description: string;
        ingredient_1?: { id: number; external_name: string };
        ingredient_2?: { id: number; external_name: string };
    }>
): Array<{ id: string; ingredientName: string; interactions: string[] }> {
    const recommendations: Array<{ id: string; ingredientName: string; interactions: string[] }> = [];
    
    // 현재 섭취중인 성분 ID 목록
    const currentIngredientNames = currentIngredients.map((i) => i.ingredientName);
    
    // 긍정적 상호작용이 있는 성분 찾기
    const positiveInteractions = interactions.filter(
        (i) => i.interaction_type === "positive"
    );
    
    // 부정적 상호작용이 있는 성분 ID 목록
    const negativeIngredientIds = new Set<number>();
    interactions
        .filter((i) => i.interaction_type === "negative")
        .forEach((i) => {
            negativeIngredientIds.add(i.ingredient_id_2);
        });

    const recommendedMap = new Map<string, string[]>();

    positiveInteractions.forEach((interaction) => {
        const ingredient1Name = interaction.ingredient_1?.external_name;
        const ingredient2Name = interaction.ingredient_2?.external_name;
        const ingredient2Id = interaction.ingredient_id_2;

        // 현재 섭취중인 성분과 긍정적 상호작용이 있고,
        // 아직 섭취하지 않는 성분이며,
        // 부정적 상호작용이 없는 성분 추천
        if (
            ingredient1Name &&
            ingredient2Name &&
            currentIngredientNames.includes(ingredient1Name) &&
            !currentIngredientNames.includes(ingredient2Name) &&
            !negativeIngredientIds.has(ingredient2Id)
        ) {
            if (!recommendedMap.has(ingredient2Name)) {
                recommendedMap.set(ingredient2Name, []);
            }
            recommendedMap.get(ingredient2Name)!.push(interaction.description);
        }
    });

    let index = 0;
    recommendedMap.forEach((interactions, ingredientName) => {
        recommendations.push({
            id: `rec-${index}`,
            ingredientName,
            interactions: [...new Set(interactions)], // 중복 제거
        });
        index++;
    });

    return recommendations.slice(0, 5); // 최대 5개 추천
}
