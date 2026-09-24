import { CheckCircle, Package, AlertCircle, Info, Trash2, Check, X } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

interface NotificationListProps {
  notifications: any[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const NotificationList = ({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose
}: NotificationListProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CONFIRMED':
      case 'ORDER_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ORDER_CANCELLED':
      case 'PAYMENT_FAILED':
        return <X className="w-5 h-5 text-red-500" />;
      case 'STOCK_LOW':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'NEW_ORDER':
      case 'ORDER_SHIPPED':
        return <Package className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-cream/50" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-h-[500px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cream/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-cream">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 text-sm text-cream/50">
                ({unreadCount} sin leer)
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-resona-light hover:text-resona-dark"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-cream/50">
            Cargando notificaciones...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-cream/50">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-white/5 transition-colors ${
                  !notification.read ? 'bg-resona/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-cream`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-cream/65 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-cream/45 mt-2">
                      {moment(notification.createdAt).fromNow()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-1 text-cream/45 hover:text-gray-600"
                        title="Marcar como leída"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(notification.id)}
                      className="p-1 text-cream/45 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-cream/10 bg-ink-800">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-cream/65 hover:text-gray-900"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

// Fix missing import
import { Bell } from 'lucide-react';

export default NotificationList;
