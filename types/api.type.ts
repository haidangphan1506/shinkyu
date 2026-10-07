import type { UseMutationOptions, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import type { ApiError } from '@/utils/api-validation-error';

export type MutationUrl<TVariables> = string | ((variables: TVariables) => string);

export type ApiMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  'mutationFn'
> & {
  invalidateKeys?: QueryKey;
};

export type ApiQueryOptions<TQueryFnData, TData> = Omit<
  UseQueryOptions<TQueryFnData, ApiError, TData>,
  'queryKey' | 'queryFn'
>;

export type RequestFn<TData, TVariables> = (
  url: string,
  variables: TVariables,
  config?: AxiosRequestConfig,
) => Promise<TData>;
