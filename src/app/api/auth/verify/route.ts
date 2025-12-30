import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  const result = verifyMagicLink(token);

  if (!result) {
    return NextResponse.redirect(new URL('/?error=invalid_or_expired', request.url));
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set('session', result.userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
