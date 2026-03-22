import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerApi } from '../../lib/api';
import { Briefcase } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

export default function WorkerMyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workerApi.myTasks()
      .then((res) => setTasks(res.data.data))
      .catch((err) => setError(getErrorMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <TopBar title="My Tasks" />

      <div className="px-4 py-4 space-y-3">
        <ErrorMsg error={error} />

        {loading ? (
          <><TaskCardSkeleton /><TaskCardSkeleton /></>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={48} strokeWidth={1.2} />}
            title="No tasks yet"
            description="Browse available tasks and accept one to get started"
          />
        ) : (
          tasks.map((t: any) => (
            <Card key={t.id} hoverable onClick={() => navigate(`/worker/tasks/${t.id}`)}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-text flex-1 mr-2">{t.title}</h3>
                <Badge status={t.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="font-semibold text-text">Rs {(t.rateCents / 100).toFixed(0)}</span>
                <span>{t.category}</span>
              </div>
              {t.buyer && (
                <p className="text-xs text-text-muted mt-1">Buyer: {t.buyer.name}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
