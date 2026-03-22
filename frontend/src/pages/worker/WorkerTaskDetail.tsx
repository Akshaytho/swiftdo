import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workerApi, mediaApi } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const PHOTO_TYPES = [
  { value: 'BEFORE_PHOTO', label: 'Before Photo' },
  { value: 'AFTER_PHOTO', label: 'After Photo' },
  { value: 'PROOF_PHOTO', label: 'Proof Photo' },
];

export default function WorkerTaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [uploadType, setUploadType] = useState('BEFORE_PHOTO');
  const fileRef = useRef<HTMLInputElement>(null);
  const locationIntervalRef = useRef<number | null>(null);

  const load = async () => {
    try {
      const res = await workerApi.getTask(taskId!);
      setTask(res.data.data);
      // Load media if worker is assigned
      try {
        const mRes = await mediaApi.list(taskId!);
        setMedia(mRes.data.data);
      } catch { /* may not have access */ }
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [taskId]);

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

  const handleAccept = () => doAction(() => workerApi.acceptTask(taskId!));

  const handleStart = () => {
    doAction(async () => {
      await workerApi.startTask(taskId!);
      // Start GPS logging every 30 seconds
      startLocationTracking();
    });
  };

  const startLocationTracking = () => {
    if (locationIntervalRef.current) return;
    const sendLocation = () => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          workerApi.logLocation(taskId!, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy)
            .catch(() => {}); // silent fail for GPS
        },
        () => {} // silent fail
      );
    };
    sendLocation();
    locationIntervalRef.current = window.setInterval(sendLocation, 30000);
  };

  const handleSubmit = () => doAction(() => workerApi.submitTask(taskId!));
  const handleRetry = () => doAction(() => workerApi.retryTask(taskId!));

  const handleCancel = () => {
    if (cancelReason.length < 5) return setError('Reason must be at least 5 characters');
    doAction(async () => {
      await workerApi.cancelTask(taskId!, cancelReason);
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    });
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return setError('Select a file first');
    setActionLoading(true);
    try {
      await mediaApi.upload(taskId!, file, uploadType);
      fileRef.current!.value = '';
      await load();
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Resume GPS logging if task is IN_PROGRESS
  useEffect(() => {
    if (task?.status === 'IN_PROGRESS') startLocationTracking();
  }, [task?.status]);

  if (loading) return <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>;
  if (!task) return <ErrorMsg error={error || 'Task not found'} />;

  const isOpen = task.status === 'OPEN';
  const isAccepted = task.status === 'ACCEPTED';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isRejected = task.status === 'REJECTED';
  const canCancel = ['ACCEPTED', 'IN_PROGRESS'].includes(task.status);

  const uploadedTypes = new Set(media.map((m: any) => m.type));

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline">&larr; Back</button>

      <ErrorMsg error={error} />

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h1 className="text-lg font-bold">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>
        <p className="text-sm text-gray-600">{task.description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>Category: {task.category} &middot; Urgency: {task.urgency}</p>
          <p>Rate: Rs {(task.rateCents / 100).toFixed(0)}</p>
          <p>Location: {task.locationAddress}</p>
          {task.extraNote && <p>Note: {task.extraNote}</p>}
          {task.rejectionReason && <p className="text-red-600">Rejected: {task.rejectionReason}</p>}
        </div>
      </div>

      {/* Upload Section — only when IN_PROGRESS */}
      {isInProgress && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-bold">Upload Evidence</h2>
          <div className="flex gap-2 flex-wrap">
            {PHOTO_TYPES.map((pt) => (
              <span key={pt.value} className={`text-xs px-2 py-1 rounded-full ${
                uploadedTypes.has(pt.value) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {pt.label} {uploadedTypes.has(pt.value) ? '✓' : ''}
              </span>
            ))}
          </div>
          <select value={uploadType} onChange={(e) => setUploadType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {PHOTO_TYPES.map((pt) => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
          </select>
          <input ref={fileRef} type="file" accept="image/*" className="text-sm" />
          <button onClick={handleUpload} disabled={actionLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            Upload Photo
          </button>
        </div>
      )}

      {/* Uploaded media */}
      {media.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-bold mb-2">Uploaded Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {media.map((m: any) => (
              <div key={m.id} className="text-center">
                <img src={m.url} alt={m.type} className="w-full h-24 object-cover rounded border" />
                <p className="text-xs text-gray-500 mt-1">{m.type.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {isOpen && (
          <button onClick={handleAccept} disabled={actionLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            Accept Task
          </button>
        )}
        {isAccepted && (
          <button onClick={handleStart} disabled={actionLoading}
            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            Start Work
          </button>
        )}
        {isInProgress && (
          <button onClick={handleSubmit} disabled={actionLoading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            Submit for Review
          </button>
        )}
        {isRejected && (
          <button onClick={handleRetry} disabled={actionLoading}
            className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            Retry Task
          </button>
        )}
        {canCancel && !showCancel && (
          <button onClick={() => setShowCancel(true)}
            className="w-full border border-red-300 text-red-600 py-2 rounded-lg text-sm font-medium">
            Cancel Task
          </button>
        )}
      </div>

      {showCancel && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Why are you cancelling? (min 5 chars)" rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={actionLoading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">Confirm</button>
            <button onClick={() => setShowCancel(false)}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
