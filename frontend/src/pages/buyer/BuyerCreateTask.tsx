import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { buyerApi } from '../../lib/api';
import { Navigation, ArrowRight } from 'lucide-react';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Textarea, Select } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ErrorMsg, { getErrorMsg } from '../../components/ErrorMsg';

const CATEGORIES = [
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Repair', label: 'Repair' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Other', label: 'Other' },
];

const URGENCY = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function BuyerCreateTask() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', category: 'Cleaning', taskNotes: '', locationText: '',
    lat: '', lng: '', urgency: 'MEDIUM', offeredRate: '', extraNote: '',
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        set('lat', pos.coords.latitude.toFixed(6));
        set('lng', pos.coords.longitude.toFixed(6));
      },
      () => setError('Could not get your location')
    );
  };

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

  return (
    <div>
      <TopBar title="Create Task" showBack />
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <ErrorMsg error={error} />

        <Card>
          <h2 className="text-sm font-bold text-text mb-3">Task Details</h2>
          <div className="space-y-3">
            <Input label="Title" required minLength={3} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Deep clean 2BHK apartment" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" options={CATEGORIES} value={form.category} onChange={(e) => set('category', e.target.value)} />
              <Select label="Urgency" options={URGENCY} value={form.urgency} onChange={(e) => set('urgency', e.target.value)} />
            </div>
            <Textarea label="Task Notes" required minLength={10} rows={3} value={form.taskNotes} onChange={(e) => set('taskNotes', e.target.value)} placeholder="Describe what needs to be done..." />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold text-text mb-3">Location</h2>
          <div className="space-y-3">
            <Input label="Address" required value={form.locationText} onChange={(e) => set('locationText', e.target.value)} placeholder="Street address or landmark" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Latitude" value={form.lat} onChange={(e) => set('lat', e.target.value)} />
              <Input placeholder="Longitude" value={form.lng} onChange={(e) => set('lng', e.target.value)} />
            </div>
            <button type="button" onClick={getLocation} className="flex items-center gap-1.5 text-xs text-primary font-semibold">
              <Navigation size={14} /> Use my current location
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold text-text mb-3">Pricing</h2>
          <Input label="Offered Rate (Rs)" required type="number" min="1" step="1" value={form.offeredRate} onChange={(e) => set('offeredRate', e.target.value)} placeholder="Amount in rupees" />
        </Card>

        <Input label="Extra Note (optional)" value={form.extraNote} onChange={(e) => set('extraNote', e.target.value)} placeholder="Any additional instructions" />

        <Button type="submit" loading={loading} icon={<ArrowRight size={18} />} size="lg">
          Create Task
        </Button>
      </form>
    </div>
  );
}
