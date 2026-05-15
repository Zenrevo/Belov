import { AlertCircle, CheckCircle2, Info, Sparkles, X } from 'lucide-react';
import { useNotifications } from '../context/useNotifications';
import './NotificationCenter.css';

const icons = {
  error: AlertCircle,
  info: Info,
  progress: Sparkles,
  success: CheckCircle2
};

const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotifications();

  if (!notifications.length) return null;

  return (
    <div className="notification-stack" aria-live="polite" aria-atomic="false">
      {notifications.map((notification) => {
        const Icon = icons[notification.variant] || CheckCircle2;
        return (
          <div
            key={notification.id}
            className={`notification-card ${notification.variant}`}
            role={notification.variant === 'error' ? 'alert' : 'status'}
            style={{ '--toast-duration': `${notification.duration || 0}ms` }}
          >
            <div className="notification-icon" aria-hidden="true">
              <Icon size={18} />
            </div>
            <div className="notification-copy">
              <strong>{notification.title}</strong>
              {notification.message && <span>{notification.message}</span>}
              {notification.actionLabel && (
                <button
                  type="button"
                  className="notification-action"
                  onClick={() => {
                    notification.onAction?.();
                    removeNotification(notification.id);
                  }}
                >
                  {notification.actionLabel}
                </button>
              )}
            </div>
            <button
              type="button"
              className="notification-close"
              aria-label="Dismiss notification"
              onClick={() => removeNotification(notification.id)}
            >
              <X size={16} />
            </button>
            {notification.duration > 0 && <span className="notification-timer" />}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCenter;
