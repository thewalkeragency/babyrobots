import Head from 'next/head';
import SimpleModernChat from '@/components/SimpleModernChat';
import AudioUploadForm from '@/components/AudioUploadForm';
import RegisterForm from '@/components/RegisterForm';
import LoginForm from '@/components/LoginForm';
import ArtistProfileForm from '@/components/ArtistProfileForm';
import FanProfileForm from '@/components/FanProfileForm';
import LicensorProfileForm from '@/components/LicensorProfileForm';
import ServiceProviderProfileForm from '@/components/ServiceProviderProfileForm';
import TrackForm from '@/components/TrackForm';
import TrackList from '@/components/TrackList';

export default function Home() {
  // For demonstration, we'll use a hardcoded userId. In a real app, this would come from authentication.
  // Setting to null initially to avoid API calls until user logs in
  const demoUserId = null;

  return (
    <div>
      <Head>
        <title>indii.music - AI-Powered Music Industry Assistant</title>
        <meta name="description" content="AI-powered music industry assistant with specialized roles for artists, fans, sync licensing, and more" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-screen">
        <SimpleModernChat />
        <AudioUploadForm />
        <RegisterForm />
        <LoginForm />
        {/* Render ArtistProfileForm for a demo user */}
        <ArtistProfileForm userId={demoUserId} />
        {/* Render FanProfileForm for a demo user */}
        <FanProfileForm userId={demoUserId} />
        {/* Render LicensorProfileForm for a demo user */}
        <LicensorProfileForm userId={demoUserId} />
        {/* Render ServiceProviderProfileForm for a demo user */}
        <ServiceProviderProfileForm userId={demoUserId} />
        {/* Render TrackForm for a demo artist */}
        <TrackForm artistId={demoUserId} />
        {/* Render TrackList for a demo artist */}
        <TrackList artistId={demoUserId} />
      </main>
    </div>
  );
}

