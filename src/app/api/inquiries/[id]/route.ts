import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 문의 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("inquiries")
      .select(`
        *,
        inquiry_type:inquiry_types(*)
      `)
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiry" },
      { status: 500 }
    );
  }
}

// 문의 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { inquiry_type_id, content } = body;

    // 미답변 상태인지 확인
    const { data: existingInquiry } = await supabase
      .from("inquiries")
      .select("status")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (!existingInquiry || existingInquiry.status !== "pending") {
      return NextResponse.json(
        { error: "Cannot update answered inquiry" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inquiries")
      .update({
        inquiry_type_id,
        content,
      })
      .eq("id", id)
      .eq("user_id", session.user.id)
      .select(`
        *,
        inquiry_type:inquiry_types(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

