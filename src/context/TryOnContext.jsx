import { useState } from 'react';
import { TryOnContext } from './try-on-context';

export const TryOnProvider = ({ children }) => {
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState(null);

  const openTryOn = (product) => {
    setTryOnProduct(product);
    setIsTryOnOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeTryOn = () => {
    setIsTryOnOpen(false);
    setTimeout(() => {
      setTryOnProduct(null);
    }, 300); // Wait for transition
    document.body.style.overflow = 'auto';
  };

  return (
    <TryOnContext.Provider value={{ isTryOnOpen, tryOnProduct, openTryOn, closeTryOn }}>
      {children}
    </TryOnContext.Provider>
  );
};
