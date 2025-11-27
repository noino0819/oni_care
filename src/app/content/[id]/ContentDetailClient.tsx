"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CloseIcon,
  FolderIcon,
  StarIcon,
  PlayIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ContentDetail, ContentMedia } from "@/types/database";

interface ContentDetailClientProps {
  id: string;
}

// 유튜브 URL에서 비디오 ID 추출
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// 유튜브 URL인지 확인
function isYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null;
}

export default function ContentDetailClient({ id }: ContentDetailClientProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [rating, setRating] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 컨텐츠 데이터 로드
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(`/api/contents/${id}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data);
          if (data.userRating) {
            setRating(data.userRating);
          }
          // 토스트 표시 (이미 리뷰를 작성하지 않은 경우에만)
          if (!data.userRating) {
            setShowToast(true);
          }
        } else {
          router.push("/content");
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
        router.push("/content");
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [id, router]);

  // 토스트 자동 숨김
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // 스크롤 완료 감지
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const threshold = 50;
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        setIsButtonEnabled(true);
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      // 컨텐츠가 짧아서 스크롤이 필요없는 경우
      if (element.scrollHeight <= element.clientHeight) {
        setIsButtonEnabled(true);
      }
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, [content]);

  // 별점 클릭
  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
    setIsReviewModalOpen(true);
  };

  // 리뷰 제출
  const handleReviewSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/contents/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.pointsEarned > 0) {
          alert(`리뷰 작성으로 ${data.pointsEarned}P를 받았습니다!`);
        }
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
      setIsReviewModalOpen(false);
      setReviewText("");
    }
  };

  // 확인 버튼 클릭
  const handleConfirm = async () => {
    if (!isButtonEnabled) return;

    try {
      // 읽음 히스토리 저장
      await fetch(`/api/contents/${id}/read`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }

    // 리스트 페이지로 이동
    router.push("/content");
  };

  // 닫기 버튼 클릭
  const handleClose = () => {
    router.push("/content");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#9F85E3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 - 고정 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={handleClose} className="p-2 -ml-2">
            <CloseIcon size={24} className="text-gray-700" />
          </button>
          <h1 className="font-semibold text-gray-900">건강 칼럼</h1>
          <div className="w-10" /> {/* 균형을 위한 스페이서 */}
        </div>
      </header>

      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto pb-32"
      >
        {/* 제목 영역 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {content.title}
          </h2>
          {content.category && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FolderIcon size={16} />
              <span>
                {content.category.name}
                {content.subcategory && `> ${content.subcategory.name}`}
              </span>
            </div>
          )}
        </div>

        {/* 컨텐츠 미디어 (카드뉴스 형태) */}
        <div className="px-4 py-4 space-y-4">
          {content.media && content.media.length > 0 ? (
            content.media.map((media, index) => (
              <MediaItem 
                key={media.id} 
                media={media} 
                index={index}
                total={content.media.length}
              />
            ))
          ) : (
            // 미디어가 없을 때 썸네일만 표시
            content.thumbnail_url && (
              <div className="w-full">
                <img
                  src={content.thumbnail_url}
                  alt={content.title}
                  className="w-full rounded-lg"
                />
              </div>
            )
          )}
        </div>

        {/* 별점 리뷰 영역 */}
        <div className="px-4 py-6 text-center">
          <p className="text-gray-700 font-medium mb-4">
            이 컨텐츠가 도움이 되었나요?
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <StarIcon
                  size={40}
                  filled={star <= rating}
                  className={
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 확인 버튼 - 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-40">
        <button
          onClick={handleConfirm}
          disabled={!isButtonEnabled}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-lg transition-colors",
            isButtonEnabled
              ? "bg-[#9ACD32] text-white hover:bg-[#8BC34A]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          확 인
        </button>
        {/* Safe area padding */}
        <div className="pb-safe" />
      </div>

      {/* 리뷰 팝업 모달 */}
      {isReviewModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsReviewModalOpen(false)}
          />
          <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 animate-slide-up">
            <p className="text-gray-900 font-medium text-center mb-4 leading-relaxed">
              더 자세한 리뷰를 남겨주시면<br />
              다음 컨텐츠를 제작할 때 큰 도움이 돼요!
            </p>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="텍스트를 입력해주세요"
              className="w-full h-32 p-4 bg-gray-100 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9F85E3]/50"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewText("");
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                닫기
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-[#9F85E3] text-white font-medium disabled:opacity-50"
              >
                {isSubmitting ? "저장 중..." : "의견 보내기"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* 토스트 알림 - 하단 버튼 위 */}
      <div
        className={cn(
          "fixed bottom-24 left-4 right-4 z-50 transition-all duration-300 ease-out",
          showToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-gray-800 rounded-full px-5 py-3 shadow-lg flex items-center justify-center gap-2 mx-auto w-fit">
          <span className="text-yellow-400">🎁</span>
          <p className="text-white font-medium text-sm">
            리뷰를 남기면 10P를 드려요!
          </p>
        </div>
      </div>
    </div>
  );
}

// 미디어 아이템 컴포넌트
interface MediaItemProps {
  media: ContentMedia;
  index: number;
  total: number;
}

function MediaItem({ media, index, total }: MediaItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // 유튜브 영상인 경우
  if (media.media_type === "video" && isYouTubeUrl(media.media_url)) {
    const videoId = getYouTubeVideoId(media.media_url);
    return (
      <div className="relative">
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title={media.alt_text || "YouTube 영상"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        {/* 카드뉴스 인디케이터 (여러 미디어가 있을 때만) */}
        {total > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {index + 1} / {total}
          </div>
        )}
      </div>
    );
  }

  // 일반 비디오인 경우
  if (media.media_type === "video") {
    return (
      <div className="relative">
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-md">
          {isPlaying ? (
            <video
              src={media.media_url}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              {/* 비디오 썸네일 또는 플레이스홀더 */}
              <video
                src={media.media_url}
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <PlayIcon size={32} className="text-gray-800 ml-1" />
                </div>
              </button>
            </>
          )}
        </div>
        {/* 카드뉴스 인디케이터 */}
        {total > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {index + 1} / {total}
          </div>
        )}
      </div>
    );
  }

  // 이미지인 경우
  return (
    <div className="relative">
      <div className="w-full rounded-lg overflow-hidden shadow-md">
        <img
          src={media.media_url}
          alt={media.alt_text || "컨텐츠 이미지"}
          className="w-full"
        />
      </div>
      {/* 카드뉴스 인디케이터 */}
      {total > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {index + 1} / {total}
        </div>
      )}
    </div>
  );
}

