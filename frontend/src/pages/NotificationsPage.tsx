import { useEffect, useState } from 'react';
import { notificationApi } from '../lib/api';
import { Bell, CheckCheck } from 'lucide-react';
import TopBar from '../components/ui/TopBar';
import { TaskCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorMsg, { getErrorMsg } from '../components/ErrorMsg';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

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
    try { await notificationApi.markAllRead(); load(); } catch (err) { setError(getErrorMsg(err)); }
  };

  const markRead = async (id: string) => {
    try { await notificationApi.markRead(id); load(); } catch (err) { setError(getErrorMsg(err)); }
  };

  return (
    <div>
      <TopBar
        title={`Notifications${unread > 0 ? ` (${unread})` : ''}`}
        right={unread > 0 ? (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary font-semibold">
            <CheckCheck size={16} /> Read all
          </button>
        ) : undefined}
      />

      <div className="px-4 py-4 space-y-2">
        <ErrorMsg error={error} />

        {loading ? (
          <><TaskCardSkeleton /><TaskCardSkeleton /><TaskCardSkeleton /></>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={48} strokeWidth={1.2} />}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`rounded-xl p-3 transition-colors cursor-pointer ${
                n.isRead
                  ? 'bg-surface border border-border'
                  : 'bg-primary-light border-l-4 border-l-primary border border-primary/20'
              }`}
            >
              <p className={`text-sm ${n.isRead ? 'text-text-secondary' : 'font-semibold text-text'}`}>{n.title}</p>
              <p className="text-xs text-text-secondary mt-0.5">{n.body}</p>
              <p className="text-[10px] text-text-muted mt-1">{timeAgo(n.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
