import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

interface RouletteSegment {
    label: string;
    probability: number;
    reward_type: string;
    reward_value: number;
    image_url?: string;
}

// 확률 기반 룰렛 결과 선택
function spinRoulette(segments: RouletteSegment[]): { segment: RouletteSegment; index: number } {
    const totalProbability = segments.reduce((sum, seg) => sum + seg.probability, 0);
    const random = Math.random() * totalProbability;

    let cumulative = 0;
    for (let i = 0; i < segments.length; i++) {
        cumulative += segments[i].probability;
        if (random <= cumulative) {
            return { segment: segments[i], index: i };
        }
    }

    // 기본적으로 마지막 세그먼트 반환
    return { segment: segments[segments.length - 1], index: segments.length - 1 };
}

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

        // 룰렛 챌린지인지 확인
        if (challenge.challenge_type !== 'attendance' || challenge.verification_method !== 'roulette') {
            return NextResponse.json({ error: '룰렛 챌린지가 아닙니다.' }, { status: 400 });
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

        // 오늘 이미 룰렛을 돌렸는지 확인
        const today = new Date().toISOString().split('T')[0];
        const { data: existingSpin } = await supabase
            .from('roulette_spins')
            .select('*')
            .eq('challenge_id', challengeId)
            .eq('user_id', userId)
            .eq('spin_date', today)
            .single();

        if (existingSpin) {
            return NextResponse.json({
                error: '룰렛은 하루에 한번만 참여할 수 있어요! 내일 다시 만나요 :D',
                alreadySpun: true,
                wonSegment: existingSpin.won_segment,
            }, { status: 400 });
        }

        // 룰렛 설정 조회
        const { data: rouletteSettings, error: rouletteError } = await supabase
            .from('roulette_settings')
            .select('*')
            .eq('challenge_id', challengeId)
            .single();

        if (rouletteError || !rouletteSettings) {
            return NextResponse.json({ error: '룰렛 설정을 찾을 수 없습니다.' }, { status: 500 });
        }

        const segments = rouletteSettings.segments as RouletteSegment[];

        // 룰렛 돌리기
        const { segment: wonSegment, index: wonIndex } = spinRoulette(segments);

        // 스핀 기록 저장 (Admin 클라이언트 사용)
        await adminSupabase
            .from('roulette_spins')
            .insert({
                challenge_id: challengeId,
                participant_id: participation.id,
                user_id: userId,
                spin_date: today,
                won_segment: wonSegment,
            });

        // 인증 기록 생성 (Admin 클라이언트 사용)
        await adminSupabase
            .from('challenge_verifications')
            .insert({
                challenge_id: challengeId,
                participant_id: participation.id,
                user_id: userId,
                verification_date: today,
                verification_slot: 1,
                is_verified: true,
                verification_data: { roulette: true, wonSegment },
            });

        // 참여자 정보 업데이트
        const totalVerificationCount = participation.total_verification_count + 1;
        const achievementRate = Math.min(
            (totalVerificationCount / participation.total_required_count) * 100,
            100
        );

        const updateData: any = {
            total_verification_count: totalVerificationCount,
            achievement_rate: achievementRate,
            today_verification_count: 1,
            last_verification_date: today,
        };

        if (achievementRate >= 100) {
            updateData.status = 'completed';
        }

        await adminSupabase
            .from('challenge_participants')
            .update(updateData)
            .eq('id', participation.id);

        // 스탬프 부여
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
                    stamp_date: today,
                })
                .eq('id', existingStamp.id);
        }

        // 포인트 보상 지급 (포인트 타입인 경우) - Admin 클라이언트 사용
        if (wonSegment.reward_type === 'point') {
            const { data: userPoints } = await supabase
                .from('user_points')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (userPoints) {
                await adminSupabase
                    .from('user_points')
                    .update({ total_points: userPoints.total_points + wonSegment.reward_value })
                    .eq('user_id', userId);
            } else {
                await adminSupabase
                    .from('user_points')
                    .insert({ user_id: userId, total_points: wonSegment.reward_value });
            }
        }

        // 응답 메시지 생성
        let message = '';
        if (wonSegment.reward_type === 'point') {
            message = `${wonSegment.reward_value}포인트를 받았어요!`;
        } else if (wonSegment.reward_type === 'coupon') {
            message = `${wonSegment.label}을 받았어요! 발급지점을 확인해 주세요`;
        } else {
            message = `${wonSegment.label}을 받았어요!`;
        }

        return NextResponse.json({
            success: true,
            wonSegment,
            wonIndex,
            message,
            achievementRate,
            totalVerificationCount,
        });

    } catch (error) {
        console.error('룰렛 API 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

// 룰렛 설정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const supabase = await createClient();
    
    // 현재 사용자 정보
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

        // 룰렛 설정 조회
        const { data: rouletteSettings, error } = await supabase
            .from('roulette_settings')
            .select('*')
            .eq('challenge_id', challengeId)
            .single();

        if (error || !rouletteSettings) {
            return NextResponse.json({ error: '룰렛 설정을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 오늘 스핀 여부 확인
        let todaySpun = false;
        if (userId) {
            const today = new Date().toISOString().split('T')[0];
            const { data: existingSpin } = await supabase
                .from('roulette_spins')
                .select('*')
                .eq('challenge_id', challengeId)
                .eq('user_id', userId)
                .eq('spin_date', today)
                .single();

            todaySpun = !!existingSpin;
        }

        return NextResponse.json({
            rouletteSettings,
            todaySpun,
        });

    } catch (error) {
        console.error('룰렛 설정 조회 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

