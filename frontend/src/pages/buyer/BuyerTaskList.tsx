import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyerApi } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

interface Task {
  id: string;
  title: string;
  category: string;
  status: string;
  rateCents: number;
  urgency: string;
  createdAt: string;
  worker?: { id: string; name: string } | null;
}

export default function BuyerTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await buyerApi.listTasks(params);
      setTasks(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Tasks</h1>
        <Link
          to="/buyer/tasks/new"
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New Task
        </Link>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mb-4 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
      >
        <option value="">All statuses</option>
        {['OPEN','ACCEPTED','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED','CANCELLED'].map(s => (
          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
        ))}
      </select>

      <ErrorMsg error={error} />

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No tasks yet</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Link
              key={t.id}
              to={`/buyer/tasks/${t.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.category} &middot; {t.urgency} &middot; Rs {(t.rateCents / 100).toFixed(0)}
                  </p>
                  {t.worker && <p className="text-xs text-gray-400 mt-1">Worker: {t.worker.name}</p>}
                </div>
                <StatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
