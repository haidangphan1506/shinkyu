'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { makeStore, type AppStore } from '@/store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => {
    const persistor = persistStore(store);
    return () => {
      persistor.pause();
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
