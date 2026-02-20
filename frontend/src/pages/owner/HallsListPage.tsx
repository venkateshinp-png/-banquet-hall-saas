import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { hallApi } from '../../api/halls';
import type { Hall } from '../../types';
import { PhotoIcon, MapPinIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-700' },
    APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700' },
    ON_HOLD: { bg: 'bg-slate-100', text: 'text-slate-700' },
  };
  const { bg, text } = config[status] || config.PENDING;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${bg} ${text}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default function HallsListPage() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await hallApi.getOwnerHalls();
        setHalls(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch halls:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Halls</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your registered banquet halls
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/owner/halls/new')}
            className="rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
          >
            + Register New Hall
          </button>
        </div>

        {halls.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-12 text-center shadow-md ring-1 ring-slate-200">
            <p className="text-slate-500">No halls registered yet.</p>
            <button
              type="button"
              onClick={() => navigate('/owner/halls/new')}
              className="mt-4 rounded-lg bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              Register Your First Hall
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {halls.map((hall) => (
              <div
                key={hall.id}
                className="group overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200 transition-all hover:shadow-lg"
              >
                <div className="relative flex h-40 items-center justify-center bg-slate-100">
                  <PhotoIcon className="h-12 w-12 text-slate-300" />
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={hall.status} />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-900">{hall.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPinIcon className="h-4 w-4 shrink-0" />
                    {hall.city}, {hall.state}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/owner/halls/${hall.id}/venues`)}
                      className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      Manage Venues
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/owner/halls/${hall.id}/bookings`)}
                      className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      View Bookings
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/owner/halls/${hall.id}/staff`)}
                    className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    Manage Staff
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
