'use client';

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import { axios_instance } from '@/lib/axios';
import type { ApiMutationOptions, ApiQueryOptions, MutationUrl, RequestFn } from '@/types';
import type { ApiError } from '@/utils/api-validation-error';

function useApiMutation<TData, TVariables>(
  url: MutationUrl<TVariables>,
  request: RequestFn<TData, TVariables>,
  options: ApiMutationOptions<TData, TVariables> = {},
  config?: AxiosRequestConfig,
) {
  const queryClient = useQueryClient();
  const { invalidateKeys, onSuccess, ...rest } = options;

  return useMutation<TData, ApiError, TVariables>({
    ...rest,
    mutationFn: (variables) =>
      request(typeof url === 'function' ? url(variables) : url, variables, config),
    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidateKeys) {
        await queryClient.invalidateQueries({ queryKey: invalidateKeys });
      }
      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useGet<TQueryFnData = unknown, TData = TQueryFnData>(
  queryKey: QueryKey,
  url: string,
  config?: AxiosRequestConfig,
  options?: ApiQueryOptions<TQueryFnData, TData>,
) {
  return useQuery<TQueryFnData, ApiError, TData>({
    queryKey,
    queryFn: async () => {
      const { data } = await axios_instance.get<TQueryFnData>(url, config);
      return data;
    },
    ...options,
  });
}

export function usePost<TData = unknown, TVariables = unknown>(
  url: MutationUrl<TVariables>,
  options?: ApiMutationOptions<TData, TVariables>,
  config?: AxiosRequestConfig,
) {
  return useApiMutation<TData, TVariables>(
    url,
    (target, variables, requestConfig) =>
      axios_instance
        .post<TData>(target, variables, requestConfig)
        .then((response) => response.data),
    options,
    config,
  );
}

export function usePut<TData = unknown, TVariables = unknown>(
  url: MutationUrl<TVariables>,
  options?: ApiMutationOptions<TData, TVariables>,
  config?: AxiosRequestConfig,
) {
  return useApiMutation<TData, TVariables>(
    url,
    (target, variables, requestConfig) =>
      axios_instance.put<TData>(target, variables, requestConfig).then((response) => response.data),
    options,
    config,
  );
}

export function useDelete<TData = unknown, TVariables = void>(
  url: MutationUrl<TVariables>,
  options?: ApiMutationOptions<TData, TVariables>,
  config?: AxiosRequestConfig,
) {
  return useApiMutation<TData, TVariables>(
    url,
    (target, variables, requestConfig) =>
      axios_instance
        .delete<TData>(target, { ...requestConfig, data: variables })
        .then((response) => response.data),
    options,
    config,
  );
}
