import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { citizenApi } from '../../lib/api';
import { Navigation, Send } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Textarea, Select } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const ISSUE_TYPES = [
  { value: 'Pothole', label: 'Pothole' },
  { value: 'Garbage', label: 'Garbage' },
  { value: 'Water Leak', label: 'Water Leak' },
  { value: 'Street Light', label: 'Street Light' },
  { value: 'Road Damage', label: 'Road Damage' },
  { value: 'Other', label: 'Other' },
];

export default function CitizenCreateReport() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    issueType: 'Pothole', description: '', locationText: '', lat: '', lng: '',
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { set('lat', pos.coords.latitude.toFixed(6)); set('lng', pos.coords.longitude.toFixed(6)); },
      () => setError('Could not get your location')
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
    <div>
      <TopBar title="Report Issue" showBack />
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <ErrorMsg error={error} />

        <Card>
          <div className="space-y-3">
            <Select label="Issue Type" options={ISSUE_TYPES} value={form.issueType} onChange={(e) => set('issueType', e.target.value)} />
            <Textarea label="Description" required minLength={10} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the issue in detail..." />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold text-text mb-3">Location (optional)</h2>
          <div className="space-y-3">
            <Input placeholder="Address or landmark" value={form.locationText} onChange={(e) => set('locationText', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Latitude" value={form.lat} onChange={(e) => set('lat', e.target.value)} />
              <Input placeholder="Longitude" value={form.lng} onChange={(e) => set('lng', e.target.value)} />
            </div>
            <button type="button" onClick={getLocation} className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <Navigation size={14} /> Use my current location
            </button>
          </div>
        </Card>

        <Button type="submit" loading={loading} icon={<Send size={18} />} size="lg">
          Submit Report
        </Button>
      </form>
    </div>
  );
}
