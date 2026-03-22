import { AxiosError } from 'axios';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export function getErrorMsg(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data?.error?.message) {
    return err.response.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export default function ErrorMsg({ error, onDismiss }: { error: string | null; onDismiss?: () => void }) {
  const [dismissed, setDismissed] = useState(false);

  if (!error || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-danger-light border border-red-200 text-danger text-sm px-4 py-3 rounded-xl flex items-start gap-2">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1">{error}</p>
      <button onClick={handleDismiss} className="shrink-0 mt-0.5">
        <X size={16} />
      </button>
    </div>
  );
}
