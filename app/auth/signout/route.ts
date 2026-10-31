import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function handleSignOut(request: Request) {
  const supabase = createClient();

  try {
    // Attempt local signOut with a fast timeout so slow network never hangs the user
    await Promise.race([
      supabase.auth.signOut({ scope: "local" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Signout timeout")), 1200)
      ),
    ]);
  } catch (err) {
    // Non-blocking: proceed to cookie clearing even if remote call times out
  }

  // Clear any supabase session cookies in cookieStore
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name.startsWith("sb-")) {
      cookieStore.delete(c.name);
    }
  }

  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 302 });

  // Explicitly clear cookies on outgoing response
  for (const c of allCookies) {
    if (c.name.startsWith("sb-")) {
      response.cookies.delete(c.name);
    }
  }

  return response;
}

export async function POST(request: Request) {
  return handleSignOut(request);
}

export async function GET(request: Request) {
  return handleSignOut(request);
}
