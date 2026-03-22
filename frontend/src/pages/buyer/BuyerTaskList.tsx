import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../lib/api';
import { Plus, ClipboardList, Clock } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const STATUSES = ['', 'OPEN', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = { '': 'All', OPEN: 'Open', ACCEPTED: 'Accepted', IN_PROGRESS: 'In Progress', SUBMITTED: 'Submitted', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled' };

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function BuyerTaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;
    buyerApi.listTasks(params)
      .then((res) => setTasks(res.data.data))
      .catch((err) => setError(getErrorMsg(err)))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <TopBar
        title="My Tasks"
        right={
          <button onClick={() => navigate('/buyer/tasks/new')} className="w-9 h-9 flex items-center justify-center bg-primary rounded-xl text-white">
            <Plus size={20} />
          </button>
        }
      />

      {/* Status filter chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              status === s ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3 pb-4">
        <ErrorMsg error={error} />

        {loading ? (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={48} strokeWidth={1.2} />}
            title="No tasks yet"
            description="Create your first task and get work done"
            action={<Button onClick={() => navigate('/buyer/tasks/new')} icon={<Plus size={18} />}>Create Task</Button>}
          />
        ) : (
          tasks.map((t: any) => (
            <Card key={t.id} hoverable onClick={() => navigate(`/buyer/tasks/${t.id}`)}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-text leading-tight flex-1 mr-2">{t.title}</h3>
                <Badge status={t.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="font-medium text-text">Rs {(t.rateCents / 100).toFixed(0)}</span>
                <span>{t.category}</span>
                <Badge status={t.urgency} size="sm" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Clock size={12} />
                  <span>{timeAgo(t.createdAt)}</span>
                </div>
                {t.worker && (
                  <span className="text-xs text-text-secondary">Worker: {t.worker.name}</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
