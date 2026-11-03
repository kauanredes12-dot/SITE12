import { useEffect } from 'react';

export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (!description) return;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute('content', description);
  }, [title, description]);
}
