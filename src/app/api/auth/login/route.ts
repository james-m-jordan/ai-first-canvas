import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, createMagicLink, sendMagicLink } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  role: z.enum(['professor', 'student']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = loginSchema.parse(body);

    // Find or create user
    let user = getUserByEmail(email);

    if (!user && role) {
      // Create new user if role is provided
      const userId = createUser(email, role);
      user = getUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please provide a role.' },
        { status: 404 }
      );
    }

    // Create and send magic link
    const token = createMagicLink(user.id);
    const result = await sendMagicLink(email, token);

    return NextResponse.json({
      success: true,
      message: result.devLink ? 'Magic link generated (dev mode)' : 'Magic link sent to your email',
      devLink: result.devLink,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
