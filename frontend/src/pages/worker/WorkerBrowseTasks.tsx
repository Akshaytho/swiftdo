import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerApi } from '../../lib/api';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

interface Task {
  id: string;
  title: string;
  category: string;
  urgency: string;
  rateCents: number;
  locationAddress: string | null;
  createdAt: string;
  buyer: { name: string };
}

export default function WorkerBrowseTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
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
      <h1 className="text-xl font-bold mb-4">Available Tasks</h1>

      <input value={category} onChange={(e) => setCategory(e.target.value)}
        placeholder="Filter by category..."
        className="mb-4 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full" />

      <ErrorMsg error={error} />

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No open tasks available</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Link key={t.id} to={`/worker/tasks/${t.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
              <p className="font-medium text-sm">{t.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t.category} &middot; {t.urgency} &middot; Rs {(t.rateCents / 100).toFixed(0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t.locationAddress} &middot; by {t.buyer.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
