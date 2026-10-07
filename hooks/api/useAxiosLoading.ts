'use client';

import { useEffect, useState } from 'react';
import { axiosClient } from '@/lib/axios';

export function useAxiosLoading() {
  const [isLoading, setIsLoading] = useState(() => axiosClient.isLoading());

  useEffect(() => {
    const unsubscribe = axiosClient.onLoadingChange((state) => {
      setIsLoading(state);
    });

    return unsubscribe;
  }, []);

  return isLoading;
}
