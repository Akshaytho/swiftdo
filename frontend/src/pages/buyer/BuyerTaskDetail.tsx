import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buyerApi } from '../../lib/api';
import { MapPin, Clock, User, Camera, Navigation, CheckCircle2, XCircle, Ban, IndianRupee, Zap } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { PageSkeleton } from '../../components/ui/Skeleton';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const STEPS = ['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED'];

function StepProgress({ status }: { status: string }) {
  const idx = STEPS.indexOf(status);
  const isCancelled = status === 'CANCELLED';
  const isRejected = status === 'REJECTED';
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`h-1.5 rounded-full flex-1 ${
            isCancelled ? 'bg-gray-200' :
            isRejected && i >= idx ? 'bg-danger-light' :
            i <= idx ? 'bg-primary' : 'bg-gray-200'
          }`} />
        </div>
      ))}
    </div>
  );
}

export default function BuyerTaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const load = async () => {
    try {
      const res = await buyerApi.getTask(taskId!);
      setTask(res.data.data);
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [taskId]);

  const doAction = async (action: () => Promise<any>) => {
    setActionLoading(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => doAction(() => buyerApi.approveTask(taskId!));
  const handleCancel = () => doAction(() => buyerApi.cancelTask(taskId!));
  const handleReject = () => {
    if (rejectReason.length < 5) { setError('Reason must be at least 5 characters'); return; }
    doAction(async () => { await buyerApi.rejectTask(taskId!, rejectReason); setShowReject(false); });
  };

  if (loading) return <PageSkeleton />;
  if (!task) return <div className="p-4"><ErrorMsg error={error || 'Task not found'} /></div>;

  const isSubmitted = task.status === 'SUBMITTED';
  const canCancel = ['OPEN', 'ACCEPTED'].includes(task.status);

  return (
    <div>
      <TopBar title="Task Detail" showBack right={<Badge status={task.status} size="md" />} />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <ErrorMsg error={error} />

        {/* Progress */}
        <StepProgress status={task.status} />

        {/* Main Info */}
        <Card>
          <h2 className="text-lg font-bold text-text mb-2">{task.title}</h2>
          <p className="text-sm text-text-secondary mb-3">{task.description}</p>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <span className="font-semibold text-text">Rs {(task.rateCents / 100).toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Zap size={13} /> {task.urgency}
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <MapPin size={13} /> {task.locationAddress || 'No address'}
            </div>
            {task.worker && (
              <div className="flex items-center gap-1.5 text-text-secondary">
                <User size={13} /> {task.worker.name}
              </div>
            )}
          </div>
          {task.aiScore != null && (
            <div className="mt-3 flex items-center gap-2 text-xs bg-primary-light text-primary px-3 py-1.5 rounded-lg">
              <Zap size={13} /> AI Score: {task.aiScore} (placeholder)
            </div>
          )}
          {task.timeSpentSecs != null && (
            <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
              <Clock size={13} /> Time worked: {Math.floor(task.timeSpentSecs / 60)} min
            </div>
          )}
          {task.rejectionReason && (
            <div className="mt-3 bg-danger-light text-danger text-xs px-3 py-2 rounded-lg">
              Rejected: {task.rejectionReason}
            </div>
          )}
        </Card>

        {/* Evidence Photos */}
        {task.media && task.media.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Camera size={16} className="text-text-secondary" />
              <h3 className="text-sm font-bold text-text">Evidence Photos</h3>
              <span className="text-xs text-text-muted">({task.media.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {task.media.map((m: any) => (
                <div key={m.id}>
                  <img src={m.url} alt={m.type} className="w-full h-24 object-cover rounded-xl border border-border" />
                  <p className="text-[10px] text-text-muted text-center mt-1">{m.type.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* GPS Logs */}
        {task.locationLogs && task.locationLogs.length > 0 && (
          <Card>
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-text-secondary" />
              <h3 className="text-sm font-bold text-text">GPS Tracking</h3>
              <span className="text-xs text-text-muted">{task.locationLogs.length} points</span>
            </div>
          </Card>
        )}

        {/* Payout */}
        {task.payout && (
          <Card className="!bg-success-light !border-green-200">
            <div className="flex items-center gap-2">
              <IndianRupee size={16} className="text-success" />
              <span className="text-sm font-bold text-success">
                Payout: Rs {(task.payout.amountCents / 100).toFixed(0)} — {task.payout.status}
              </span>
            </div>
          </Card>
        )}

        {/* Actions */}
        {isSubmitted && !showReject && (
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleApprove} loading={actionLoading} icon={<CheckCircle2 size={18} />} className="!bg-success hover:!bg-green-700 flex-1">
              Approve
            </Button>
            <Button variant="danger" onClick={() => setShowReject(true)} loading={actionLoading} icon={<XCircle size={18} />} className="flex-1">
              Reject
            </Button>
          </div>
        )}

        {showReject && (
          <Card>
            <h3 className="text-sm font-bold text-text mb-2">Rejection Reason</h3>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Why are you rejecting? (min 5 chars)" rows={3} />
            <div className="flex gap-3 mt-3">
              <Button variant="danger" onClick={handleReject} loading={actionLoading} className="flex-1">
                Confirm Reject
              </Button>
              <Button variant="outline" onClick={() => setShowReject(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {canCancel && (
          <Button variant="outline" onClick={handleCancel} loading={actionLoading} icon={<Ban size={18} />} className="!text-danger !border-danger/30">
            Cancel Task
          </Button>
        )}
      </div>
    </div>
  );
}
