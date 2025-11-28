import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 문의 유형 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("inquiry_types")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching inquiry types:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry types" },
      { status: 500 }
    );
  }
}


