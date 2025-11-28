"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  gender: "male" | "female" | "other" | null;
  birthDate: string | null;
  height: number | null;
  weight: number | null;
  activityLevel: string | null;
  goalWeight: number | null;
  points: number;
  createdAt: string;
}

interface UseUserReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export function useUser(): UseUserReturn {
  const { user, isAuthenticated } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 사용자 기본 정보 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      // 포인트 조회
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("total_points")
        .eq("user_id", user.id)
        .single();

      const profileData: UserProfile = {
        id: user.id,
        email: user.email || "",
        name: userData?.name || null,
        gender: userData?.gender || null,
        birthDate: userData?.birth_date || null,
        height: userData?.height || null,
        weight: userData?.weight || null,
        activityLevel: userData?.activity_level || null,
        goalWeight: userData?.goal_weight || null,
        points: pointsData?.total_points || 0,
        createdAt: userData?.created_at || user.created_at,
      };

      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("프로필을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchProfile]);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.birthDate !== undefined) updateData.birth_date = data.birthDate;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.activityLevel !== undefined) updateData.activity_level = data.activityLevel;
      if (data.goalWeight !== undefined) updateData.goal_weight = data.goalWeight;

      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // 프로필 다시 불러오기
      await fetchProfile();
    },
    [user, supabase, fetchProfile]
  );

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}

// 사용자 이름만 필요할 때
export function useUserName(): string {
  const { profile } = useUser();
  return profile?.name || "회원";
}

// 포인트만 필요할 때
export function useUserPoints(): number {
  const { profile } = useUser();
  return profile?.points || 0;
}


