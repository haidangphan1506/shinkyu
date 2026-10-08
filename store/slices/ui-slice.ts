import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UiState } from '@/types';

const initialState: UiState = {
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { toggleSidebarCollapsed, setSidebarCollapsed } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
