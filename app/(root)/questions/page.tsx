import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '質問一覧',
  description: 'Shinkyu の質問一覧。',
};

const QuestionsPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        質問一覧
      </h1>
    </div>
  );
};

export default QuestionsPage;
