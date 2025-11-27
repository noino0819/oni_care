export interface User {
    id: string;
    email: string;
    name?: string;
    gender?: 'male' | 'female' | 'other';
    birth_date?: string;
    height?: number;
    weight?: number;
    activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    weekly_goal?: string;
    goal_weight?: number;
    created_at: string;
    updated_at: string;
}

export interface Meal {
    id: string;
    user_id: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food_name: string;
    calories?: number;
    carbs?: number;
    protein?: number;
    fat?: number;
    serving_size?: string;
    meal_date: string;
    created_at: string;
}

export interface NutritionLog {
    id: string;
    user_id: string;
    log_date: string;
    total_calories: number;
    total_carbs: number;
    total_protein: number;
    total_fat: number;
    created_at: string;
    updated_at: string;
}

// ============================================
// 컨텐츠 관련 타입
// ============================================

export type CategoryType = 'interest' | 'disease' | 'exercise';

export interface ContentCategory {
    id: number;
    category_type: CategoryType;
    category_name: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    subcategories?: ContentSubcategory[];
}

export interface ContentSubcategory {
    id: number;
    category_id: number;
    subcategory_name: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export type CardStyle = 'A' | 'B';
export type MediaType = 'image' | 'video';

export interface Content {
    id: string;
    category_id: number;
    subcategory_id?: number;
    title: string;
    thumbnail_url?: string;
    background_color?: string;
    card_style: CardStyle;
    is_published: boolean;
    published_at?: string;
    view_count: number;
    like_count: number;
    created_at: string;
    updated_at: string;
    category?: ContentCategory;
    subcategory?: ContentSubcategory;
    media?: ContentMedia[];
}

export interface ContentMedia {
    id: string;
    content_id: string;
    media_type: MediaType;
    media_url: string;
    display_order: number;
    alt_text?: string;
    created_at: string;
}

export interface ContentLike {
    id: string;
    content_id: string;
    user_id: string;
    created_at: string;
}

export interface ContentReview {
    id: string;
    content_id: string;
    user_id: string;
    rating: number;
    review_text?: string;
    created_at: string;
}

export interface ContentReadHistory {
    id: string;
    content_id: string;
    user_id: string;
    read_at: string;
}

// API 응답 타입
export interface ContentCard {
    id: string;
    category: string;
    subCategory?: string;
    title: string;
    thumbnailUrl?: string;
    backgroundColor?: string;
    cardStyle: CardStyle;
    isLiked: boolean;
    createdAt: string;
}

export interface ContentDetail {
    id: string;
    title: string;
    category: {
        id: number;
        name: string;
        type: CategoryType;
    };
    subcategory?: {
        id: number;
        name: string;
    };
    media: ContentMedia[];
    userRating?: number;
    isLiked: boolean;
    isRead: boolean;
}

export interface CategoriesResponse {
    interest: ContentCategory[];
    disease: ContentCategory[];
    exercise: ContentCategory[];
}
