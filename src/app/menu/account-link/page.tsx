"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ConfirmModal } from "@/components/ui/Modal";

interface LinkedAccount {
  account_type: string;
  name: string;
  icon: string;
  is_linked: boolean;
  account_id: string | null;
}

// 아이콘 컴포넌트들
const GreatingIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
    <span className="text-white font-bold text-lg">🥗</span>
  </div>
);

const CafeteriaIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
    <span className="text-white font-bold text-lg">🍽️</span>
  </div>
);

const OfflineIcon = () => (
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
    <span className="text-white font-bold text-lg">💬</span>
  </div>
);

export default function AccountLinkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([
    { account_type: "greating_mall", name: "그리팅몰", icon: "greating", is_linked: true, account_id: "gr12*****" },
    { account_type: "h_cafeteria", name: "H-cafeteria", icon: "cafeteria", is_linked: true, account_id: "cafe12****" },
    { account_type: "offline_counseling", name: "오프라인 상담", icon: "counseling", is_linked: false, account_id: null },
  ]);
  const [processing, setProcessing] = useState<string | null>(null);

  // 팝업 상태
  const [showLinkConfirm, setShowLinkConfirm] = useState(false);
  const [showBusinessMismatch, setShowBusinessMismatch] = useState(false);
  const [showLinkSuccess, setShowLinkSuccess] = useState(false);
  const [showLinkFailure, setShowLinkFailure] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LinkedAccount | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [mismatchMessage, setMismatchMessage] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/linked-accounts");
      const data = await res.json();
      if (data.accounts && data.accounts.length > 0) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (account: LinkedAccount) => {
    setSelectedAccount(account);
    
    if (account.is_linked) {
      // 연동 해제
      handleUnlink(account);
    } else {
      // 연동 확인 팝업 표시
      setShowLinkConfirm(true);
    }
  };

  const handleLink = async () => {
    if (!selectedAccount) return;
    
    setShowLinkConfirm(false);
    setProcessing(selectedAccount.account_type);

    try {
      const res = await fetch("/api/linked-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType: selectedAccount.account_type,
          action: "link",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsChange) {
          setMismatchMessage(data.message);
          setShowBusinessMismatch(true);
        } else {
          setShowLinkFailure(true);
        }
        return;
      }

      setSuccessMessage(data.message);
      setShowLinkSuccess(true);
      fetchAccounts();
    } catch {
      setShowLinkFailure(true);
    } finally {
      setProcessing(null);
    }
  };

  const handleUnlink = async (account: LinkedAccount) => {
    setProcessing(account.account_type);

    try {
      const res = await fetch("/api/linked-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType: account.account_type,
          action: "unlink",
        }),
      });

      if (res.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error("Error unlinking account:", error);
    } finally {
      setProcessing(null);
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "greating":
        return <GreatingIcon />;
      case "cafeteria":
        return <CafeteriaIcon />;
      case "counseling":
        return <OfflineIcon />;
      default:
        return <GreatingIcon />;
    }
  };

  const getLinkConfirmContent = () => {
    if (!selectedAccount) return { title: "", message: "", info: "" };
    
    switch (selectedAccount.account_type) {
      case "greating_mall":
        return {
          title: "그리팅 연동 안내",
          message: "그리팅 계정을 연동하시면\n식단 정보, 식사기록 등을 연계하여\n더 쉽고 편리한 헬스케어 서비스를\n제공 받으실 수 있어요!",
          info: "이름, 성별, 생년월일, 휴대폰번호",
        };
      case "h_cafeteria":
        return {
          title: "H-cafeteria 연동 안내",
          message: "H-cafeteria 계정을 연동하시면\n식단 정보, 식사기록 등을 연계하여\n더 쉽고 편리한 헬스케어 서비스를\n제공 받으실 수 있어요!",
          info: "이름, 성별, 생년월일, 휴대폰번호",
        };
      case "offline_counseling":
        return {
          title: "오프라인 상담 DATA 연동 안내",
          message: "오프라인 상담 DATA를 연동하시면\n오프라인 상담 내용을 연계하여\n더 쉽고 편리한 헬스케어 서비스를\n제공 받으실 수 있어요!",
          info: "이름, 생년월일, 휴대폰번호",
        };
      default:
        return { title: "", message: "", info: "" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

  const confirmContent = getLinkConfirmContent();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">계정 연동 관리</h1>
          <div className="w-6 h-6" />
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 연동된 계정 */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">연동된 계정</h2>
          
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.account_type}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {getIcon(account.icon)}
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500">
                      {account.is_linked ? account.account_id : "-"}
                    </p>
                  </div>
                </div>
                
                {/* 토글 스위치 */}
                <button
                  onClick={() => handleToggle(account)}
                  disabled={processing === account.account_type}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    account.is_linked ? "bg-[#9F85E3]" : "bg-gray-300"
                  } ${processing === account.account_type ? "opacity-50" : ""}`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                      account.is_linked ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 연동 확인 팝업 */}
      {showLinkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLinkConfirm(false)} />
          <div className="relative bg-white rounded-2xl max-w-[320px] w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{confirmContent.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line mb-4">
                {confirmContent.message}
              </p>
              <div className="bg-gray-100 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-500 mb-1">조회정보</p>
                <p className="text-sm text-gray-900">{confirmContent.info}</p>
              </div>
              <p className="text-sm text-[#9F85E3]">* 연동 시 1,000포인트를 지급해드려요!</p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowLinkConfirm(false)}
                className="flex-1 py-3.5 text-gray-600 font-medium border-r border-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleLink}
                className="flex-1 py-3.5 text-gray-900 font-medium"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사업장 불일치 팝업 */}
      <ConfirmModal
        isOpen={showBusinessMismatch}
        onClose={() => setShowBusinessMismatch(false)}
        onConfirm={() => {
          setShowBusinessMismatch(false);
          router.push("/menu/profile-edit");
        }}
        message={mismatchMessage}
        confirmText="변경하기"
        cancelText="닫기"
        showCancel
      />

      {/* 연동 성공 팝업 */}
      {showLinkSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLinkSuccess(false)} />
          <div className="relative bg-white rounded-2xl max-w-[280px] w-full mx-4 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-gray-900 font-medium">{successMessage}</p>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowLinkSuccess(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 연동 실패 팝업 */}
      {showLinkFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLinkFailure(false)} />
          <div className="relative bg-white rounded-2xl max-w-[280px] w-full mx-4 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <p className="text-gray-900 font-medium">일치하는 정보가 없어요</p>
              <p className="text-gray-500 text-sm mt-1">회원정보를 다시 확인해주세요!</p>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowLinkFailure(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
