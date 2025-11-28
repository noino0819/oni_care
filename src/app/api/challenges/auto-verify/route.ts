import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 자동 인증 API
 * - 걸음수, 식사기록, 영양제 기록 시 참여중인 챌린지 자동 인증
 * 
 * POST /api/challenges/auto-verify
 * body: { type: 'steps' | 'meal' | 'supplement', data: { ... } }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { type, data } = body;

        // 현재 사용자 확인
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().slice(0, 5);

        // 해당 유형의 참여중인 챌린지 조회
        const { data: participations, error: participationsError } = await supabase
            .from('challenge_participants')
            .select(`
        *,
        challenges!inner(*)
      `)
            .eq('user_id', user.id)
            .eq('status', 'participating')
            .eq('challenges.challenge_type', type);

        if (participationsError || !participations || participations.length === 0) {
            return NextResponse.json({
                success: true,
                message: '해당 유형의 참여중인 챌린지가 없습니다.',
                verifiedChallenges: []
            });
        }

        const verifiedChallenges: string[] = [];

        for (const participation of participations) {
            const challenge = participation.challenges;

            // 오늘 인증 횟수 확인
            const { data: todayVerifications } = await supabase
                .from('challenge_verifications')
                .select('*')
                .eq('participant_id', participation.id)
                .eq('verification_date', today);

            const todayCount = todayVerifications?.length || 0;

            // 일일 인증 횟수 초과 확인
            if (todayCount >= challenge.daily_verification_count) {
                continue;
            }

            // 시간대 검증 (시간대 설정이 있는 경우)
            let validSlot: number | null = null;

            if (challenge.verification_time_slots && challenge.verification_time_slots.length > 0) {
                for (let i = 0; i < challenge.verification_time_slots.length; i++) {
                    const slot = challenge.verification_time_slots[i];
                    const isVerified = todayVerifications?.some((v: any) => v.verification_slot === i + 1);

                    if (!isVerified && currentTime >= slot.start && currentTime <= slot.end) {
                        validSlot = i + 1;
                        break;
                    }
                }

                // 유효한 시간대가 없으면 건너뛰기
                if (validSlot === null) {
                    continue;
                }
            } else {
                validSlot = todayCount + 1;
            }

            // 유형별 추가 검증
            let verificationData: any = {};
            let shouldVerify = false;

            switch (type) {
                case 'steps':
                    // 걸음수 챌린지: 목표 걸음수 달성 여부 확인
                    const targetSteps = data.targetSteps || 10000;
                    const currentSteps = data.currentSteps || 0;

                    if (currentSteps >= targetSteps) {
                        shouldVerify = true;
                        verificationData = { currentSteps, targetSteps };
                    }
                    break;

                case 'meal':
                    // 식사기록 챌린지: 식사 기록이 있으면 인증
                    if (data.mealId || data.recorded) {
                        shouldVerify = true;
                        verificationData = { mealId: data.mealId, mealType: data.mealType };
                    }
                    break;

                case 'supplement':
                    // 영양제 챌린지: 영양제 복용 기록이 있으면 인증
                    if (data.supplementId || data.recorded) {
                        shouldVerify = true;
                        verificationData = { supplementId: data.supplementId };
                    }
                    break;
            }

            if (!shouldVerify) {
                continue;
            }

            // 인증 기록 생성
            await supabase
                .from('challenge_verifications')
                .insert({
                    challenge_id: challenge.id,
                    participant_id: participation.id,
                    user_id: user.id,
                    verification_date: today,
                    verification_time: new Date().toTimeString().slice(0, 8),
                    verification_slot: validSlot,
                    is_verified: true,
                    verification_data: verificationData,
                });

            // 참여자 정보 업데이트
            const newTodayCount = todayCount + 1;
            const totalVerificationCount = participation.total_verification_count + 1;
            const achievementRate = Math.min(
                (totalVerificationCount / participation.total_required_count) * 100,
                100
            );

            const updateData: any = {
                total_verification_count: totalVerificationCount,
                achievement_rate: achievementRate,
                today_verification_count: newTodayCount,
                last_verification_date: today,
            };

            if (achievementRate >= 100) {
                updateData.status = 'completed';
            }

            await supabase
                .from('challenge_participants')
                .update(updateData)
                .eq('id', participation.id);

            // 일일 목표 달성 시 스탬프 부여
            if (newTodayCount >= challenge.daily_verification_count) {
                const { data: existingStamp } = await supabase
                    .from('challenge_stamps')
                    .select('*')
                    .eq('participant_id', participation.id)
                    .eq('is_achieved', false)
                    .order('stamp_number', { ascending: true })
                    .limit(1)
                    .single();

                if (existingStamp) {
                    await supabase
                        .from('challenge_stamps')
                        .update({
                            is_achieved: true,
                            achieved_at: new Date().toISOString(),
                            stamp_date: today,
                        })
                        .eq('id', existingStamp.id);
                }
            }

            // 랭킹 업데이트
            await supabase
                .from('challenge_rankings')
                .upsert({
                    challenge_id: challenge.id,
                    user_id: user.id,
                    participant_id: participation.id,
                    achievement_rate: achievementRate,
                    completed_at: achievementRate >= 100 ? new Date().toISOString() : null,
                }, { onConflict: 'challenge_id,user_id' });

            verifiedChallenges.push(challenge.id);
        }

        return NextResponse.json({
            success: true,
            verifiedChallenges,
            message: verifiedChallenges.length > 0
                ? `${verifiedChallenges.length}개의 챌린지가 자동 인증되었습니다.`
                : '자동 인증된 챌린지가 없습니다.',
        });

    } catch (error) {
        console.error('자동 인증 API 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

/**
 * 걸음수 자동 체크 API
 * GET /api/challenges/auto-verify?type=steps
 * 
 * 현재 걸음수를 조회하고 참여중인 걸음수 챌린지 자동 인증
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        // 현재 사용자 확인
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }

        if (type === 'steps') {
            const today = new Date().toISOString().split('T')[0];

            // 오늘의 걸음수 조회
            const { data: stepRecord } = await supabase
                .from('step_records')
                .select('*')
                .eq('user_id', user.id)
                .eq('record_date', today)
                .single();

            if (!stepRecord) {
                return NextResponse.json({
                    success: true,
                    currentSteps: 0,
                    targetSteps: 10000,
                    message: '오늘의 걸음수 기록이 없습니다.',
                });
            }

            // 참여중인 걸음수 챌린지 조회
            const { data: participations } = await supabase
                .from('challenge_participants')
                .select(`
          *,
          challenges!inner(*)
        `)
                .eq('user_id', user.id)
                .eq('status', 'participating')
                .eq('challenges.challenge_type', 'steps');

            const challengeStatus = participations?.map((p: any) => {
                const targetSteps = p.challenges.target_steps || 10000;
                return {
                    challengeId: p.challenges.id,
                    challengeTitle: p.challenges.title,
                    currentSteps: stepRecord.step_count,
                    targetSteps,
                    achieved: stepRecord.step_count >= targetSteps,
                    achievementRate: Math.min((stepRecord.step_count / targetSteps) * 100, 100),
                };
            }) || [];

            return NextResponse.json({
                success: true,
                currentSteps: stepRecord.step_count,
                goalSteps: stepRecord.goal_steps,
                challengeStatus,
            });
        }

        return NextResponse.json({ error: '지원하지 않는 타입입니다.' }, { status: 400 });

    } catch (error) {
        console.error('자동 인증 조회 API 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}


