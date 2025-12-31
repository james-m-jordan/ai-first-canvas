import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid_token', baseUrl));
  }

  const result = verifyMagicLink(token);

  if (!result) {
    return NextResponse.redirect(new URL('/?error=invalid_or_expired', baseUrl));
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set('session', result.userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.redirect(new URL('/dashboard', baseUrl));
}
