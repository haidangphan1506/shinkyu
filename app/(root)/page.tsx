import type { Metadata } from 'next';
import { HomeDashboard } from '@/components/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Monitor orders, customers, and workspace performance.',
};

export const HomePage = () => {
  return <HomeDashboard />;
};

export default HomePage;
