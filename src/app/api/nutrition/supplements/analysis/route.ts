import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        const { data: ingredientsMaster, error: ingredientsError } = await supabase
            .from("functional_ingredients")
            .select("*")
            .eq("is_active", true);

        if (ingredientsError) {
            console.error("Ingredients fetch error:", ingredientsError);
            return NextResponse.json(
                { error: "기능성 성분 테이블이 없습니다. SQL을 먼저 실행해주세요." },
                { status: 500 }
            );
        }

        if (!ingredientsMaster || ingredientsMaster.length === 0) {
            return NextResponse.json(
                { error: "기능성 성분 데이터가 없습니다. SQL을 먼저 실행해주세요." },
                { status: 500 }
            );
        }

        // 제품 마스터 조회 (이름으로 매칭용)
        const { data: productsMaster } = await supabase
            .from("supplement_products_master")
            .select("*")
            .eq("is_active", true);

        // 제품-성분 매핑 조회 (실제 함량 정보)
        const { data: productIngredientMappings } = await supabase
            .from("product_ingredient_mapping")
            .select(`
                *,
                product:supplement_products_master(id, product_name),
                ingredient:functional_ingredients(id, ingredient_code, external_name, daily_intake_unit, daily_intake_min, daily_intake_max)
            `);

        // 성분 상호작용 조회
        const { data: interactions } = await supabase
            .from("ingredient_interactions")
            .select(`
                *,
                ingredient_1:functional_ingredients!ingredient_id_1(id, external_name),
                ingredient_2:functional_ingredients!ingredient_id_2(id, external_name)
            `)
            .eq("is_active", true);

        // 성분 분석 생성 (DB 기반)
        const { ingredients, duplicates, supplements } = analyzeSupplementsFromDB(
            routines,
            productsMaster || [],
            productIngredientMappings || [],
            ingredientsMaster
        );

        // 추천 성분 생성
        const recommendations = generateRecommendations(
            ingredients,
            ingredientsMaster,
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

// DB 기반 영양제 분석 함수
function analyzeSupplementsFromDB(
    routines: Array<{
        id: string;
        name: string;
        brand?: string;
        dosage: string;
        supplement_product_id?: string;
        scheduled_times?: Array<{ dosage?: string }>;
    }>,
    productsMaster: Array<{
        id: string;
        product_name: string;
        manufacturer?: string;
        form_unit?: string;
        default_intake_amount?: string;
    }>,
    productIngredientMappings: Array<{
        product_id: string;
        ingredient_id: number;
        content_amount: number;
        content_unit: string;
        product?: { id: string; product_name: string };
        ingredient?: {
            id: number;
            ingredient_code: string;
            external_name: string;
            daily_intake_unit: string;
            daily_intake_min: number | null;
            daily_intake_max: number | null;
        };
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
        ingredientData: {
            id: number;
            externalName: string;
            unit: string;
            minAmount: number | null;
            maxAmount: number | null;
        };
        supplements: string[];
        totalAmount: number;
    }> = {};

    // 영양제 요약 정보
    const supplements: Array<{ name: string; dosage: string }> = [];

    routines.forEach((routine) => {
        const supplementName = routine.name;
        const scheduledTimes = routine.scheduled_times || [];
        
        // 모든 시간대의 섭취량 합산
        let totalDosageCount = 0;
        let dosageUnit = "정";
        
        if (scheduledTimes.length > 0) {
            scheduledTimes.forEach((time: { dosage?: string }) => {
                const dosageStr = time.dosage || "1정";
                const match = dosageStr.match(/(\d+)\s*(정|포|캡슐|알|봉|ml|g)?/);
                if (match) {
                    totalDosageCount += parseInt(match[1]);
                    if (match[2]) dosageUnit = match[2];
                } else {
                    totalDosageCount += 1;
                }
            });
        }
        
        if (totalDosageCount === 0) {
            const dosageStr = routine.dosage || "1정";
            const match = dosageStr.match(/(\d+)\s*(정|포|캡슐|알|봉|ml|g)?/);
            if (match) {
                totalDosageCount = parseInt(match[1]);
                if (match[2]) dosageUnit = match[2];
            } else {
                totalDosageCount = 1;
            }
        }

        supplements.push({
            name: supplementName,
            dosage: `${totalDosageCount}${dosageUnit}`,
        });

        // 1. 먼저 supplement_product_id로 제품 매칭 시도
        let matchedProductId = routine.supplement_product_id;
        
        // 2. supplement_product_id가 없으면 제품명으로 매칭 시도
        if (!matchedProductId) {
            const matchedProduct = productsMaster.find(p => 
                supplementName.includes(p.product_name) || 
                p.product_name.includes(supplementName) ||
                supplementName.toLowerCase() === p.product_name.toLowerCase()
            );
            if (matchedProduct) {
                matchedProductId = matchedProduct.id;
            }
        }

        // 3. 제품 ID로 성분 매핑 조회
        if (matchedProductId) {
            const productMappings = productIngredientMappings.filter(
                m => m.product_id === matchedProductId
            );

            productMappings.forEach((mapping) => {
                if (!mapping.ingredient) return;
                
                const ingredientCode = mapping.ingredient.ingredient_code;
                const contentAmount = mapping.content_amount;
                
                if (!ingredientToSupplements[ingredientCode]) {
                    ingredientToSupplements[ingredientCode] = {
                        ingredientData: {
                            id: mapping.ingredient.id,
                            externalName: mapping.ingredient.external_name,
                            unit: mapping.content_unit || mapping.ingredient.daily_intake_unit,
                            minAmount: mapping.ingredient.daily_intake_min,
                            maxAmount: mapping.ingredient.daily_intake_max,
                        },
                        supplements: [],
                        totalAmount: 0,
                    };
                }
                ingredientToSupplements[ingredientCode].supplements.push(supplementName);
                ingredientToSupplements[ingredientCode].totalAmount += contentAmount * totalDosageCount;
            });
        } else {
            // 4. 제품을 찾지 못한 경우 - 이름 기반 폴백 (키워드 매칭)
            const detectedIngredients = detectIngredientsFromName(supplementName, ingredientsMaster);
            
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
                ingredientToSupplements[key].totalAmount += amount * totalDosageCount;
            });
        }
    });

    // 분석 결과 생성
    const duplicates: AnalysisResult[] = [];
    const ingredients: AnalysisResult[] = [];

    Object.entries(ingredientToSupplements).forEach(([, data], index) => {
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

// 이름 기반 성분 감지 (폴백용 - DB에 제품이 없을 때만 사용)
function detectIngredientsFromName(
    supplementName: string,
    ingredientsMaster: Array<{
        id: number;
        ingredient_code: string;
        external_name: string;
        internal_name?: string;
        daily_intake_unit: string;
        daily_intake_min: number | null;
        daily_intake_max: number | null;
    }>
): Array<{ ingredient: typeof ingredientsMaster[0]; amount: number }> {
    const detected: Array<{ ingredient: typeof ingredientsMaster[0]; amount: number }> = [];
    const nameLower = supplementName.toLowerCase();

    // 성분 마스터의 이름으로 매칭 시도
    ingredientsMaster.forEach((ingredient) => {
        const externalNameLower = ingredient.external_name.toLowerCase();
        const internalNameLower = (ingredient.internal_name || "").toLowerCase();
        
        if (nameLower.includes(externalNameLower) || 
            nameLower.includes(internalNameLower) ||
            nameLower.includes(externalNameLower.replace(/\s/g, "")) ||
            nameLower.includes(internalNameLower.replace(/\s/g, ""))) {
            
            // 기본 섭취량은 min 값의 80% 정도로 설정 (추정치)
            const defaultAmount = ingredient.daily_intake_min 
                ? ingredient.daily_intake_min * 0.8 
                : 100;
            
            detected.push({
                ingredient,
                amount: defaultAmount,
            });
        }
    });

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
    
    // 현재 섭취중인 성분 이름 목록
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
    recommendedMap.forEach((interactionList, ingredientName) => {
        recommendations.push({
            id: `rec-${index}`,
            ingredientName,
            interactions: [...new Set(interactionList)],
        });
        index++;
    });

    return recommendations.slice(0, 5);
}
