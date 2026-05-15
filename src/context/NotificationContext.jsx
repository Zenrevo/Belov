import { useCallback, useMemo, useState } from 'react';
import { NotificationContext } from './notification-context';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const notify = useCallback((payload) => {
    const notification = typeof payload === 'string' ? { title: payload } : payload;
    const id = notification.id || makeId();
    const duration = notification.duration ?? (notification.variant === 'error' ? 6500 : 4200);
    const nextNotification = {
      id,
      variant: notification.variant || 'success',
      title: notification.title || 'Done',
      message: notification.message || '',
      actionLabel: notification.actionLabel,
      onAction: notification.onAction,
      duration
    };

    setNotifications((current) => [...current.filter((item) => item.id !== id).slice(-3), nextNotification]);

    if (duration > 0) {
      window.setTimeout(() => removeNotification(id), duration);
    }

    return id;
  }, [removeNotification]);

  const value = useMemo(() => ({
    notifications,
    notify,
    removeNotification
  }), [notifications, notify, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
