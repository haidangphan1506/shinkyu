import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'アーカイブ',
  description: 'Shinkyu のアーカイブ済みメンバー。',
};

const ArchivedMembersPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        アーカイブ
      </h1>
    </div>
  );
};

export default ArchivedMembersPage;
