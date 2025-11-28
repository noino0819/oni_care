import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// FAQ 카테고리 및 FAQ 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();

    // 카테고리 가져오기
    const { data: categories, error: categoriesError } = await supabase
      .from("faq_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (categoriesError) throw categoriesError;

    // FAQ 가져오기
    const { data: faqs, error: faqsError } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (faqsError) throw faqsError;

    return NextResponse.json({ 
      categories,
      faqs 
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}


