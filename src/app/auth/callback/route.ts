import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = createClient();
        const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError || !user) {
            console.error("Session exchange error:", sessionError);
            return NextResponse.redirect(`${requestUrl.origin}/`);
        }

        // Check if user exists in public.users table
        const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();

        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error("User check error:", userError);
        }

        if (existingUser) {
            // User exists, redirect to home
            return NextResponse.redirect(`${requestUrl.origin}/home`);
        } else {
            // New user, redirect to signup terms
            return NextResponse.redirect(`${requestUrl.origin}/signup/terms`);
        }
    }

    // No code, redirect to landing
    return NextResponse.redirect(`${requestUrl.origin}/`);
}
