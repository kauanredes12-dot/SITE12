import { useEffect } from 'react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { supabase } from '@/lib/supabase';
import { buildHomeLayout } from '@/lib/homeLayout';
import { DEFAULT_HOME_ITEMS } from '@/lib/homeContentDefaults';
import { fetchPublicHomeItems } from '@/services/homeContent';
import type { HomeLayout } from '@/types/homeContent';

async function loadHomeLayout(): Promise<HomeLayout> {
  try {
    return buildHomeLayout(await fetchPublicHomeItems());
  } catch (cause) {
    console.error('home content failed to load', cause);
    return buildHomeLayout(DEFAULT_HOME_ITEMS);
  }
}

export function useHomeLayout(): { layout: HomeLayout | null } {
  const { data, reload } = useAsyncData(loadHomeLayout, []);

  useEffect(() => {
    const channel = supabase
      .channel('home-page-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_page_items' }, reload)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload]);

  return { layout: data };
}
