'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  name: string;
  created_at: string;
}

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setShowCreateForm(false);
        router.push(`/course/${data.courseId}`);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            + New Course
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Create New Course
              </h2>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Introduction to AI"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Syllabus (PDF)
                  </label>
                  <input
                    type="file"
                    name="syllabus"
                    accept=".pdf"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Student Emails (comma-separated)
                  </label>
                  <textarea
                    name="studentEmails"
                    required
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="student1@example.com, student2@example.com"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                  >
                    Create Course
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses yet. Create your first course to get started!
            </div>
          ) : (
            courses.map((course) => (
              <button
                key={course.id}
                onClick={() => router.push(`/course/${course.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition text-left"
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created {new Date(course.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
