# AI Canvas

An AI-powered course management platform where professors upload materials and manage courses through AI chat, and students access everything via magic links.

## Features

- **Magic Link Authentication**: No passwords needed - secure email-based login
- **Professor Tools**:
  - Upload syllabus PDFs
  - Bulk import student email lists
  - AI assistant for course management
- **Student Experience**:
  - View course materials
  - Chat with AI about course content
  - Access via simple magic links
- **AI-Powered Chat**: Claude Opus 4.5 powered course assistant

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **Database**: SQLite with better-sqlite3
- **AI**: Anthropic Claude API (Opus 4.5)
- **Authentication**: Magic links via nodemailer
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 20+
- Anthropic API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Development Mode

In development, magic links are printed to the console instead of being emailed.

## Deployment

### Railway

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login and initialize:
   ```bash
   railway login
   railway init
   ```

3. Add environment variables:
   ```bash
   railway variables set ANTHROPIC_API_KEY=your_key
   railway variables set NEXT_PUBLIC_BASE_URL=https://your-app.railway.app
   ```

4. Deploy:
   ```bash
   railway up
   ```

## Usage

### For Professors

1. Visit the site and enter your email (select "Professor")
2. Click the magic link sent to your email
3. Create a new course:
   - Upload syllabus PDF
   - Add student email addresses (comma-separated)
4. Chat with the AI to manage your course

### For Students

1. Wait for your professor to add you to a course
2. Check your email for the magic link
3. Access course materials and chat with the AI assistant

## Database Schema

- **users**: User accounts (professors and students)
- **courses**: Course information
- **course_enrollments**: Student-course relationships
- **materials**: Course materials and files
- **magic_links**: Authentication tokens
- **chat_messages**: AI chat history

## License

MIT
