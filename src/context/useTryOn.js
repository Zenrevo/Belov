import { useContext } from 'react';
import { TryOnContext } from './try-on-context';

export const useTryOn = () => useContext(TryOnContext);
