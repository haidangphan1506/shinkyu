import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { uiReducer } from '../slices/ui-slice';
import { toastReducer } from '../slices/toast-slice';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedUiReducer = persistReducer(persistConfig, uiReducer);

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: persistedUiReducer,
      toast: toastReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export { setSidebarCollapsed, toggleSidebarCollapsed } from '../slices/ui-slice';
export { dismissToast, pushToast } from '../slices/toast-slice';
