import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { citizenApi } from '../../lib/api';
import { Plus, AlertTriangle, MapPin } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

export default function CitizenReportList() {
  const navigate = useNavigate();
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
      <TopBar
        title="My Reports"
        right={
          <button onClick={() => navigate('/citizen/reports/new')} className="w-9 h-9 flex items-center justify-center bg-primary rounded-xl text-white">
            <Plus size={20} />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-3">
        <ErrorMsg error={error} />
        {loading ? (
          <><TaskCardSkeleton /><TaskCardSkeleton /></>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={48} strokeWidth={1.2} />}
            title="No reports yet"
            description="Report civic issues in your area"
            action={<Button onClick={() => navigate('/citizen/reports/new')} icon={<Plus size={18} />}>New Report</Button>}
          />
        ) : (
          reports.map((r: any) => (
            <Card key={r.id}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-text">{r.category}</h3>
                <Badge status={r.status} />
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">{r.description}</p>
              {r.locationAddress && (
                <div className="flex items-center gap-1 text-xs text-text-muted mt-2">
                  <MapPin size={12} /> {r.locationAddress}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
