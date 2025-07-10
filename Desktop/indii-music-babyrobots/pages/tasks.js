import { useState, useEffect } from 'react';
import Head from 'next/head';
import TaskManager from '../src/components/TaskManager';

export default function TasksPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user for demo purposes - in real app this would come from auth
  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser({
        id: 'demo-user-1',
        name: 'Demo Artist',
        role: 'artist',
        email: 'demo@indii.music'
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access task management.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Task Management - indii.music</title>
        <meta name="description" content="Manage your music career tasks efficiently" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">indii.music</h1>
                <span className="ml-4 text-sm text-gray-500">Task Management</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user.name}</span>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <a
                href="/"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/tasks"
                className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 text-sm font-medium"
              >
                Tasks
              </a>
              <a
                href="/releases"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm font-medium"
              >
                Releases
              </a>
              <a
                href="/analytics"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm font-medium"
              >
                Analytics
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <TaskManager 
            userId={user.id} 
            userRole={user.role}
          />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              © 2025 indii.music - Empowering independent artists
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
