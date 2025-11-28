import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 공지사항 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching notice:", error);
    return NextResponse.json(
      { error: "Failed to fetch notice" },
      { status: 500 }
    );
  }
}


