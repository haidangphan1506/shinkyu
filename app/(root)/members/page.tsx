import type { Metadata } from 'next';
import { HomeDashboard } from '@/components/dashboard';

export const metadata: Metadata = {
  title: 'メンバー一覧',
  description: 'Shinkyu のメンバー一覧。',
};

const MembersPage = () => {
  return <HomeDashboard />;
};

export default MembersPage;
