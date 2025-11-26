import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // 세션을 새로고침하면 만료되지 않도록 합니다
    // 세션이 만료되면 사용자를 로그인 페이지로 리디렉션할 수 있습니다
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 인증이 필요한 페이지 보호 (필요시 주석 해제)
    // if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    //   const url = request.nextUrl.clone()
    //   url.pathname = '/login'
    //   return NextResponse.redirect(url)
    // }

    return supabaseResponse
}
