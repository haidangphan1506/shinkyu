import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理者として登録',
  description: 'Shinkyu の管理者登録。',
};

const AdminRegistrationPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        管理者として登録
      </h1>
    </div>
  );
};

export default AdminRegistrationPage;
