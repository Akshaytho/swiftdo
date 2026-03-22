import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerApi } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

export default function BuyerTaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
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

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await buyerApi.approveTask(taskId!);
      load();
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectReason.length < 5) return setError('Rejection reason must be at least 5 characters');
    setActionLoading(true);
    try {
      await buyerApi.rejectTask(taskId!, rejectReason);
      setShowReject(false);
      load();
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await buyerApi.cancelTask(taskId!);
      load();
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>;
  if (!task) return <ErrorMsg error={error || 'Task not found'} />;

  const isSubmitted = task.status === 'SUBMITTED';
  const canCancel = ['OPEN', 'ACCEPTED'].includes(task.status);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <button onClick={() => navigate('/buyer/tasks')} className="text-sm text-indigo-600 hover:underline">&larr; Back</button>

      <ErrorMsg error={error} />

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h1 className="text-lg font-bold">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Category:</span> {task.category}</p>
          <p><span className="font-medium">Rate:</span> Rs {(task.rateCents / 100).toFixed(0)}</p>
          <p><span className="font-medium">Urgency:</span> {task.urgency}</p>
          <p><span className="font-medium">Location:</span> {task.locationAddress}</p>
          <p><span className="font-medium">Description:</span> {task.description}</p>
          {task.worker && <p><span className="font-medium">Worker:</span> {task.worker.name}</p>}
          {task.aiScore != null && <p><span className="font-medium">AI Score:</span> {task.aiScore} (placeholder)</p>}
          {task.timeSpentSecs != null && (
            <p><span className="font-medium">Time worked:</span> {Math.floor(task.timeSpentSecs / 60)} min</p>
          )}
          {task.rejectionReason && <p className="text-red-600"><span className="font-medium">Rejection:</span> {task.rejectionReason}</p>}
        </div>
      </div>

      {/* Evidence Photos */}
      {task.media && task.media.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-bold mb-3">Evidence Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {task.media.map((m: any) => (
              <div key={m.id} className="text-center">
                <img src={m.url} alt={m.type} className="w-full h-24 object-cover rounded border" />
                <p className="text-xs text-gray-500 mt-1">{m.type.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GPS trail summary */}
      {task.locationLogs && task.locationLogs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-bold mb-1">GPS Logs</h2>
          <p className="text-xs text-gray-500">{task.locationLogs.length} location points recorded</p>
        </div>
      )}

      {/* Payout */}
      {task.payout && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-700">
            Payout: Rs {(task.payout.amountCents / 100).toFixed(0)} — {task.payout.status}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isSubmitted && (
          <>
            <button onClick={handleApprove} disabled={actionLoading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              Approve
            </button>
            <button onClick={() => setShowReject(true)} disabled={actionLoading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              Reject
            </button>
          </>
        )}
        {canCancel && (
          <button onClick={handleCancel} disabled={actionLoading}
            className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50">
            Cancel Task
          </button>
        )}
      </div>

      {showReject && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Why are you rejecting? (min 5 chars)" rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={handleReject} disabled={actionLoading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
              Confirm Reject
            </button>
            <button onClick={() => setShowReject(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
