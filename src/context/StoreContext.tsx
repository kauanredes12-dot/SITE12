import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const CART_STORAGE_KEY = 'edvora-cart';
const FAVORITES_STORAGE_KEY = 'edvora-favorites';

type StoreContextValue = {
  cartIds: string[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readStoredIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function usePersistentIdList(key: string) {
  const [ids, setIds] = useState<string[]>(() => readStoredIds(key));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(ids));
  }, [key, ids]);

  const add = useCallback((id: string) => {
    setIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setIds((current) => current.filter((currentId) => currentId !== id));
  }, []);

  const clear = useCallback(() => {
    setIds([]);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, add, remove, clear, has };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const cart = usePersistentIdList(CART_STORAGE_KEY);
  const favorites = usePersistentIdList(FAVORITES_STORAGE_KEY);
  const { add: addFavorite, remove: removeFavorite, has: hasFavorite } = favorites;

  const toggleFavorite = useCallback(
    (productId: string) => {
      if (hasFavorite(productId)) {
        removeFavorite(productId);
      } else {
        addFavorite(productId);
      }
    },
    [addFavorite, removeFavorite, hasFavorite],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cartIds: cart.ids,
      addToCart: cart.add,
      removeFromCart: cart.remove,
      clearCart: cart.clear,
      isInCart: cart.has,
      favoriteIds: favorites.ids,
      toggleFavorite,
      isFavorite: hasFavorite,
    }),
    [cart.ids, cart.add, cart.remove, cart.clear, cart.has, favorites.ids, toggleFavorite, hasFavorite],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
