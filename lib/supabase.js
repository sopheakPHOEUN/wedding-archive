import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Next.js 15 makes cookies() async, so createClient must be awaited wherever
// it is called (server components and route handlers).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          const allCookies = cookieStore.getAll()
          return allCookies
        },
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Handle cookie setting errors gracefully
            // This can happen in middleware or edge environments
          }
        },
      },
    }
  )
}