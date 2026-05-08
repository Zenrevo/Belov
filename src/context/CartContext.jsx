import { useCallback, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../lib/api';
import { products } from '../data/products';
import { useAuth } from './useAuth';
import { CartContext } from './cart-context';

const guestItems = [
  { ...products[0], cartItemId: 'guest-1', productId: products[0].id, quantity: 1, selectedSize: '2XL', lineTotal: products[0].price },
  { ...products[1], cartItemId: 'guest-2', productId: products[1].id, quantity: 1, selectedSize: '3XL', lineTotal: products[1].price },
];

const getSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 299;
  return { subtotal, shipping, total: subtotal + shipping, count: items.reduce((sum, item) => sum + item.quantity, 0) };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(guestItems);
  const [summary, setSummary] = useState(getSummary(guestItems));
  const [loading, setLoading] = useState(false);

  const applyCart = (cart) => {
    setItems(cart.items || []);
    setSummary(cart.summary || getSummary(cart.items || []));
  };

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems(guestItems);
      setSummary(getSummary(guestItems));
      return;
    }
    setLoading(true);
    try {
      applyCart(await cartApi.get());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    Promise.resolve().then(refreshCart).catch(() => {});
  }, [refreshCart]);

  const addToCart = useCallback(async (product, selectedSize, quantity = 1) => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === product.id && item.selectedSize === selectedSize);
        const next = existing
          ? prev.map((item) => item === existing ? { ...item, quantity: item.quantity + quantity } : item)
          : [...prev, { ...product, cartItemId: `guest-${product.id}-${selectedSize}`, productId: product.id, selectedSize, quantity }];
        setSummary(getSummary(next));
        return next;
      });
      return;
    }
    applyCart(await cartApi.add({ productId: product.id, selectedSize, quantity }));
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (item, quantity) => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const next = prev.map((current) => current.cartItemId === item.cartItemId ? { ...current, quantity } : current);
        setSummary(getSummary(next));
        return next;
      });
      return;
    }
    applyCart(await cartApi.update(item.cartItemId, { quantity }));
  }, [isAuthenticated]);

  const removeItem = useCallback(async (item) => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const next = prev.filter((current) => current.cartItemId !== item.cartItemId);
        setSummary(getSummary(next));
        return next;
      });
      return;
    }
    applyCart(await cartApi.remove(item.cartItemId));
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    items,
    summary,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    isGuestCart: !isAuthenticated
  }), [items, summary, loading, refreshCart, addToCart, updateQuantity, removeItem, isAuthenticated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
