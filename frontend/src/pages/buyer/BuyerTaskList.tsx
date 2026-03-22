import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { buyerApi } from '../../lib/api';
import { Plus, ClipboardList, Clock, ChevronRight, MapPin } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const STATUSES = ['', 'OPEN', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  '': 'All',
  OPEN: 'Open',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'Active',
  SUBMITTED: 'Review',
  APPROVED: 'Done',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const urgencyColor: Record<string, string> = {
  URGENT: 'bg-danger',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-warning',
  LOW: 'bg-gray-300',
};

const urgencyLeft: Record<string, string> = {
  URGENT: 'border-l-danger',
  HIGH: 'border-l-orange-500',
  MEDIUM: 'border-l-warning',
  LOW: 'border-l-gray-300',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function BuyerTaskList() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const openCount = tasks.filter(t => t.status === 'OPEN').length;
  const activeCount = tasks.filter(t => t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Gradient hero header */}
      <div className="gradient-primary relative overflow-hidden px-5 pt-12 pb-5">
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-2 right-12 w-10 h-10 rounded-full bg-white/15 animate-float-alt" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">{getGreeting()},</p>
            <h1 className="text-2xl font-black text-white mt-0.5">
              {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-white/60 text-xs mt-1">Manage your tasks below</p>
          </div>
          <button
            onClick={() => navigate('/buyer/tasks/new')}
            className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus size={22} className="text-primary" />
          </button>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-5">
          {[
            { value: tasks.length, label: 'Total Tasks', color: 'text-white' },
            { value: openCount, label: 'Open', color: 'text-yellow-300' },
            { value: activeCount, label: 'In Progress', color: 'text-green-300' },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl py-3 text-center">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-white/60 text-[10px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status filter chips */}
      <div className="px-4 py-4 flex gap-2 overflow-x-auto hide-scrollbar">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex-shrink-0 ${
              status === s
                ? 'gradient-primary text-white shadow-primary scale-105'
                : 'bg-white border border-border text-text-secondary hover:border-primary/30 shadow-card'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="px-4 space-y-3">
        <ErrorMsg error={error} />

        {loading ? (
          <><TaskCardSkeleton /><TaskCardSkeleton /><TaskCardSkeleton /></>
        ) : tasks.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              icon={<ClipboardList size={48} strokeWidth={1.2} />}
              title="No tasks yet"
              description="Create your first task and get work done fast"
              action={
                <Button onClick={() => navigate('/buyer/tasks/new')} icon={<Plus size={18} />}>
                  Post a Task
                </Button>
              }
            />
          </div>
        ) : (
          tasks.map((t: any) => (
            <div
              key={t.id}
              onClick={() => navigate(`/buyer/tasks/${t.id}`)}
              className={`
                bg-white rounded-2xl border-l-4 shadow-card hover:shadow-card-hover
                hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer transition-all duration-200
                ${urgencyLeft[t.urgency] || 'border-l-gray-300'}
              `}
            >
              <div className="p-4">
                {/* Top row: title + price */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h3 className="font-bold text-sm text-text leading-snug flex-1">{t.title}</h3>
                  <div className="flex-shrink-0">
                    <div className="text-base font-black text-success">
                      ₹{(t.rateCents / 100).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Mid row: badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2.5">
                  <Badge status={t.status} />
                  <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">{t.category}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${urgencyColor[t.urgency] || 'bg-gray-300'}`} />
                    <span className="text-xs text-text-muted">{t.urgency}</span>
                  </div>
                </div>

                {/* Bottom row: meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <MapPin size={11} />
                    <span className="truncate max-w-[140px]">{t.locationAddress || 'No location'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock size={11} />
                    <span>{timeAgo(t.createdAt)}</span>
                    <ChevronRight size={14} className="text-border" />
                  </div>
                </div>

                {t.worker && (
                  <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">
                        {t.worker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">Assigned to {t.worker.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
