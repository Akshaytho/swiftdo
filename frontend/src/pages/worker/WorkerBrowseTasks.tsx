import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerApi } from '../../lib/api';
import { Search, MapPin, Clock } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WorkerBrowseTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (category) params.category = category;
    workerApi.listOpenTasks(params)
      .then((res) => setTasks(res.data.data))
      .catch((err) => setError(getErrorMsg(err)))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <TopBar title="Available Tasks" />

      <div className="px-4 py-3">
        <Input
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      <div className="px-4 space-y-3 pb-4">
        <ErrorMsg error={error} />

        {loading ? (
          <><TaskCardSkeleton /><TaskCardSkeleton /><TaskCardSkeleton /></>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<Search size={48} strokeWidth={1.2} />}
            title="No open tasks"
            description="Check back later for new tasks in your area"
          />
        ) : (
          tasks.map((t: any) => (
            <Card key={t.id} hoverable onClick={() => navigate(`/worker/tasks/${t.id}`)}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-text flex-1 mr-2">{t.title}</h3>
                <span className="text-base font-bold text-primary whitespace-nowrap">Rs {(t.rateCents / 100).toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                <span>{t.category}</span>
                <Badge status={t.urgency} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span className="truncate max-w-[180px]">{t.locationAddress || 'No location'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{timeAgo(t.createdAt)}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-text-muted">by {t.buyer?.name || 'Unknown'}</div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
