import { useState, useCallback, useRef } from 'react';
import { ActionStatus, AsyncState } from '../api/types';

export interface UseAsyncActionOptions<T, A extends any[]> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
}

export function useAsyncAction<T, A extends any[] = []>(
  actionFn: (...args: A) => Promise<{ success: boolean; data?: T; error?: { message: string } }>,
  options: UseAsyncActionOptions<T, A> = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: undefined,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const isExecutingRef = useRef(false);
  const lastArgsRef = useRef<A | null>(null);

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      // Prevent concurrent duplicate executions (double-click safeguard)
      if (isExecutingRef.current) {
        return null;
      }

      isExecutingRef.current = true;
      lastArgsRef.current = args;

      setState({
        status: 'loading',
        data: undefined,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const response = await actionFn(...args);

        if (response.success && response.data !== undefined) {
          isExecutingRef.current = false;
          setState({
            status: 'success',
            data: response.data,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          options.onSuccess?.(response.data);
          return response.data;
        } else {
          const errMsg = response.error?.message || 'Произошла непредвиденная ошибка при обращении к серверу';
          isExecutingRef.current = false;
          setState({
            status: 'error',
            data: undefined,
            error: errMsg,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
          options.onError?.(errMsg);
          return null;
        }
      } catch (err: any) {
        const errMsg = err?.message || 'Не удалось выполнить запрос к серверу';
        isExecutingRef.current = false;
        setState({
          status: 'error',
          data: undefined,
          error: errMsg,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
        options.onError?.(errMsg);
        return null;
      }
    },
    [actionFn, options]
  );

  const retry = useCallback(async () => {
    if (lastArgsRef.current) {
      return execute(...lastArgsRef.current);
    }
    return null;
  }, [execute]);

  const reset = useCallback(() => {
    isExecutingRef.current = false;
    setState({
      status: 'idle',
      data: undefined,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
  };
}
