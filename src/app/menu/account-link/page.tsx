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
  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
    <span className="text-green-600 font-bold text-sm">G</span>
  </div>
);

const CafeteriaIcon = () => (
  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
    <span className="text-orange-600 font-bold text-sm">H</span>
  </div>
);

const OfflineIcon = () => (
  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
    <span className="text-blue-600 font-bold text-sm">O</span>
  </div>
);

export default function AccountLinkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
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
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (account: LinkedAccount) => {
    setSelectedAccount(account);
    
    if (account.is_linked) {
      // 연동 해제 확인
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

  const getLinkConfirmMessage = () => {
    if (!selectedAccount) return "";
    
    switch (selectedAccount.account_type) {
      case "greating_mall":
        return `그리팅 계정을 연동하시면
식단 정보, 식사기록 등을 연계하여
더 쉽고 편리한 헬스케어 서비스를
제공 받으실 수 있어요!

조회정보: 이름, 성별, 생년월일, 휴대폰번호

* 연동 시 1,000포인트를 지급해드려요!`;
      case "h_cafeteria":
        return `H-cafeteria 계정을 연동하시면
식단 정보, 식사기록 등을 연계하여
더 쉽고 편리한 헬스케어 서비스를
제공 받으실 수 있어요!

조회정보: 이름, 성별, 생년월일, 휴대폰번호

* 연동 시 1,000포인트를 지급해드려요!`;
      case "offline_counseling":
        return `오프라인 상담 DATA를 연동하시면
오프라인 상담 내용을 연계하여
더 쉽고 편리한 헬스케어 서비스를
제공 받으실 수 있어요!

조회정보: 이름, 생년월일, 휴대폰번호

* 연동 시 1,000포인트를 지급해드려요!`;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F85E3]" />
      </div>
    );
  }

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
          <h2 className="text-base font-semibold text-gray-900 mb-4">연동된 계정</h2>
          
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.account_type}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
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
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    account.is_linked ? "bg-[#9F85E3]" : "bg-gray-300"
                  } ${processing === account.account_type ? "opacity-50" : ""}`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
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
      <ConfirmModal
        isOpen={showLinkConfirm}
        onClose={() => setShowLinkConfirm(false)}
        onConfirm={handleLink}
        title={selectedAccount?.account_type === "greating_mall" 
          ? "그리팅 연동 안내" 
          : selectedAccount?.account_type === "h_cafeteria"
          ? "H-cafeteria 연동 안내"
          : "오프라인 상담 DATA 연동 안내"}
        message={getLinkConfirmMessage()}
        confirmText="확인"
        cancelText="취소"
        showCancel
      />

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
      <ConfirmModal
        isOpen={showLinkSuccess}
        onClose={() => setShowLinkSuccess(false)}
        onConfirm={() => setShowLinkSuccess(false)}
        message={
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p>{successMessage}</p>
          </div>
        }
        showCancel={false}
      />

      {/* 연동 실패 팝업 */}
      <ConfirmModal
        isOpen={showLinkFailure}
        onClose={() => setShowLinkFailure(false)}
        onConfirm={() => setShowLinkFailure(false)}
        message={
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p>일치하는 정보가 없어요</p>
            <p>회원정보를 다시 확인해주세요!</p>
          </div>
        }
        showCancel={false}
      />
    </div>
  );
}

