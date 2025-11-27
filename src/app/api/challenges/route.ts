import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 챌린지 상태 계산 함수
function getChallengeStatus(challenge: any, participation: any | null): string {
  const now = new Date();
  
  // 참여중인 경우
  if (participation && participation.status === 'participating') {
    if (participation.achievement_rate >= 100) {
      return 'completed';
    }
    if (participation.end_date && new Date(participation.end_date) < now) {
      return 'expired';
    }
    return 'participating';
  }
  
  // 운영 종료
  if (challenge.operation_end_date && new Date(challenge.operation_end_date) < now) {
    return 'ended';
  }
  
  // 모집 전
  if (challenge.recruitment_start_date && new Date(challenge.recruitment_start_date) > now) {
    return 'before_recruitment';
  }
  
  // 모집 완료
  if (challenge.recruitment_end_date && new Date(challenge.recruitment_end_date) < now) {
    return 'recruitment_closed';
  }
  
  if (challenge.max_participants && challenge.current_participants >= challenge.max_participants) {
    return 'recruitment_closed';
  }
  
  // 모집중
  return 'recruiting';
}

// 상태에 따른 태그 텍스트
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

// D-day 계산
function calculateDday(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const filter = searchParams.get('filter') || 'all'; // all, participating, before_recruitment, recruiting, recruitment_closed, ended
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // 현재 사용자 정보
    const { data: { user } } = await supabase.auth.getUser();
    
    // 챌린지 목록 조회
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    const { data: challenges, error } = await query.range(offset, offset + limit - 1);
    
    if (error) {
      console.error('챌린지 목록 조회 에러:', error);
      return NextResponse.json({ error: '챌린지 목록을 불러오는데 실패했습니다.' }, { status: 500 });
    }
    
    // 사용자 참여 정보 조회
    let participations: any[] = [];
    if (user) {
      const { data: userParticipations } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', user.id);
      
      participations = userParticipations || [];
    }
    
    // 챌린지에 상태 정보 추가
    const challengesWithStatus = challenges?.map(challenge => {
      const participation = participations.find(p => p.challenge_id === challenge.id);
      const status = getChallengeStatus(challenge, participation);
      const statusTag = getStatusTag(status);
      
      // D-day 계산
      let dday = null;
      if (participation && participation.end_date) {
        dday = calculateDday(participation.end_date);
      } else if (challenge.operation_end_date) {
        dday = calculateDday(challenge.operation_end_date);
      }
      
      return {
        ...challenge,
        status,
        statusTag,
        participation,
        dday,
        achievementRate: participation?.achievement_rate || 0,
      };
    }) || [];
    
    // 필터 적용
    let filteredChallenges = challengesWithStatus;
    
    switch (filter) {
      case 'participating':
        filteredChallenges = challengesWithStatus.filter(c => c.status === 'participating');
        break;
      case 'before_recruitment':
        filteredChallenges = challengesWithStatus.filter(c => c.status === 'before_recruitment');
        break;
      case 'recruiting':
        filteredChallenges = challengesWithStatus.filter(c => c.status === 'recruiting');
        break;
      case 'recruitment_closed':
        filteredChallenges = challengesWithStatus.filter(c => c.status === 'recruitment_closed');
        break;
      case 'ended':
        filteredChallenges = challengesWithStatus.filter(c => ['ended', 'completed', 'expired'].includes(c.status));
        break;
    }
    
    // 정렬: 참여중 챌린지는 인증률 역순 (인증 안된게 상단), 나머지는 등록일 역순
    filteredChallenges.sort((a, b) => {
      // 참여중인 챌린지 먼저
      if (a.status === 'participating' && b.status !== 'participating') return -1;
      if (a.status !== 'participating' && b.status === 'participating') return 1;
      
      // 참여중인 챌린지끼리는 오늘 인증률이 낮은 것 먼저
      if (a.status === 'participating' && b.status === 'participating') {
        const aToday = a.participation?.today_verification_count || 0;
        const bToday = b.participation?.today_verification_count || 0;
        const aDailyMax = a.daily_verification_count || 1;
        const bDailyMax = b.daily_verification_count || 1;
        
        const aRate = aToday / aDailyMax;
        const bRate = bToday / bDailyMax;
        
        return aRate - bRate; // 인증률이 낮은 것 먼저
      }
      
      // 나머지는 생성일 역순
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    // 참여중 챌린지와 기본형 챌린지 분리
    const participatingChallenges = filteredChallenges.filter(c => c.status === 'participating');
    const otherChallenges = filteredChallenges.filter(c => c.status !== 'participating');
    
    return NextResponse.json({
      challenges: filteredChallenges,
      participatingChallenges,
      otherChallenges,
      pagination: {
        page,
        limit,
        total: filteredChallenges.length,
      }
    });
    
  } catch (error) {
    console.error('챌린지 API 에러:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

