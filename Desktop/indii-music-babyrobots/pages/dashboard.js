import Head from 'next/head';
import { useState, useEffect } from 'react';
import IndiiMusicDashboard from '@/components/Dashboard/IndiiMusicDashboard';

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState("Demo Artist");
  const [userRole, setUserRole] = useState("artist");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate authentication check and fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.user) {
            setUserId(sessionData.user.id);
            setCurrentUser(sessionData.user.name || sessionData.user.email);
            setUserRole(sessionData.user.primaryRole || 'artist');
          }
        } else {
          // Demo mode - no authentication
          setUserId('demo-user-id');
          setCurrentUser('Demo Artist');
          setUserRole('artist');
        }
      } catch (err) {
        console.warn('Session check failed, using demo mode:', err);
        // Fallback to demo mode
        setUserId('demo-user-id');
        setCurrentUser('Demo Artist');
        setUserRole('artist');
        setError(null); // Don't show error for demo mode
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-studio-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-400 mx-auto"></div>
          <p className="text-technical-400 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-studio-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error loading dashboard</p>
          <p className="text-technical-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-electric-600 text-white rounded hover:bg-electric-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - indii.music</title>
        <meta 
          name="description" 
          content="Your comprehensive music industry dashboard - tracks, analytics, AI agents, and more." 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="dark">
        <IndiiMusicDashboard 
          userRole={userRole} 
          userId={userId} 
          currentUser={currentUser} 
        />
      </div>
    </>
  );
}
