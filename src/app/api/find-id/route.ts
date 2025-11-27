import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// 서버사이드에서 service_role 키로 클라이언트 생성 (RLS 우회)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { name, phone, verificationId } = await request.json();

        if (!name || !phone) {
            return NextResponse.json(
                { error: "이름과 휴대폰 번호를 모두 입력해주세요." },
                { status: 400 }
            );
        }

        // 휴대폰 번호 정규화 (하이픈 제거)
        const normalizedPhone = phone.replace(/-/g, "");

        // 인증번호 검증 확인 (verificationId가 있는 경우)
        if (verificationId) {
            const { data: verification, error: verifyError } = await supabaseAdmin
                .from("phone_verifications")
                .select("*")
                .eq("id", verificationId)
                .eq("phone", normalizedPhone)
                .eq("purpose", "find_id")
                .eq("verified", true)
                .single();

            if (verifyError || !verification) {
                return NextResponse.json(
                    { error: "인증이 완료되지 않았습니다." },
                    { status: 400 }
                );
            }
        }

        // 이름과 휴대폰 번호로 사용자 조회
        const { data, error } = await supabaseAdmin
            .from("users")
            .select("id, email, created_at, provider")
            .eq("name", name)
            .eq("phone", normalizedPhone)
            .single();

        if (error || !data) {
            return NextResponse.json({
                success: true,
                found: false,
                message: "입력하신 정보와 일치하는 아이디가 없습니다.",
            });
        }

        // 아이디 마스킹 처리 (4번째 자리부터)
        const email = data.email;
        let maskedId: string;
        let displayType: "email" | "social";
        let provider: string = data.provider || "email";

        if (provider === "email") {
            // 일반 가입: 이메일 형식 - 4번째 문자부터 마스킹
            const [localPart, domain] = email.split("@");
            if (localPart.length > 3) {
                maskedId = localPart.substring(0, 3) + "*".repeat(localPart.length - 3);
            } else {
                maskedId = localPart.substring(0, 1) + "*".repeat(Math.max(0, localPart.length - 1));
            }
            // 도메인은 표시하지 않음 (기획서에 맞게)
            displayType = "email";
        } else {
            // SNS 가입: 소셜 채널만 표시
            displayType = "social";
            maskedId = "";
        }

        // 가입일 포맷팅 (YYYY.MM.DD)
        const createdAt = new Date(data.created_at);
        const joinDate = `${createdAt.getFullYear()}.${String(createdAt.getMonth() + 1).padStart(2, "0")}.${String(createdAt.getDate()).padStart(2, "0")}`;

        return NextResponse.json({
            success: true,
            found: true,
            displayType,
            maskedId,
            fullEmail: email,
            joinDate,
            provider,
        });
    } catch (error) {
        console.error("Find ID error:", error);
        return NextResponse.json(
            { error: "아이디 찾기 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
