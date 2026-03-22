import { AxiosError } from 'axios';

export function getErrorMsg(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data?.error?.message) {
    return err.response.data.error.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export default function ErrorMsg({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
      {error}
    </div>
  );
}
