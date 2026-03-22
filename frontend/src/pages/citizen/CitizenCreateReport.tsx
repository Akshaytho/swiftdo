import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { citizenApi } from '../../lib/api';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const ISSUE_TYPES = ['Pothole', 'Garbage', 'Water Leak', 'Street Light', 'Road Damage', 'Other'];

export default function CitizenCreateReport() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    issueType: 'Pothole',
    description: '',
    locationText: '',
    lat: '',
    lng: '',
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        set('lat', pos.coords.latitude.toString());
        set('lng', pos.coords.longitude.toString());
      },
      () => setError('Could not get location')
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await citizenApi.createReport({
        issueType: form.issueType,
        description: form.description,
        locationText: form.locationText || undefined,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
      });
      navigate('/citizen/reports');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Report an Issue</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMsg error={error} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
          <select value={form.issueType} onChange={(e) => set('issueType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea required minLength={10} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the issue in detail..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
          <input value={form.locationText} onChange={(e) => set('locationText', e.target.value)}
            placeholder="Address or landmark"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
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

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
