import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { workerApi, mediaApi } from '../../lib/api';
import { Camera, Upload, CheckCircle2, Play, Send, RotateCcw, Ban, MapPin } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { PageSkeleton } from '../../components/ui/Skeleton';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const PHOTO_TYPES = [
  { value: 'BEFORE_PHOTO', label: 'Before' },
  { value: 'AFTER_PHOTO', label: 'After' },
  { value: 'PROOF_PHOTO', label: 'Proof' },
];

export default function WorkerTaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [uploadType, setUploadType] = useState('BEFORE_PHOTO');
  const fileRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<number | null>(null);

  const load = async () => {
    try {
      const res = await workerApi.getTask(taskId!);
      setTask(res.data.data);
      try {
        const mRes = await mediaApi.list(taskId!);
        setMedia(mRes.data.data);
      } catch {}
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); return () => { if (locationRef.current) clearInterval(locationRef.current); }; }, [taskId]);

  const startGPS = () => {
    if (locationRef.current) return;
    const send = () => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => { workerApi.logLocation(taskId!, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy).catch(() => {}); },
        () => {}
      );
    };
    send();
    locationRef.current = window.setInterval(send, 30000);
  };

  useEffect(() => { if (task?.status === 'IN_PROGRESS') startGPS(); }, [task?.status]);

  const doAction = async (action: () => Promise<any>) => {
    setActionLoading(true);
    setError(null);
    try { await action(); await load(); } catch (err) { setError(getErrorMsg(err)); } finally { setActionLoading(false); }
  };

  const handleAccept = () => doAction(() => workerApi.acceptTask(taskId!));
  const handleStart = () => doAction(async () => { await workerApi.startTask(taskId!); startGPS(); });
  const handleSubmit = () => doAction(() => workerApi.submitTask(taskId!));
  const handleRetry = () => doAction(() => workerApi.retryTask(taskId!));
  const handleCancel = () => {
    if (cancelReason.length < 5) { setError('Reason must be at least 5 characters'); return; }
    doAction(async () => {
      await workerApi.cancelTask(taskId!, cancelReason);
      if (locationRef.current) { clearInterval(locationRef.current); locationRef.current = null; }
    });
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Select a file first'); return; }
    setActionLoading(true);
    try {
      await mediaApi.upload(taskId!, file, uploadType);
      fileRef.current!.value = '';
      await load();
    } catch (err) { setError(getErrorMsg(err)); } finally { setActionLoading(false); }
  };

  if (loading) return <PageSkeleton />;
  if (!task) return <div className="p-4"><ErrorMsg error={error || 'Task not found'} /></div>;

  const isOpen = task.status === 'OPEN';
  const isAccepted = task.status === 'ACCEPTED';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isRejected = task.status === 'REJECTED';
  const canCancel = ['ACCEPTED', 'IN_PROGRESS'].includes(task.status);
  const uploadedTypes = new Set(media.map((m: any) => m.type));

  return (
    <div>
      <TopBar title="Task Detail" showBack right={<Badge status={task.status} size="md" />} />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <ErrorMsg error={error} />

        {/* Task Info */}
        <Card>
          <h2 className="text-lg font-bold text-text mb-1">{task.title}</h2>
          <p className="text-sm text-text-secondary mb-3">{task.description}</p>
          <div className="space-y-1.5 text-xs text-text-secondary">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-primary">Rs {(task.rateCents / 100).toFixed(0)}</span>
              <Badge status={task.urgency} size="md" />
            </div>
            <div className="flex items-center gap-1.5"><MapPin size={13} /> {task.locationAddress || 'No address'}</div>
            <div>Category: {task.category}</div>
            {task.extraNote && <div className="text-text-muted">Note: {task.extraNote}</div>}
            {task.rejectionReason && (
              <div className="bg-danger-light text-danger px-3 py-2 rounded-lg mt-2">
                Rejected: {task.rejectionReason}
              </div>
            )}
          </div>
        </Card>

        {/* Upload Section */}
        {isInProgress && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Camera size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-text">Upload Evidence</h3>
            </div>
            <div className="flex gap-2 mb-3">
              {PHOTO_TYPES.map((pt) => {
                const done = uploadedTypes.has(pt.value);
                const active = uploadType === pt.value;
                return (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => setUploadType(pt.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      done ? 'bg-success-light text-success' :
                      active ? 'bg-primary-light text-primary border border-primary/30' :
                      'bg-gray-100 text-text-muted'
                    }`}
                  >
                    {done && <CheckCircle2 size={13} />}
                    {pt.label}
                  </button>
                );
              })}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="text-xs text-text-secondary mb-3 w-full" />
            <Button onClick={handleUpload} loading={actionLoading} variant="secondary" icon={<Upload size={16} />} size="sm">
              Upload Photo
            </Button>
          </Card>
        )}

        {/* Uploaded Media */}
        {media.length > 0 && (
          <Card>
            <h3 className="text-sm font-bold text-text mb-2">Photos ({media.length})</h3>
            <div className="grid grid-cols-3 gap-2">
              {media.map((m: any) => (
                <div key={m.id}>
                  <img src={m.url} alt={m.type} className="w-full h-24 object-cover rounded-xl border border-border" />
                  <p className="text-[10px] text-text-muted text-center mt-1">{m.type.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isOpen && (
            <Button onClick={handleAccept} loading={actionLoading} icon={<CheckCircle2 size={18} />} size="lg">
              Accept Task
            </Button>
          )}
          {isAccepted && (
            <Button onClick={handleStart} loading={actionLoading} icon={<Play size={18} />} size="lg" className="!bg-success hover:!bg-green-700">
              Start Work
            </Button>
          )}
          {isInProgress && (
            <Button onClick={handleSubmit} loading={actionLoading} icon={<Send size={18} />} size="lg" className="!bg-purple-600 hover:!bg-purple-700">
              Submit for Review
            </Button>
          )}
          {isRejected && (
            <Button onClick={handleRetry} loading={actionLoading} icon={<RotateCcw size={18} />} size="lg" className="!bg-orange-500 hover:!bg-orange-600">
              Retry Task
            </Button>
          )}

          {canCancel && !showCancel && (
            <Button variant="outline" onClick={() => setShowCancel(true)} icon={<Ban size={16} />} className="!text-danger !border-danger/30">
              Cancel Task
            </Button>
          )}
        </div>

        {showCancel && (
          <Card>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why are you cancelling? (min 5 chars)" rows={2} />
            <div className="flex gap-3 mt-3">
              <Button variant="danger" onClick={handleCancel} loading={actionLoading} className="flex-1">Confirm</Button>
              <Button variant="outline" onClick={() => setShowCancel(false)} className="flex-1">Back</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
