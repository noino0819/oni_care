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
