import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '視力チェックレポート',
  description: 'Shinkyu の視力チェックレポート。',
};

const VisionReportPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        視力チェック
      </h1>
    </div>
  );
};

export default VisionReportPage;
