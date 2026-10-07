import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '組織管理',
  description: 'Shinkyu の組織管理。',
};

const OrganizationsPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        組織管理
      </h1>
    </div>
  );
};

export default OrganizationsPage;
