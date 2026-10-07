import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '承認待ち',
  description: 'Shinkyu の承認待ちメンバー。',
};

const PendingMembersPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        承認待ち
      </h1>
    </div>
  );
};

export default PendingMembersPage;
