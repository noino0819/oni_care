"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-[calc(100%-32px)] w-full",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-2xl ${sizeClasses[size]} w-full mx-4 animate-slide-up`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-auto"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// 확인/취소 버튼이 있는 팝업
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  showCancel?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  showCancel = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-[300px] w-full mx-4 animate-slide-up overflow-hidden">
        {/* Content */}
        <div className="px-6 py-8 text-center">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {title}
            </h3>
          )}
          <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Buttons */}
        {showCancel ? (
          <div className="flex border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 text-gray-600 font-medium hover:bg-gray-50 transition-colors border-r border-gray-200"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
              }}
              className="flex-1 py-3.5 text-gray-900 font-medium hover:bg-gray-50 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                onConfirm();
              }}
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 하단에서 올라오는 바텀시트 모달
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl w-full max-h-[85vh] animate-slide-up">
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-auto"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-8 overflow-y-auto max-h-[calc(85vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// 스크롤 피커 모달
interface WheelPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: { value: string | number; label: string }[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
  unit?: string;
}

export function WheelPickerModal({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  unit = "",
}: WheelPickerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 44;
  
  // 내부에서 임시 값 관리 (스크롤 중에는 API 호출 안함)
  const [tempValue, setTempValue] = useState<string | number>(selectedValue);

  // 모달이 열릴 때 selectedValue로 tempValue 초기화
  useEffect(() => {
    if (isOpen) {
      setTempValue(selectedValue);
    }
  }, [isOpen, selectedValue]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const selectedIndex = options.findIndex(
        (opt) => opt.value === tempValue
      );
      if (selectedIndex >= 0) {
        containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
      }
    }
  }, [isOpen, tempValue, options]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      if (options[clampedIndex]) {
        // 스크롤 중에는 임시 값만 업데이트 (API 호출 안함)
        setTempValue(options[clampedIndex].value);
      }
    }
  };

  const handleConfirm = () => {
    // 완료 버튼 클릭 시에만 onSelect 호출 (API 호출)
    onSelect(tempValue);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl w-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Picker */}
        <div className="relative h-[220px] overflow-hidden">
          {/* Selection indicator - 배경만 표시 */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[44px] bg-gray-100 border-y border-gray-200 pointer-events-none" />

          {/* Options - 텍스트가 위에 보이도록 z-index 설정 */}
          <div
            ref={containerRef}
            className="relative z-10 h-full overflow-y-scroll scrollbar-hide py-[88px]"
            onScroll={handleScroll}
            style={{
              scrollSnapType: "y mandatory",
            }}
          >
            {options.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                className={`h-[44px] flex items-center justify-center text-lg transition-all ${
                  option.value === tempValue
                    ? "text-gray-900 font-semibold"
                    : "text-gray-400"
                }`}
                style={{ scrollSnapAlign: "center" }}
              >
                {option.label} {unit}
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="p-4">
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-[#FFD54F] text-gray-900 font-semibold rounded-xl hover:bg-[#FFC107] transition-colors"
          >
            완 료
          </button>
        </div>
      </div>
    </div>
  );
}

// 다중 선택 바텀시트
interface MultiSelectBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  maxSelections?: number;
}

export function MultiSelectBottomSheet({
  isOpen,
  onClose,
  title,
  options,
  selectedValues,
  onSelect,
  maxSelections,
}: MultiSelectBottomSheetProps) {
  const toggleOption = (value: string) => {
    // 해당없음 선택 시 다른 항목 모두 해제
    if (value === "none") {
      onSelect(["none"]);
      return;
    }
    
    // 다른 항목 선택 시 해당없음 해제
    let newValues = selectedValues.filter(v => v !== "none");
    
    if (newValues.includes(value)) {
      newValues = newValues.filter((v) => v !== value);
    } else if (!maxSelections || newValues.length < maxSelections) {
      newValues = [...newValues, value];
    }
    
    onSelect(newValues);
  };

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-wrap gap-2 mb-6 pt-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleOption(option.value)}
            className={`px-4 py-2.5 rounded-full border-2 transition-all text-sm font-medium ${
              selectedValues.includes(option.value)
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 bg-[#FFD54F] text-gray-900 font-semibold rounded-xl hover:bg-[#FFC107] transition-colors"
      >
        완 료
      </button>
    </BottomSheet>
  );
}

// 단일 선택 바텀시트
interface SingleSelectBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function SingleSelectBottomSheet({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: SingleSelectBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-1 mb-6 pt-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onSelect(option.value);
            }}
            className={`w-full px-4 py-3 text-center rounded-xl transition-colors text-base ${
              selectedValue === option.value
                ? "bg-gray-100 text-gray-900 font-semibold"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 bg-[#FFD54F] text-gray-900 font-semibold rounded-xl hover:bg-[#FFC107] transition-colors"
      >
        완 료
      </button>
    </BottomSheet>
  );
}
