import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const supabase = await createClient();
    const body = await request.json();
    
    const { quizId, selectedAnswer, slot = 1 } = body;
    
    // 현재 사용자 정보
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    
    // 퀴즈 정보 조회
    const { data: quiz, error: quizError } = await supabase
      .from('challenge_quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('challenge_id', challengeId)
      .single();
    
    if (quizError || !quiz) {
      return NextResponse.json({ error: '퀴즈를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 참여 정보 조회
    const { data: participation, error: participationError } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id)
      .eq('status', 'participating')
      .single();
    
    if (participationError || !participation) {
      return NextResponse.json({ error: '참여중인 챌린지가 아닙니다.' }, { status: 400 });
    }
    
    // 오늘 퀴즈 시도 횟수 확인
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttempts } = await supabase
      .from('challenge_quiz_attempts')
      .select('*')
      .eq('participant_id', participation.id)
      .eq('quiz_id', quizId)
      .eq('attempt_date', today);
    
    // 이미 정답 맞춘 경우
    const alreadyCorrect = todayAttempts?.some(a => a.is_correct);
    if (alreadyCorrect) {
      return NextResponse.json({ error: '이미 정답을 맞춘 퀴즈입니다.' }, { status: 400 });
    }
    
    // 최대 재시도 횟수 (2회)
    const attemptCount = (todayAttempts?.length || 0) + 1;
    if (attemptCount > 2) {
      return NextResponse.json({ 
        error: '오늘 시도 횟수를 초과했습니다. 내일 다시 도전해보세요!',
        canRetry: false,
      }, { status: 400 });
    }
    
    // 정답 체크
    const correctAnswers = quiz.correct_answers as any[];
    let isCorrect = false;
    
    if (quiz.quiz_type === 'ox') {
      // OX 퀴즈
      isCorrect = correctAnswers.includes(selectedAnswer);
    } else {
      // 다지선다
      if (Array.isArray(selectedAnswer)) {
        isCorrect = selectedAnswer.every(a => correctAnswers.includes(a)) && 
                    selectedAnswer.length === correctAnswers.length;
      } else {
        isCorrect = correctAnswers.includes(selectedAnswer);
      }
    }
    
    // 퀴즈 시도 기록 저장
    await supabase
      .from('challenge_quiz_attempts')
      .insert({
        quiz_id: quizId,
        participant_id: participation.id,
        user_id: user.id,
        attempt_date: today,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        attempt_count: attemptCount,
      });
    
    // 정답인 경우 인증 처리
    if (isCorrect) {
      // 오늘 인증 횟수 확인
      const { data: todayVerifications } = await supabase
        .from('challenge_verifications')
        .select('*')
        .eq('participant_id', participation.id)
        .eq('verification_date', today);
      
      const todayCount = todayVerifications?.length || 0;
      const { data: challenge } = await supabase
        .from('challenges')
        .select('daily_verification_count')
        .eq('id', challengeId)
        .single();
      
      const dailyMax = challenge?.daily_verification_count || 1;
      
      // 일일 인증 횟수 초과하지 않은 경우에만 인증 처리
      if (todayCount < dailyMax) {
        // 인증 기록 생성
        await supabase
          .from('challenge_verifications')
          .insert({
            challenge_id: challengeId,
            participant_id: participation.id,
            user_id: user.id,
            verification_date: today,
            verification_slot: slot,
            is_verified: true,
            verification_data: { quizId, selectedAnswer, isCorrect },
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
          today_verification_count: todayCount + 1,
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
        if (todayCount + 1 >= dailyMax) {
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
      }
    }
    
    const canRetry = !isCorrect && attemptCount < 2;
    
    return NextResponse.json({
      success: true,
      isCorrect,
      correctAnswers: isCorrect ? correctAnswers : undefined,
      hint: !isCorrect ? quiz.hint : undefined,
      canRetry,
      attemptCount,
      message: isCorrect 
        ? '정답이에요!' 
        : canRetry 
          ? '오답이에요 😢 한번 더 도전해 볼까요?' 
          : '오답이에요 😢 다음 퀴즈에 도전해보세요!',
    });
    
  } catch (error) {
    console.error('퀴즈 API 에러:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

