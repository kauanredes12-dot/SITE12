import { useCallback, useEffect, useState, type DependencyList } from 'react';

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
};

export function useAsyncData<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (isActive) setData(result);
      })
      .catch((err: unknown) => {
        if (isActive) setError(err instanceof Error ? err.message : 'Erro inesperado.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
    // The caller controls the dependencies, including the loader's inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, error, isLoading, reload };
}
