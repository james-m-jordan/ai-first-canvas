import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById, createUser } from '@/lib/auth';
import db from '@/lib/db';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const createCourseSchema = z.object({
  name: z.string(),
  studentEmails: z.array(z.string().email()),
  syllabus: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = getUserById(session.value);
    if (!user || user.role !== 'professor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const studentEmailsStr = formData.get('studentEmails') as string;
    const syllabusFile = formData.get('syllabus') as File | null;

    const studentEmails = studentEmailsStr.split(',').map(e => e.trim()).filter(Boolean);

    // Create course
    const courseId = nanoid();
    let syllabusPath: string | null = null;

    // Save syllabus if provided
    if (syllabusFile) {
      const uploadsDir = path.join(process.cwd(), 'uploads', courseId);
      await mkdir(uploadsDir, { recursive: true });

      const buffer = Buffer.from(await syllabusFile.arrayBuffer());
      syllabusPath = path.join(uploadsDir, 'syllabus.pdf');
      await writeFile(syllabusPath, buffer);
    }

    const courseStmt = db.prepare(`
      INSERT INTO courses (id, name, professor_id, syllabus_path)
      VALUES (?, ?, ?, ?)
    `);
    courseStmt.run(courseId, name, user.id, syllabusPath);

    // Create/enroll students
    const enrollStmt = db.prepare(`
      INSERT INTO course_enrollments (course_id, student_id)
      VALUES (?, ?)
    `);

    for (const email of studentEmails) {
      let student = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;

      if (!student) {
        const studentId = createUser(email, 'student');
        student = { id: studentId };
      }

      enrollStmt.run(courseId, student.id);
    }

    return NextResponse.json({ success: true, courseId });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    let courses;
    if (user.role === 'professor') {
      const stmt = db.prepare(`
        SELECT id, name, created_at
        FROM courses
        WHERE professor_id = ?
        ORDER BY created_at DESC
      `);
      courses = stmt.all(user.id);
    } else {
      const stmt = db.prepare(`
        SELECT c.id, c.name, c.created_at
        FROM courses c
        JOIN course_enrollments e ON c.id = e.course_id
        WHERE e.student_id = ?
        ORDER BY c.created_at DESC
      `);
      courses = stmt.all(user.id);
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Failed to get courses' },
      { status: 500 }
    );
  }
}
