import { useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { navigate } from '@/lib/router';

export function SiteSearchPanel({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/produtos?${new URLSearchParams({ q: term }).toString()}` : '/produtos');
    onClose();
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="fixed inset-x-0 top-16 z-30 border-b border-ink-200/70 bg-white shadow-soft lg:left-24 lg:top-0"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Search size={18} className="shrink-0 text-ink-500" aria-hidden="true" />
        <input
          type="search"
          autoFocus
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por título, tema ou palavra-chave"
          aria-label="Buscar produtos"
          className="h-11 flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-500 focus:outline-none"
        />
        <button
          type="submit"
          className="h-10 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-ink-900 transition-colors hover:bg-brand-600"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar pesquisa"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-brand-50 hover:text-brand-800"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
