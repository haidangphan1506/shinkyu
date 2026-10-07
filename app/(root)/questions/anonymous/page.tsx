import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '匿名ボックス',
  description: 'Shinkyu の匿名質問ボックス。',
};

const AnonymousQuestionsPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        匿名ボックス
      </h1>
    </div>
  );
};

export default AnonymousQuestionsPage;
