import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../lib/api';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const CATEGORIES = ['Cleaning', 'Repair', 'Delivery', 'Inspection', 'Maintenance', 'Other'];
const URGENCY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function BuyerCreateTask() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Cleaning',
    taskNotes: '',
    locationText: '',
    lat: '',
    lng: '',
    urgency: 'MEDIUM',
    offeredRate: '',
    extraNote: '',
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await buyerApi.createTask({
        ...form,
        lat: parseFloat(form.lat) || 0,
        lng: parseFloat(form.lng) || 0,
        offeredRate: parseFloat(form.offeredRate) || 0,
        extraNote: form.extraNote || undefined,
      });
      navigate('/buyer/tasks');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        set('lat', pos.coords.latitude.toString());
        set('lng', pos.coords.longitude.toString());
      },
      () => setError('Could not get location')
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMsg error={error} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input required minLength={3} value={form.title} onChange={(e) => set('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select value={form.urgency} onChange={(e) => set('urgency', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {URGENCY.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Notes</label>
          <textarea required minLength={10} rows={3} value={form.taskNotes} onChange={(e) => set('taskNotes', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input required value={form.locationText} onChange={(e) => set('locationText', e.target.value)}
            placeholder="Address or description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input value={form.lat} onChange={(e) => set('lat', e.target.value)} placeholder="Latitude"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input value={form.lng} onChange={(e) => set('lng', e.target.value)} placeholder="Longitude"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="button" onClick={getLocation} className="text-xs text-indigo-600 hover:underline">
          Use my current location
        </button>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Offered Rate (Rs)</label>
          <input required type="number" min="1" step="1" value={form.offeredRate} onChange={(e) => set('offeredRate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Extra Note (optional)</label>
          <input value={form.extraNote} onChange={(e) => set('extraNote', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
