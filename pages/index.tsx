
import Head from 'next/head';
import dynamic from 'next/dynamic';

const SelfAnalysisApp = dynamic(() => import('../src/SelfAnalysisApp'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>自己分析診断ツール</title>
      </Head>
      <main>
        <SelfAnalysisApp />
      </main>
    </>
  );
}
