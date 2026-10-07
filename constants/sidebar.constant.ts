import type { SidebarNavigationGroup } from '@/types';

export const sidebarNavigationGroups: SidebarNavigationGroup[] = [
  {
    items: [
      {
        label: 'メンバー管理',
        href: '/members',
        icon: 'users',
        subItems: [
          { label: 'メンバー一覧', href: '/members' },
          { label: '承認待ち', href: '/members/pending', badge: '12' },
          { label: 'アーカイブ', href: '/members/archived' },
        ],
      },
      {
        label: '組織管理',
        href: '/organizations',
        icon: 'grid',
      },
      {
        label: '質問管理',
        href: '/questions',
        icon: 'help',
        subItems: [
          { label: '質問一覧', href: '/questions' },
          { label: '匿名ボックス', href: '/questions/anonymous' },
        ],
      },
      {
        label: 'レポート',
        href: '/reports',
        icon: 'chart',
        subItems: [
          { label: 'トレーニング', href: '/reports/training' },
          { label: '視力チェック', href: '/reports/vision' },
        ],
      },
      {
        label: 'お知らせ',
        href: '/notifications',
        icon: 'bell',
      },
      {
        label: '管理者として登録',
        href: '/admin-registration',
        icon: 'settings',
      },
    ],
  },
];

export const sidebarText = {
  closeNavigation: 'ナビゲーションを閉じる',
  subItems: {
    open: (label: string) => `${label}のサブメニューを開く`,
    close: (label: string) => `${label}のサブメニューを閉じる`,
  },
  brand: {
    mark: 'S',
    name: 'shinkyu',
  },
  workspace: {
    mark: 'SH',
    name: 'Shinkyu Studio',
    plan: 'Proワークスペース',
  },
  promotion: {
    title: 'より多くのインサイトを開く',
    description: '高度なレポートを取得し、ワークフローを自動化します。',
    action: 'Proを詳しく見る',
  },
  user: {
    initials: 'AM',
    name: 'Alex Morgan',
    role: 'オーナー',
  },
} as const;
