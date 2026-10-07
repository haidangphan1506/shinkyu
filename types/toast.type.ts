export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
  duration: number;
};

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  duration?: number;
};

export type ToastState = {
  toasts: Toast[];
};

export type ToasterProps = {
  className?: string;
};
