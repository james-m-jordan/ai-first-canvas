import { nanoid } from 'nanoid';
import db from './db';
import nodemailer from 'nodemailer';

export function createMagicLink(userId: string): string {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const stmt = db.prepare(`
    INSERT INTO magic_links (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `);
  stmt.run(token, userId, expiresAt.toISOString());

  return token;
}

export function verifyMagicLink(token: string): { userId: string } | null {
  const stmt = db.prepare(`
    SELECT user_id, expires_at, used
    FROM magic_links
    WHERE token = ?
  `);

  const link = stmt.get(token) as { user_id: string; expires_at: string; used: number } | undefined;

  if (!link || link.used || new Date(link.expires_at) < new Date()) {
    return null;
  }

  // Mark as used
  const updateStmt = db.prepare(`
    UPDATE magic_links
    SET used = 1
    WHERE token = ?
  `);
  updateStmt.run(token);

  return { userId: link.user_id };
}

export async function sendMagicLink(email: string, token: string): Promise<{ success: boolean; devLink?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

  // If SMTP not configured, log and return the link for dev mode
  if (!process.env.SMTP_HOST) {
    console.log('\n🔗 Magic Link for', email);
    console.log(magicLink);
    console.log('\n');
    return { success: true, devLink: magicLink };
  }

  // Send email via SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your AI Canvas Login Link',
    html: `
      <h2>Click to login to AI Canvas</h2>
      <p><a href="${magicLink}">Login now</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
  return { success: true };
}

export function getUserById(userId: string) {
  const stmt = db.prepare(`
    SELECT id, email, role, name
    FROM users
    WHERE id = ?
  `);
  return stmt.get(userId) as { id: string; email: string; role: string; name: string | null } | undefined;
}

export function getUserByEmail(email: string) {
  const stmt = db.prepare(`
    SELECT id, email, role, name
    FROM users
    WHERE email = ?
  `);
  return stmt.get(email) as { id: string; email: string; role: string; name: string | null } | undefined;
}

export function createUser(email: string, role: 'professor' | 'student', name?: string) {
  const id = nanoid();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, role, name)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, email, role, name || null);
  return id;
}
