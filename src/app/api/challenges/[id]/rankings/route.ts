import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const supabase = await createClient();
    
    // 현재 사용자 정보
    const { data: { user } } = await supabase.auth.getUser();
    
    // 랭킹 조회 (달성률 순, 동률 시 완료 시간 순)
    const { data: rankings, error } = await supabase
      .from('challenge_rankings')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        )
      `)
      .eq('challenge_id', challengeId)
      .order('achievement_rate', { ascending: false })
      .order('completed_at', { ascending: true, nullsFirst: false });
    
    if (error) {
      console.error('랭킹 조회 에러:', error);
      return NextResponse.json({ error: '랭킹을 불러오는데 실패했습니다.' }, { status: 500 });
    }
    
    // 순위 부여 (동일 달성률은 같은 순위)
    let currentRank = 0;
    let previousRate: number | null = null;
    
    const rankedList = rankings?.map((ranking, index) => {
      if (ranking.achievement_rate !== previousRate) {
        currentRank = index + 1;
        previousRate = ranking.achievement_rate;
      }
      
      // 사용자 이름 마스킹 (이름 첫글자 + ****)
      const userName = ranking.users?.name || ranking.users?.email?.split('@')[0] || '익명';
      const maskedName = userName.length > 1 
        ? userName[0] + '****' 
        : userName + '****';
      
      return {
        ...ranking,
        rank: currentRank,
        maskedName,
        isCurrentUser: user?.id === ranking.user_id,
      };
    }) || [];
    
    // 총 참여자 수
    const totalParticipants = rankedList.length;
    
    // 30명 이상인 경우: 1~5등 + 현재 사용자 위아래 3명
    let displayRankings = rankedList;
    let myRanking = null;
    
    if (user && totalParticipants >= 30) {
      const myIndex = rankedList.findIndex(r => r.user_id === user.id);
      
      if (myIndex !== -1) {
        myRanking = rankedList[myIndex];
        
        // 1~5등
        const topFive = rankedList.slice(0, 5);
        
        // 내 위아래 3명씩
        const startIndex = Math.max(0, myIndex - 3);
        const endIndex = Math.min(rankedList.length, myIndex + 4);
        const aroundMe = rankedList.slice(startIndex, endIndex);
        
        // 중복 제거하며 합치기
        const combined = [...topFive];
        aroundMe.forEach(ranking => {
          if (!combined.find(r => r.id === ranking.id)) {
            combined.push(ranking);
          }
        });
        
        // 순위순 정렬
        displayRankings = combined.sort((a, b) => a.rank - b.rank);
      } else {
        // 현재 사용자가 참여하지 않은 경우 1~10등만
        displayRankings = rankedList.slice(0, 10);
      }
    } else if (totalParticipants > 10) {
      // 10명 이상 30명 미만: 10명만 표시
      displayRankings = rankedList.slice(0, 10);
      if (user) {
        myRanking = rankedList.find(r => r.user_id === user.id) || null;
      }
    }
    
    return NextResponse.json({
      rankings: displayRankings,
      myRanking,
      totalParticipants,
    });
    
  } catch (error) {
    console.error('랭킹 API 에러:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

