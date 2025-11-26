"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DateWheelPickerProps {
  value: string; // YYYYMMDD or YYYY-MM-DD
  onChange: (value: string) => void;
  onClose: () => void;
}

export default function DateWheelPicker({ value, onChange, onClose }: DateWheelPickerProps) {
  // Parse initial value or default to 1983-01-01 (40세, 올해 기준 2025년)
  const getInitialDate = () => {
    // 빈 값이거나 유효하지 않은 경우 1983년 1월 1일로 설정
    if (!value || value.length !== 8) {
      return new Date(1983, 0, 1);
    }
    
    try {
      const year = parseInt(value.slice(0, 4));
      const month = parseInt(value.slice(4, 6)) - 1;
      const day = parseInt(value.slice(6, 8));
      return new Date(year, month, day);
    } catch {
      return new Date(1983, 0, 1);
    }
  };
  
  const initialDate = getInitialDate();
  
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());


  const years = Array.from({ length: 100 }, (_, i) => 2025 - i); // 2025 ~ 1926 (100년 범위)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);


  const handleConfirm = () => {
    // 만 14세 미만 체크 (정확한 만 나이 계산)
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const today = new Date();
    
    // 만 나이 계산
    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();
    
    // 생일이 지나지 않았으면 나이 -1
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    // 만 14세 미만인 경우 가입 불가
    if (age < 14) {
      alert("만 14세 미만은 서비스 가입이 불가능합니다.");
      onClose();
      return;
    }
    
    const y = selectedYear.toString();
    const m = selectedMonth.toString().padStart(2, "0");
    const d = selectedDay.toString().padStart(2, "0");
    onChange(`${y}${m}${d}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">생년월일을 입력해 주세요.</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex justify-center items-center h-48 relative mb-6">
          {/* Highlight Bar */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-gray-100 rounded-lg pointer-events-none" />

          <WheelColumn 
            items={years} 
            selectedItem={selectedYear} 
            onSelect={setSelectedYear} 
            label="년"
          />
          <WheelColumn 
            items={months} 
            selectedItem={selectedMonth} 
            onSelect={setSelectedMonth} 
            label="월"
          />
          <WheelColumn 
            items={days} 
            selectedItem={selectedDay} 
            onSelect={setSelectedDay} 
            label="일"
          />
        </div>

        <button
          onClick={handleConfirm}
          className="w-full h-14 bg-gray-300 hover:bg-gray-400 text-white text-lg font-bold rounded-xl transition-colors"
        >
          다 음
        </button>
      </div>
    </div>
  );
}

function WheelColumn({ items, selectedItem, onSelect, label }: { items: number[], selectedItem: number, onSelect: (val: number) => void, label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40; // Height of each item in pixels
  const [isInitialized, setIsInitialized] = useState(false);

  // Scroll to selected item on mount
  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      const index = items.indexOf(selectedItem);
      if (index !== -1) {
        // requestAnimationFrame을 사용하여 브라우저가 다음 프레임을 렌더링한 후 스크롤
        requestAnimationFrame(() => {
          if (containerRef.current) {
            // scrollBehavior를 auto로 변경하여 즉시 스크롤
            containerRef.current.style.scrollBehavior = 'auto';
            containerRef.current.scrollTop = index * itemHeight;
            // 다시 smooth로 변경
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.style.scrollBehavior = 'smooth';
              }
            }, 50);
            setIsInitialized(true);
          }
        });
      }
    }
  }, [items, selectedItem, itemHeight, isInitialized]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      if (items[index] !== undefined && items[index] !== selectedItem) {
        onSelect(items[index]);
      }
    }
  };

  return (
    <div className="h-full flex-1 relative overflow-hidden">
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div style={{ height: itemHeight * 2 }} /> {/* Top Padding */}
        {items.map((item) => (
          <div 
            key={item} 
            className={cn(
              "h-10 flex items-center justify-center snap-center transition-colors duration-200",
              item === selectedItem ? "text-black font-bold text-xl" : "text-gray-300 text-lg"
            )}
            style={{ height: itemHeight }}
          >
            {item} <span className="text-sm ml-1 font-normal">{label}</span>
          </div>
        ))}
        <div style={{ height: itemHeight * 2 }} /> {/* Bottom Padding */}
      </div>
    </div>
  );
}
