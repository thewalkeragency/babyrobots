import Head from 'next/head';
import Chat from '@/components/Chat';

export default function Home() {
  return (
    <div>
      <Head>
        <title>indii.music</title>
        <meta name="description" content="AI-powered music industry assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Chat />
      </main>
    </div>
  );
}

