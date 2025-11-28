// 공지사항 타입
export interface Notice {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 알림 타입
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  icon_url?: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

// FAQ 카테고리 타입
export interface FAQCategory {
  id: number;
  name: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
}

// FAQ 타입
export interface FAQ {
  id: string;
  category_id: number;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
}

// 문의 유형 타입
export interface InquiryType {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

// 1:1 문의 타입
export interface Inquiry {
  id: string;
  user_id: string;
  inquiry_type_id?: number;
  inquiry_type?: InquiryType;
  content: string;
  answer?: string;
  status: 'pending' | 'answered';
  created_at: string;
  answered_at?: string;
  updated_at: string;
}


