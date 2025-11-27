import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// 달성률에 따른 메시지 반환
function getAchievementMessage(rate: number): string {
    if (rate === 0) return '시작이 반! 오늘도 함께 가볼까요?!';
    if (rate < 30) return '아직 부족해요😊 좀 더 힘을 내봐요!';
    if (rate < 50) return '희망이 보여요! 포기하지말고 화이팅!';
    if (rate < 70) return '진짜 절반이에요! 완료까지 화이팅 🎉';
    if (rate < 100) return '거의 다 왔어요😊 곧 목표 완료!';
    return '오늘의 목표를 달성했어요 🎉';
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: challengeId } = await params;
        const supabase = await createClient();
        const adminSupabase = createAdminClient();
        const body = await request.json();

        const { slot = 1, verificationData = {} } = body;

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

        // 참여 정보 조회
        const { data: participation, error: participationError } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('challenge_id', challengeId)
            .eq('user_id', userId)
            .eq('status', 'participating')
            .single();

        if (participationError || !participation) {
            return NextResponse.json({ error: '참여중인 챌린지가 아닙니다.' }, { status: 400 });
        }

        // 인증 기간 확인
        const today = new Date();
        const endDate = new Date(participation.end_date);
        if (today > endDate) {
            return NextResponse.json({ error: '인증 기간이 종료되었습니다.' }, { status: 400 });
        }

        // 오늘 인증 횟수 확인
        const todayStr = today.toISOString().split('T')[0];
        const { data: todayVerifications } = await supabase
            .from('challenge_verifications')
            .select('*')
            .eq('participant_id', participation.id)
            .eq('verification_date', todayStr);

        const todayCount = todayVerifications?.length || 0;

        // 일일 인증 횟수 초과 확인
        if (todayCount >= challenge.daily_verification_count) {
            return NextResponse.json({ error: '오늘 인증 횟수를 모두 채웠습니다.' }, { status: 400 });
        }

        // 해당 슬롯이 이미 인증되었는지 확인
        const slotVerified = todayVerifications?.some(v => v.verification_slot === slot);
        if (slotVerified) {
            return NextResponse.json({ error: '이미 인증된 회차입니다.' }, { status: 400 });
        }

        // 시간대 검증 (시간대 설정이 있는 경우)
        if (challenge.verification_time_slots && challenge.verification_time_slots.length > 0) {
            const currentTime = today.toTimeString().slice(0, 5); // HH:MM
            const timeSlots = challenge.verification_time_slots as Array<{ start: string; end: string; label: string }>;

            // slot에 해당하는 시간대 확인
            const targetSlot = timeSlots[slot - 1];
            if (targetSlot) {
                if (currentTime < targetSlot.start || currentTime > targetSlot.end) {
                    return NextResponse.json({
                        error: `인증 가능 시간이 아닙니다. (${targetSlot.label}: ${targetSlot.start} ~ ${targetSlot.end})`
                    }, { status: 400 });
                }
            }
        }

        // 인증 기록 생성 (Admin 클라이언트 사용)
        const { data: verification, error: verificationError } = await adminSupabase
            .from('challenge_verifications')
            .insert({
                challenge_id: challengeId,
                participant_id: participation.id,
                user_id: userId,
                verification_date: todayStr,
                verification_time: today.toTimeString().slice(0, 8),
                verification_slot: slot,
                is_verified: true,
                verification_data: verificationData,
            })
            .select()
            .single();

        if (verificationError) throw verificationError;

        // 오늘 인증 횟수 업데이트
        const newTodayCount = todayCount + 1;

        // 참여자 정보 업데이트
        const totalVerificationCount = participation.total_verification_count + 1;
        const achievementRate = Math.min(
            (totalVerificationCount / participation.total_required_count) * 100,
            100
        );

        const updateData: any = {
            total_verification_count: totalVerificationCount,
            achievement_rate: achievementRate,
            today_verification_count: newTodayCount,
            last_verification_date: todayStr,
        };

        // 100% 달성 시 완료 처리
        if (achievementRate >= 100) {
            updateData.status = 'completed';
        }

        await adminSupabase
            .from('challenge_participants')
            .update(updateData)
            .eq('id', participation.id);

        // 일일 목표 달성 시 스탬프 부여
        const dailyGoalMet = newTodayCount >= challenge.daily_verification_count;
        let stampAwarded = false;

        if (dailyGoalMet) {
            // 오늘 날짜의 스탬프가 이미 있는지 확인
            const { data: existingStamp } = await supabase
                .from('challenge_stamps')
                .select('*')
                .eq('participant_id', participation.id)
                .eq('is_achieved', false)
                .order('stamp_number', { ascending: true })
                .limit(1)
                .single();

            if (existingStamp) {
                await adminSupabase
                    .from('challenge_stamps')
                    .update({
                        is_achieved: true,
                        achieved_at: new Date().toISOString(),
                        stamp_date: todayStr,
                    })
                    .eq('id', existingStamp.id);

                stampAwarded = true;
            }
        }

        // 랭킹 업데이트 (Admin 클라이언트 사용)
        await adminSupabase
            .from('challenge_rankings')
            .upsert({
                challenge_id: challengeId,
                user_id: userId,
                participant_id: participation.id,
                achievement_rate: achievementRate,
                completed_at: achievementRate >= 100 ? new Date().toISOString() : null,
            }, { onConflict: 'challenge_id,user_id' });

        // 응답
        const isCompleted = achievementRate >= 100;
        const message = getAchievementMessage(achievementRate);

        return NextResponse.json({
            success: true,
            verification,
            todayVerificationCount: newTodayCount,
            dailyGoalMet,
            totalVerificationCount,
            achievementRate,
            stampAwarded,
            isCompleted,
            message,
        });

    } catch (error) {
        console.error('챌린지 인증 API 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

