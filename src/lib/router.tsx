import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

type NavigateOptions = { replace?: boolean };

export function navigate(to: string, options: NavigateOptions = {}) {
  if (options.replace) {
    window.history.replaceState(null, '', to);
  } else {
    window.history.pushState(null, '', to);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useCurrentUrl(): URL {
  const [url, setUrl] = useState(() => new URL(window.location.href));

  useEffect(() => {
    const handleChange = () => setUrl(new URL(window.location.href));
    window.addEventListener('popstate', handleChange);
    return () => window.removeEventListener('popstate', handleChange);
  }, []);

  return url;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, onClick, ...props }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || isModified || event.button !== 0 || to.startsWith('http')) return;
    event.preventDefault();
    navigate(to);
  };

  return <a href={to} onClick={handleClick} {...props} />;
}
