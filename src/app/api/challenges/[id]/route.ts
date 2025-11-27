import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 챌린지 상태 계산 함수
function getChallengeStatus(challenge: any, participation: any | null): string {
    const now = new Date();

    if (participation && participation.status === 'participating') {
        if (participation.achievement_rate >= 100) {
            return 'completed';
        }
        if (participation.end_date && new Date(participation.end_date) < now) {
            return 'expired';
        }
        return 'participating';
    }

    if (challenge.operation_end_date && new Date(challenge.operation_end_date) < now) {
        return 'ended';
    }

    if (challenge.recruitment_start_date && new Date(challenge.recruitment_start_date) > now) {
        return 'before_recruitment';
    }

    if (challenge.recruitment_end_date && new Date(challenge.recruitment_end_date) < now) {
        return 'recruitment_closed';
    }

    if (challenge.max_participants && challenge.current_participants >= challenge.max_participants) {
        return 'recruitment_closed';
    }

    return 'recruiting';
}

function getStatusTag(status: string): { text: string; color: string } {
    switch (status) {
        case 'before_recruitment':
            return { text: '모집전', color: 'gray' };
        case 'recruiting':
            return { text: '모집중', color: 'purple' };
        case 'recruitment_closed':
            return { text: '모집완료', color: 'gray' };
        case 'participating':
            return { text: '참여중', color: 'green' };
        case 'completed':
        case 'ended':
        case 'expired':
            return { text: '종료', color: 'gray' };
        default:
            return { text: '알수없음', color: 'gray' };
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 현재 사용자 정보
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // 챌린지 정보 조회
        const { data: challenge, error } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !challenge) {
            return NextResponse.json({ error: '챌린지를 찾을 수 없습니다.' }, { status: 404 });
        }

        // 사용자 참여 정보 조회
        let participation = null;
        let stamps: any[] = [];
        let todayVerifications: any[] = [];

        if (userId) {
            const { data: userParticipation } = await supabase
                .from('challenge_participants')
                .select('*')
                .eq('challenge_id', id)
                .eq('user_id', userId)
                .single();

            participation = userParticipation;

            // 스탬프 정보 조회
            if (participation) {
                const { data: stampData } = await supabase
                    .from('challenge_stamps')
                    .select('*')
                    .eq('participant_id', participation.id)
                    .order('stamp_number', { ascending: true });

                stamps = stampData || [];

                // 오늘 인증 기록 조회
                const today = new Date().toISOString().split('T')[0];
                const { data: verificationData } = await supabase
                    .from('challenge_verifications')
                    .select('*')
                    .eq('participant_id', participation.id)
                    .eq('verification_date', today);

                todayVerifications = verificationData || [];
            }
        }

        // 퀴즈 정보 조회 (퀴즈 챌린지인 경우)
        let quizzes: any[] = [];
        if (challenge.challenge_type === 'quiz') {
            const { data: quizData } = await supabase
                .from('challenge_quizzes')
                .select('*')
                .eq('challenge_id', id)
                .order('display_order', { ascending: true });

            quizzes = quizData || [];
        }

        // 룰렛 설정 조회 (출석체크 챌린지인 경우)
        let rouletteSettings = null;
        let todaySpun = false;
        if (challenge.challenge_type === 'attendance') {
            const { data: rouletteData } = await supabase
                .from('roulette_settings')
                .select('*')
                .eq('challenge_id', id)
                .single();

            rouletteSettings = rouletteData;

            // 오늘 룰렛 돌렸는지 확인
            if (userId && participation) {
                const today = new Date().toISOString().split('T')[0];
                const { data: spinData } = await supabase
                    .from('roulette_spins')
                    .select('*')
                    .eq('challenge_id', id)
                    .eq('user_id', userId)
                    .eq('spin_date', today)
                    .single();

                todaySpun = !!spinData;
            }
        }

        // 상태 계산
        const status = getChallengeStatus(challenge, participation);
        const statusTag = getStatusTag(status);

        // D-day 계산
        let dday = null;
        if (participation && participation.end_date) {
            const end = new Date(participation.end_date);
            const now = new Date();
            dday = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        // 남은 인증일 계산
        let remainingDays = null;
        if (participation) {
            const completedDays = stamps.filter(s => s.is_achieved).length;
            remainingDays = challenge.challenge_duration_days - completedDays;
        }

        return NextResponse.json({
            challenge: {
                ...challenge,
                status,
                statusTag,
            },
            participation,
            stamps,
            todayVerifications,
            quizzes,
            rouletteSettings,
            todaySpun,
            dday,
            remainingDays,
            completedDays: stamps.filter(s => s.is_achieved).length,
        });

    } catch (error) {
        console.error('챌린지 상세 API 에러:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
}

