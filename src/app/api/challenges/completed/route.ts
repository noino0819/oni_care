import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 완료한 챌린지 목록 조회
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 완료한 챌린지 참여 기록 조회
        const { data: participations, error: participationError } = await supabase
            .from("challenge_participants")
            .select(
                `
                id,
                challenge_id,
                status,
                achievement_rate,
                total_verification_count,
                is_reward_claimed,
                created_at,
                updated_at,
                challenges (
                    id,
                    title,
                    thumbnail_url,
                    challenge_type,
                    daily_verification_count,
                    total_reward,
                    reward_type
                )
            `
            )
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("updated_at", { ascending: false });

        if (participationError) {
            console.error("Completed challenges fetch error:", participationError);
            return NextResponse.json(
                { error: participationError.message },
                { status: 500 }
            );
        }

        // 랭킹 정보 조회 (있는 경우)
        const challengeIds =
            participations?.map((p) => p.challenge_id).filter(Boolean) || [];

        let rankingsMap: Record<string, number> = {};

        if (challengeIds.length > 0) {
            const { data: rankings } = await supabase
                .from("challenge_rankings")
                .select("challenge_id, rank_position")
                .eq("user_id", user.id)
                .in("challenge_id", challengeIds);

            rankingsMap =
                rankings?.reduce((acc, r) => {
                    acc[r.challenge_id] = r.rank_position;
                    return acc;
                }, {} as Record<string, number>) || {};
        }

        // 응답 데이터 포맷팅
        const completedChallenges =
            participations?.map((p) => {
                const challenge = p.challenges as {
                    id: string;
                    title: string;
                    thumbnail_url: string | null;
                    challenge_type: string;
                    daily_verification_count: number;
                    total_reward: string;
                    reward_type: string;
                };

                return {
                    participationId: p.id,
                    challengeId: challenge?.id,
                    title: challenge?.title || "챌린지",
                    thumbnailUrl: challenge?.thumbnail_url,
                    challengeType: challenge?.challenge_type,
                    dailyVerificationCount: challenge?.daily_verification_count || 1,
                    totalReward: challenge?.total_reward,
                    rewardType: challenge?.reward_type,
                    achievementRate: p.achievement_rate,
                    totalVerificationCount: p.total_verification_count,
                    isRewardClaimed: p.is_reward_claimed,
                    rankPosition: rankingsMap[p.challenge_id] || null,
                    completedAt: p.updated_at,
                };
            }) || [];

        return NextResponse.json({
            completedChallenges,
            totalCount: completedChallenges.length,
        });
    } catch (error) {
        console.error("Completed challenges API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch completed challenges" },
            { status: 500 }
        );
    }
}

