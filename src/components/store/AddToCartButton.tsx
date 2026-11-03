import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/context/StoreContext';
import { navigate } from '@/lib/router';

export function AddToCartButton({ productId, fullWidth = false, size = 'lg' }: { productId: string; fullWidth?: boolean; size?: 'sm' | 'lg' }) {
  const { isInCart, addToCart } = useStore();

  if (isInCart(productId)) {
    return (
      <Button variant="secondary" size={size} fullWidth={fullWidth} onClick={() => navigate('/carrinho')}>
        <Check size={18} aria-hidden="true" />
        No carrinho - ver carrinho
      </Button>
    );
  }

  return (
    <Button variant="secondary" size={size} fullWidth={fullWidth} onClick={() => addToCart(productId)}>
      <ShoppingBag size={18} aria-hidden="true" />
      Adicionar ao carrinho
    </Button>
  );
}
