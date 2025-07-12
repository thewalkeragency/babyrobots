import Head from 'next/head';
import IndiiMusicDashboard from '@/components/Dashboard/IndiiMusicDashboard';

export default function Home() {
  // For demonstration, we'll use a hardcoded userId. In a real app, this would come from authentication.
  // Setting to null initially to avoid API calls until user logs in
  const demoUserId = null;
  const currentUser = "Demo Artist"; // Demo user name
  const userRole = "artist"; // Demo user role

  return (
    <>
      <Head>
        <title>indii.music - AI-Powered Music Industry Platform</title>
        <meta name="description" content="Professional AI-powered platform for independent artists. Post-production mastering, distribution, royalty management, and career empowerment." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="dark">
        <IndiiMusicDashboard userRole={userRole} userId={demoUserId} currentUser={currentUser} />
      </div>
    </>
  );
}

