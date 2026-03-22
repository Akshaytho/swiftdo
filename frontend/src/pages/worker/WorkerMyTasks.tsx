import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workerApi } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

export default function WorkerMyTasks() {
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
      <h1 className="text-xl font-bold mb-4">My Tasks</h1>
      <ErrorMsg error={error} />

      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No tasks assigned yet</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t: any) => (
            <Link key={t.id} to={`/worker/tasks/${t.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.category} &middot; Rs {(t.rateCents / 100).toFixed(0)}
                  </p>
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
