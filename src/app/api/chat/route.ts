import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/auth';
import { chatWithClaude } from '@/lib/claude';
import db from '@/lib/db';
import { z } from 'zod';

const chatSchema = z.object({
  courseId: z.string(),
  message: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserById(session.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, message } = chatSchema.parse(body);

    // Verify user has access to course
    let hasAccess = false;
    if (user.role === 'professor') {
      const stmt = db.prepare('SELECT id FROM courses WHERE id = ? AND professor_id = ?');
      hasAccess = !!stmt.get(courseId, user.id);
    } else {
      const stmt = db.prepare(`
        SELECT 1 FROM course_enrollments
        WHERE course_id = ? AND student_id = ?
      `);
      hasAccess = !!stmt.get(courseId, user.id);
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get course context
    const courseStmt = db.prepare('SELECT syllabus_path FROM courses WHERE id = ?');
    const course = courseStmt.get(courseId) as { syllabus_path: string | null } | undefined;

    const materialsStmt = db.prepare('SELECT name FROM materials WHERE course_id = ?');
    const materials = (materialsStmt.all(courseId) as { name: string }[]).map(m => m.name);

    // Chat with Claude
    const response = await chatWithClaude(courseId, user.id, message, {
      materials,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}
