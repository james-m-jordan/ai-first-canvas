import Anthropic from '@anthropic-ai/sdk';
import db from './db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function chatWithClaude(
  courseId: string,
  userId: string,
  userMessage: string,
  context: { syllabus?: string; materials?: string[] }
) {
  // Get conversation history
  const historyStmt = db.prepare(`
    SELECT role, content
    FROM chat_messages
    WHERE course_id = ? AND user_id = ?
    ORDER BY created_at ASC
    LIMIT 20
  `);
  const history = historyStmt.all(courseId, userId) as { role: string; content: string }[];

  // Build system prompt with course context
  let systemPrompt = `You are an AI teaching assistant for a course. Help students and professors with course-related questions.`;

  if (context.syllabus) {
    systemPrompt += `\n\nCourse Syllabus:\n${context.syllabus}`;
  }

  if (context.materials && context.materials.length > 0) {
    systemPrompt += `\n\nCourse Materials:\n${context.materials.join('\n')}`;
  }

  // Build messages array
  const messages: Anthropic.MessageParam[] = [
    ...history.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: userMessage },
  ];

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  const assistantMessage = response.content[0].type === 'text'
    ? response.content[0].text
    : 'I apologize, but I could not generate a response.';

  // Save messages to database
  const saveStmt = db.prepare(`
    INSERT INTO chat_messages (id, course_id, user_id, role, content)
    VALUES (?, ?, ?, ?, ?)
  `);

  const { nanoid } = await import('nanoid');
  saveStmt.run(nanoid(), courseId, userId, 'user', userMessage);
  saveStmt.run(nanoid(), courseId, userId, 'assistant', assistantMessage);

  return assistantMessage;
}
