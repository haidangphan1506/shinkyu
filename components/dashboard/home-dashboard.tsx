'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, EmptyState, Input, Pagination, TableData } from '@/components/ui';
import { Icon } from '@/components/shared';
import type {
  AppUser,
  MemberFormValues,
  SubscriptionStatus,
  SubscriptionStatusFilter,
  TableColumn,
} from '@/types';
import { useConfirm, useDataTable, useDisclosure, useModalTarget } from '@/hooks';
import { nextPrefixedId, toDisplayDate } from '@/utils';
import { emptyStateText } from '@/constants';
import { users } from './mock-data';

const CreateMemberDialog = dynamic(
  () => import('@/components/forms').then((module) => module.CreateMemberDialog),
  { ssr: false, loading: () => null },
);
const EditMemberDialog = dynamic(
  () => import('@/components/forms').then((module) => module.EditMemberDialog),
  { ssr: false, loading: () => null },
);
const ChangeStatusDialog = dynamic(
  () => import('@/components/forms').then((module) => module.ChangeStatusDialog),
  { ssr: false, loading: () => null },
);

export const HomeDashboard = () => {
  const [status, setStatus] = useState<SubscriptionStatusFilter>('All');
  const filters = useDisclosure();
  const createDialog = useDisclosure();
  const editModal = useModalTarget<AppUser>();
  const { confirm, confirmDialog } = useConfirm();
  const statusModal = useModalTarget<AppUser>();
  const [userList, setUserList] = useState<AppUser[]>(users);

  const table = useDataTable(userList, {
    searchFields: (user) => [user.id, user.username, user.email, user.affiliation],
    filter: (user) => status === 'All' || user.subscriptionStatus === status,
    filterDeps: [status],
  });
  const { query, setQuery, resetPage } = table;

  const activeFilterCount = Number(status !== 'All');

  function resetFilters() {
    setQuery('');
    setStatus('All');
    resetPage();
  }

  function handleCreateMember(values: MemberFormValues) {
    const newUser: AppUser = {
      id: nextPrefixedId(userList.map((user) => user.id)),
      username: values.username,
      email: values.email,
      affiliation: values.affiliation,
      trainingDays: Number(values.trainingDays) || 0,
      visionCheckDays: 0,
      checkDays: 0,
      registeredAt: toDisplayDate(values.registeredAt),
      expiresAt: values.expiresAt ? toDisplayDate(values.expiresAt) : null,
      subscriptionStatus: values.subscriptionStatus,
    };

    setUserList((current) => [newUser, ...current]);
    setQuery('');
    setStatus('All');
    resetPage();
  }

  function handleEditSubmit(values: MemberFormValues) {
    const editingUser = editModal.target;
    if (!editingUser) return;
    setUserList((current) =>
      current.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              username: values.username.trim(),
              email: values.email.trim(),
              affiliation: values.affiliation,
              trainingDays: Number(values.trainingDays) || 0,
              registeredAt: toDisplayDate(values.registeredAt),
              expiresAt: values.expiresAt ? toDisplayDate(values.expiresAt) : null,
              subscriptionStatus: values.subscriptionStatus,
              note: values.note.trim(),
            }
          : user,
      ),
    );
    editModal.close();
  }

  async function handleDelete(user: AppUser) {
    const confirmed = await confirm({
      title: 'メンバーを削除',
      message: `${user.email} を削除しますか？ この操作は元に戻せません。`,
      confirmLabel: '削除',
      cancelLabel: 'キャンセル',
      tone: 'danger',
    });
    if (!confirmed) return;
    setUserList((current) => current.filter((item) => item.id !== user.id));
  }

  function handleChangeStatusConfirm(userId: string, newStatus: SubscriptionStatus) {
    setUserList((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, subscriptionStatus: newStatus } : user,
      ),
    );
    statusModal.close();
  }

  const userColumns: TableColumn<AppUser>[] = [
    {
      key: 'username',
      header: 'ユーザー名',
      width: 160,
      fixed: true,
      className: 'font-medium text-zinc-900',
    },
    {
      key: 'email',
      header: 'メールアドレス',
      width: 240,
      fixed: true,
      className: 'text-zinc-700',
    },
    {
      key: 'affiliation',
      header: '所属',
      width: 140,
      className: 'text-zinc-700',
    },
    {
      key: 'trainingDays',
      header: (
        <span>
          トレーニング
          <br />
          (日数)
        </span>
      ),
      align: 'center',
      headerClassName: 'text-center',
      width: 130,
      className: 'font-semibold text-sky-700',
    },
    {
      key: 'visionCheckDays',
      header: (
        <span>
          視力確認
          <br />
          (日数)
        </span>
      ),
      align: 'center',
      headerClassName: 'text-center',
      width: 130,
      className: 'font-semibold text-sky-700',
    },
    {
      key: 'checkDays',
      header: (
        <span>
          チェック
          <br />
          (日数)
        </span>
      ),
      align: 'center',
      headerClassName: 'text-center',
      width: 130,
      className: 'font-semibold text-sky-700',
    },
    {
      key: 'registeredAt',
      header: '登録日',
      width: 110,
      className: 'text-zinc-700',
    },
    {
      key: 'expiresAt',
      header: '有効期限',
      width: 110,
      className: 'text-zinc-700',
      render: (user) => user.expiresAt ?? '-',
    },
    {
      key: 'subscriptionStatus',
      header: 'サブスク状態',
      width: 120,
      className: 'text-zinc-700',
    },
    {
      key: 'actions',
      header: '操作',
      align: 'center',
      headerClassName: 'text-center',
      width: 130,
      render: (user) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editModal.open(user)}
            aria-label={`${user.username} を編集`}
            className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Icon name="edit" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => statusModal.open(user)}
            aria-label={`${user.username} のステータス変更`}
            className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Icon name="toggleRight" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(user)}
            aria-label={`${user.username} を削除`}
            className="text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-100 dark:hover:bg-red-950"
          >
            <Icon name="trash" className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="w-full flex flex-col gap-3 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between dark:border-zinc-800 px-0!">
        <div className="relative w-full lg:max-w-sm">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <Input
            aria-label="Search users"
            placeholder="ユーザー名・メールアドレス・所属で検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full flex justify-end items-center gap-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant={filters.isOpen ? 'secondary' : 'outline'}
              size="md"
              onClick={filters.toggle}
            >
              <Icon name="filter" className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>

            {query || activeFilterCount > 0 ? (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-zinc-500">
                <Icon name="refresh" className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => window.print()} className="w-full sm:w-auto">
            <Icon name="download" className="h-4 w-4" />
            Export report
          </Button>
          <Button onClick={() => createDialog.open()} className="w-full sm:w-auto">
            <Icon name="plus" className="h-4 w-4" />
            新規作成
          </Button>
        </div>
      </div>

      <section id="users" className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <TableData
          columns={userColumns}
          data={table.pagedItems}
          rowKey="id"
          className="rounded-none rounded-t-2xl border-x-0 border-b-0 border-t-0"
          tableClassName="min-w-225"
          rowClassName="bg-white"
          emptyText={
            <EmptyState
              icon={<Icon name="search" className="h-5 w-5" />}
              title={emptyStateText.title}
              description={emptyStateText.descriptionNotFound}
              className="py-10"
            />
          }
        />
        <div className="border-t border-sky-200 px-4 py-3 sm:px-6">
          <Pagination
            total={table.total}
            page={table.page}
            pageSize={table.pageSize}
            onPageChange={table.onPageChange}
          />
        </div>
      </section>

      {createDialog.isOpen ? (
        <CreateMemberDialog open onClose={createDialog.close} onSubmit={handleCreateMember} />
      ) : null}
      {editModal.isOpen ? (
        <EditMemberDialog
          open
          onClose={editModal.close}
          onSubmit={handleEditSubmit}
          initialValues={editModal.target ?? undefined}
        />
      ) : null}
      {confirmDialog}
      {statusModal.isOpen ? (
        <ChangeStatusDialog
          open
          onClose={statusModal.close}
          onConfirm={handleChangeStatusConfirm}
          user={statusModal.target}
        />
      ) : null}
    </div>
  );
};

export default HomeDashboard;
