import Head from 'next/head';
import SimpleModernChat from '@/components/SimpleModernChat';

export default function Home() {
  return (
    <div>
      <Head>
        <title>indii.music - AI-Powered Music Industry Assistant</title>
        <meta name="description" content="AI-powered music industry assistant with specialized roles for artists, fans, sync licensing, and more" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-screen">
        <SimpleModernChat />
      </main>
    </div>
  );
}

