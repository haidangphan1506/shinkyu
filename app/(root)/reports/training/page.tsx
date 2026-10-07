import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'トレーニングレポート',
  description: 'Shinkyu のトレーニングレポート。',
};

const TrainingReportPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        トレーニング
      </h1>
    </div>
  );
};

export default TrainingReportPage;
