import { useEffect, useState } from 'react';
import { notificationApi } from '../lib/api';
import ErrorMsg, { getErrorMsg } from '../components/ErrorMsg';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const res = await notificationApi.list();
      setNotifications(res.data.data);
      setUnread(res.data.unreadCount ?? 0);
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      load();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      load();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Notifications {unread > 0 && <span className="text-sm text-indigo-600">({unread} unread)</span>}</h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-indigo-600 hover:underline">
            Mark all read
          </button>
        )}
      </div>
      <ErrorMsg error={error} />
      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No notifications</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`bg-white border rounded-lg p-3 cursor-pointer transition ${
                n.isRead ? 'border-gray-200' : 'border-indigo-300 bg-indigo-50'
              }`}>
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-gray-500 mt-1">{n.body}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
