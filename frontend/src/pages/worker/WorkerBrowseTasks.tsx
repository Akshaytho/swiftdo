import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { workerApi } from '../../lib/api';
import { MapPin, Clock, ChevronRight, Search, Flame, TrendingUp } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { TaskCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const CATEGORIES = [
  { value: '', label: 'All', emoji: '🌟' },
  { value: 'CLEANING', label: 'Cleaning', emoji: '🧹' },
  { value: 'DELIVERY', label: 'Delivery', emoji: '🚴' },
  { value: 'REPAIR', label: 'Repair', emoji: '🔧' },
  { value: 'MOVING', label: 'Moving', emoji: '📦' },
  { value: 'GARDENING', label: 'Garden', emoji: '🌿' },
  { value: 'OTHER', label: 'Other', emoji: '✨' },
];

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
  LOW: 'border-l-border',
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

export default function WorkerBrowseTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const urgentCount = tasks.filter(t => t.urgency === 'URGENT' || t.urgency === 'HIGH').length;
  const totalEarnable = tasks.reduce((sum, t) => sum + t.rateCents, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Gradient hero header */}
      <div className="gradient-success relative overflow-hidden px-5 pt-12 pb-5">
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-2 right-10 w-12 h-12 rounded-full bg-white/15 animate-float-alt" />

        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-black text-white mt-0.5">
            {user?.name?.split(' ')[0] || 'Worker'} ⚡
          </h1>
          <p className="text-white/60 text-xs mt-1">Ready to earn today?</p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: <Search size={14} className="text-white" />, value: tasks.length, label: 'Available' },
            { icon: <Flame size={14} className="text-orange-300" />, value: urgentCount, label: 'Urgent' },
            { icon: <TrendingUp size={14} className="text-green-300" />, value: `₹${(totalEarnable / 100).toFixed(0)}`, label: 'Earnable' },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl py-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">{s.icon}</div>
              <div className="text-lg font-black text-white">{s.value}</div>
              <div className="text-white/60 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="px-4 py-4 flex gap-2 overflow-x-auto hide-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 flex-shrink-0 ${
              category === cat.value
                ? 'gradient-success text-white shadow-success scale-105'
                : 'bg-white border border-border text-text-secondary hover:border-success/30 shadow-card'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
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
              icon={<Search size={48} strokeWidth={1.2} />}
              title="No tasks right now"
              description="Check back soon — new tasks are posted daily"
            />
          </div>
        ) : (
          tasks.map((t: any) => (
            <div
              key={t.id}
              onClick={() => navigate(`/worker/tasks/${t.id}`)}
              className={`
                bg-white rounded-2xl border-l-4 shadow-card hover:shadow-card-hover
                hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer transition-all duration-200
                ${urgencyLeft[t.urgency] || 'border-l-border'}
              `}
            >
              <div className="p-4">
                {/* Top: title + price */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-text leading-snug flex-1">{t.title}</h3>
                  <div className="flex-shrink-0 flex flex-col items-end">
                    <div className="text-lg font-black text-gradient-success">
                      ₹{(t.rateCents / 100).toFixed(0)}
                    </div>
                    <div className="text-[10px] text-text-muted">pay rate</div>
                  </div>
                </div>

                {/* Category + urgency */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-semibold">
                    {t.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${urgencyColor[t.urgency] || 'bg-gray-300'}`} />
                    <Badge status={t.urgency} size="sm" />
                  </div>
                  {(t.urgency === 'URGENT' || t.urgency === 'HIGH') && (
                    <div className="flex items-center gap-0.5">
                      <Flame size={12} className="text-danger" />
                      <span className="text-[10px] font-bold text-danger">Hot</span>
                    </div>
                  )}
                </div>

                {/* Bottom: location + time + action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-text-muted flex-1 min-w-0">
                    <MapPin size={11} className="flex-shrink-0" />
                    <span className="truncate">{t.locationAddress || 'No location'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted flex-shrink-0 ml-2">
                    <Clock size={11} />
                    <span>{timeAgo(t.createdAt)}</span>
                    <ChevronRight size={14} className="text-border" />
                  </div>
                </div>

                {/* Posted by */}
                <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full gradient-success flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">
                      {(t.buyer?.name || 'B').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">by {t.buyer?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
