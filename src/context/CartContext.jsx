import { useCallback, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../lib/api';
import { useAuth } from './useAuth';
import { CartContext } from './cart-context';
import { useNotifications } from './useNotifications';

const guestItems = [];

const getSummary = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 299;
  return { subtotal, shipping, total: subtotal + shipping, count: items.reduce((sum, item) => sum + item.quantity, 0) };
};

const cartToastMessage = (product, selectedSize, selectedColor, quantity) => (
  [
    product?.name,
    selectedSize ? `Size ${selectedSize}` : null,
    selectedColor ? `Color ${selectedColor}` : null,
    `Qty ${quantity}`
  ].filter(Boolean).join(' · ')
);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { notify } = useNotifications();
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

  const addToCart = useCallback(async (product, selectedSize, quantity = 1, selectedColor = product.color) => {
    const color = selectedColor || product.color || '';
    if (!isAuthenticated) {
      setItems((prev) => {
        const existing = prev.find((item) => (
          item.id === product.id
          && item.selectedSize === selectedSize
          && (item.selectedColor || item.color) === color
        ));
        const next = existing
          ? prev.map((item) => item === existing ? { ...item, quantity: item.quantity + quantity } : item)
          : [
              ...prev,
              {
                ...product,
                cartItemId: `guest-${product.id}-${selectedSize}-${color}`,
                productId: product.id,
                selectedSize,
                selectedColor: color,
                quantity
              }
            ];
        setSummary(getSummary(next));
        return next;
      });
      notify({
        title: 'Added to bag',
        message: cartToastMessage(product, selectedSize, color, quantity)
      });
      return;
    }
    try {
      applyCart(await cartApi.add({ productId: product.id, selectedSize, selectedColor: color, quantity }));
      notify({
        title: 'Added to bag',
        message: cartToastMessage(product, selectedSize, color, quantity)
      });
    } catch (err) {
      notify({
        variant: 'error',
        title: 'Could not add to bag',
        message: err.message
      });
      throw err;
    }
  }, [isAuthenticated, notify]);

  const updateQuantity = useCallback(async (item, quantity) => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const next = prev.map((current) => current.cartItemId === item.cartItemId ? { ...current, quantity } : current);
        setSummary(getSummary(next));
        return next;
      });
      notify({
        variant: 'info',
        title: 'Bag updated',
        message: `${item.name} · Qty ${quantity}`
      });
      return;
    }
    try {
      applyCart(await cartApi.update(item.cartItemId, { quantity }));
      notify({
        variant: 'info',
        title: 'Bag updated',
        message: `${item.name} · Qty ${quantity}`
      });
    } catch (err) {
      notify({
        variant: 'error',
        title: 'Could not update bag',
        message: err.message
      });
      throw err;
    }
  }, [isAuthenticated, notify]);

  const removeItem = useCallback(async (item) => {
    if (!isAuthenticated) {
      setItems((prev) => {
        const next = prev.filter((current) => current.cartItemId !== item.cartItemId);
        setSummary(getSummary(next));
        return next;
      });
      notify({
        variant: 'info',
        title: 'Removed from bag',
        message: item.name
      });
      return;
    }
    try {
      applyCart(await cartApi.remove(item.cartItemId));
      notify({
        variant: 'info',
        title: 'Removed from bag',
        message: item.name
      });
    } catch (err) {
      notify({
        variant: 'error',
        title: 'Could not remove item',
        message: err.message
      });
      throw err;
    }
  }, [isAuthenticated, notify]);

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
