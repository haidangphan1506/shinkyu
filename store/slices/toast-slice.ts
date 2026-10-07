import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import { TOAST_DEFAULT_DURATION, TOAST_DEFAULT_TONE } from '@/constants';
import type { Toast, ToastInput, ToastState } from '@/types';

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    pushToast: {
      prepare(input: ToastInput): { payload: Toast } {
        return {
          payload: {
            id: nanoid(),
            message: input.message,
            tone: input.tone ?? TOAST_DEFAULT_TONE,
            duration: input.duration ?? TOAST_DEFAULT_DURATION,
          },
        };
      },
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload);
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { pushToast, dismissToast } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
