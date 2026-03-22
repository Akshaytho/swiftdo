import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { citizenApi } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

export default function CitizenReportList() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    citizenApi.listReports()
      .then((res) => setReports(res.data.data))
      .catch((err) => setError(getErrorMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">My Reports</h1>
        <Link to="/citizen/reports/new"
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
          + New Report
        </Link>
      </div>
      <ErrorMsg error={error} />
      {loading ? (
        <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No reports yet</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{r.category}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                  {r.locationAddress && <p className="text-xs text-gray-400 mt-1">{r.locationAddress}</p>}
                </div>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
