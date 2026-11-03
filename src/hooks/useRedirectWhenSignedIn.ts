import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';

export function useRedirectWhenSignedIn(target: string) {
  const { user, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && user) navigate(target, { replace: true });
  }, [user, isLoading, target]);
}
