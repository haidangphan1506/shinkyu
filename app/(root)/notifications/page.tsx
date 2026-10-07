import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'お知らせ',
  description: 'Shinkyu のお知らせ。',
};

const NotificationsPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        お知らせ
      </h1>
    </div>
  );
};

export default NotificationsPage;
