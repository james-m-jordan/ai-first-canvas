'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'professor' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✓ Magic link sent! Check your email (or console in dev mode)');
      } else {
        setMessage(`✗ ${data.error}`);
      }
    } catch (error) {
      setMessage('✗ Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          AI Canvas
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Course management powered by AI
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              I am a...
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  role === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('professor')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  role === 'professor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Professor
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>

          {message && (
            <p className={`text-sm text-center ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
          No passwords needed. We'll email you a magic link to sign in.
        </p>
      </div>
    </div>
  );
}
