'use client';

import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import type { AppUser, SubscriptionStatus } from '@/types';
import { subscriptionStatuses } from '@/components/dashboard/mock-data';

interface ChangeStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (userId: string, newStatus: SubscriptionStatus) => void;
  user?: AppUser | null;
}

export function ChangeStatusDialog({ open, onClose, onConfirm, user }: ChangeStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus>(
    user?.subscriptionStatus ?? '未契約',
  );
  const [pending, setPending] = useState(false);

  function handleClose() {
    if (pending) return;
    setSelectedStatus(user?.subscriptionStatus ?? '未契約');
    onClose();
  }

  async function handleConfirm() {
    if (!user || pending) return;
    setPending(true);
    try {
      await onConfirm(user.id, selectedStatus);
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="ステータス変更"
      description={
        user
          ? `${user.username} (${user.email}) のサブスク状態を変更します`
          : 'メンバーを選択してください'
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={pending}>
            キャンセル
          </Button>
          <Button variant="primary" size="sm" loading={pending} onClick={handleConfirm}>
            変更
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="status-select" className="block text-sm font-medium text-foreground mb-2">
            新しいステータス
          </label>
          <select
            id="status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as SubscriptionStatus)}
            disabled={pending}
            className="w-full rounded-md border border-zinc-300 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-surface-muted"
          >
            {subscriptionStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
