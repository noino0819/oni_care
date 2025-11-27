import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: challengeId } = await params;
        const supabase = await createClient();
        const adminSupabase = createAdminClient();

        // 현재 사용자 정보
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const userId = user.id;

        // 챌린지 정보 조회
        const { data: challenge, error: challengeError } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', challengeId)
            .single();

        if (challengeError || !challenge) {
            return NextResponse.json({ error: '챌린지를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 모집중인지 확인
        const now = new Date();
        if (challenge.recruitment_start_date && new Date(challenge.recruitment_start_date) > now) {
            return NextResponse.json({ error: '아직 모집이 시작되지 않았습니다.' }, { status: 400 });
        }

        if (challenge.recruitment_end_date && new Date(challenge.recruitment_end_date) < now) {
            return NextResponse.json({ error: '모집이 종료되었습니다.' }, { status: 400 });
        }

        // 인원 마감 확인
        if (challenge.max_participants && challenge.current_participants >= challenge.max_participants) {
            return NextResponse.json({ error: '모집 인원이 마감되었습니다.' }, { status: 400 });
        }

        // 이미 참여중인지 확인
        const { data: existingParticipation } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('challenge_id', challengeId)
            .eq('user_id', userId)
            .single();

        if (existingParticipation && existingParticipation.status === 'participating') {
            return NextResponse.json({ error: '이미 참여중인 챌린지입니다.' }, { status: 400 });
        }

        // 동일 유형 챌린지 중복 참여 확인 (건강습관 제외)
        if (challenge.challenge_type !== 'health_habit') {
            const { data: sameTypeChallenges } = await supabase
                .from('challenge_participants')
                .select('*, challenges!inner(*)')
                .eq('user_id', userId)
                .eq('status', 'participating')
                .eq('challenges.challenge_type', challenge.challenge_type);

            if (sameTypeChallenges && sameTypeChallenges.length > 0) {
                return NextResponse.json({
                    error: `이미 같은 유형의 챌린지에 참여중입니다. (${challenge.challenge_type})`
                }, { status: 400 });
            }
        }

        // 참여 데이터 생성
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + challenge.challenge_duration_days);

        const totalRequiredCount = challenge.challenge_duration_days * challenge.daily_verification_count;

        const participationData = {
            challenge_id: challengeId,
            user_id: userId,
            status: 'participating',
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            total_required_count: totalRequiredCount,
        };

        // 기존 취소된 참여가 있으면 업데이트, 없으면 생성 (Admin 클라이언트 사용)
        let participation;
        if (existingParticipation) {
            const { data, error } = await adminSupabase
                .from('challenge_participants')
                .update({
                    ...participationData,
                    total_verification_count: 0,
                    achievement_rate: 0,
                    today_verification_count: 0,
                    is_reward_claimed: false,
                })
                .eq('id', existingParticipation.id)
                .select()
                .single();

            if (error) throw error;
            participation = data;
        } else {
            const { data, error } = await adminSupabase
                .from('challenge_participants')
                .insert(participationData)
                .select()
                .single();

            if (error) throw error;
            participation = data;
        }

        // 스탬프 데이터 생성 (Admin 클라이언트 사용)
        const stampPromises = [];
        for (let i = 1; i <= challenge.total_stamp_count; i++) {
            stampPromises.push(
                adminSupabase
                    .from('challenge_stamps')
                    .upsert({
                        participant_id: participation.id,
                        user_id: userId,
                        challenge_id: challengeId,
                        stamp_number: i,
                        is_achieved: false,
                    }, { onConflict: 'participant_id,stamp_number' })
            );
        }
        await Promise.all(stampPromises);

        // 챌린지 참여자 수 업데이트 (Admin 클라이언트 사용)
        await adminSupabase
            .from('challenges')
            .update({ current_participants: (challenge.current_participants || 0) + 1 })
            .eq('id', challengeId);

        return NextResponse.json({
            success: true,
            message: '챌린지에 참여했습니다!',
            participation,
        });

    } catch (error) {
        console.error('챌린지 참여 API 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 챌린지 취소
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: challengeId } = await params;
        const supabase = await createClient();
        const adminSupabase = createAdminClient();

        // 현재 사용자 정보
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const userId = user.id;

        // 참여 정보 조회
        const { data: participation, error: participationError } = await supabase
            .from('challenge_participants')
            .select('*, challenges(*)')
            .eq('challenge_id', challengeId)
            .eq('user_id', userId)
            .single();

        if (participationError || !participation) {
            return NextResponse.json({ error: '참여 정보를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 이미 완료된 챌린지는 취소 불가
        if (participation.status === 'completed') {
            return NextResponse.json({ error: '완료된 챌린지는 취소할 수 없습니다.' }, { status: 400 });
        }

        // 기간 만료된 챌린지는 취소 불가
        if (participation.status === 'expired') {
            return NextResponse.json({ error: '기간이 만료된 챌린지는 취소할 수 없습니다.' }, { status: 400 });
        }

        // 참여 상태를 취소로 변경 (Admin 클라이언트 사용)
        const { error: updateError } = await adminSupabase
            .from('challenge_participants')
            .update({ status: 'cancelled' })
            .eq('id', participation.id);

        if (updateError) throw updateError;

        // 인증 기록 삭제 (Admin 클라이언트 사용)
        await adminSupabase
            .from('challenge_verifications')
            .delete()
            .eq('participant_id', participation.id);

        // 스탬프 초기화 (Admin 클라이언트 사용)
        await adminSupabase
            .from('challenge_stamps')
            .update({ is_achieved: false, achieved_at: null })
            .eq('participant_id', participation.id);

        return NextResponse.json({
            success: true,
            message: '챌린지 참여가 취소되었습니다.',
        });

    } catch (error) {
        console.error('챌린지 취소 API 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

