"use client";

import { useRouter } from "next/navigation";

export default function WithdrawCompletePage() {
  const router = useRouter();

  const handleConfirm = () => {
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-gray-100">
        <div className="flex items-center justify-center px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">회원탈퇴</h1>
        </div>
      </header>

      {/* 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            회원탈퇴가 완료되었습니다.
          </h2>
          
          <div className="text-gray-600 text-sm leading-relaxed">
            <p>고객님의 정보는 모두 정상적으로 파기되었습니다.</p>
            <p className="mt-2">고객님이 남겨주신 의견을 바탕으로</p>
            <p>더욱 좋은 서비스를 제공하고자 노력하겠습니다.</p>
            <p className="mt-2">그리팅 케어를 이용해 주셔서 감사합니다.</p>
          </div>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="p-4">
        <button
          onClick={handleConfirm}
          className="w-full py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}


