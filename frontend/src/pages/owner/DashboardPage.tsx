import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  ClockIcon,
  PlusIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { hallApi } from '../../api/halls';
import { HallStatus } from '../../types';
import type { Hall } from '../../types';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    hallApi
      .getMy()
      .then((res) => setHalls(res.data.data))
      .catch(() => setError('Failed to load your halls. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const pendingApprovals = halls.filter(
    (h) => h.status === HallStatus.PENDING
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Owner Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {user?.fullName || 'Owner'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/owner/halls/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
          >
            <PlusIcon className="h-5 w-5" />
            Register New Hall
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <BuildingOffice2Icon className="h-6 w-6 text-[#1e3a8a]" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Halls:</p>
                <p className="text-3xl font-bold text-slate-900">{halls.length}</p>
                <p className="text-xs text-slate-400">in operation</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <MapPinIcon className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Venues:</p>
                <p className="text-3xl font-bold text-slate-900">
                  {halls.reduce((sum, h) => sum + (h.documents?.length || 0), 0)}
                </p>
                <p className="text-xs text-slate-400">across {halls.length} halls</p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 shadow-md ring-1 ${
            pendingApprovals > 0
              ? 'bg-amber-50 ring-amber-200'
              : 'bg-white ring-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <ClockIcon className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Pending Approvals:</p>
                <p className="text-3xl font-bold text-slate-900">{pendingApprovals}</p>
                <p className="text-xs text-slate-400">awaiting review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* My Halls */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">My Halls</h2>
        </div>

        {halls.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-md ring-1 ring-slate-200">
            <BuildingOffice2Icon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">No halls registered yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Get started by registering your first banquet hall.
            </p>
            <button
              type="button"
              onClick={() => navigate('/owner/halls/new')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              <PlusIcon className="h-5 w-5" />
              Register New Hall
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {halls.map((hall) => (
              <div
                key={hall.id}
                className="group overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200 transition-all hover:shadow-lg"
              >
                {/* Image placeholder with status badge */}
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
                    {hall.city}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/owner/halls/${hall.id}/venues`}
                      className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      Manage Venues
                    </Link>
                    <Link
                      to={`/owner/halls/${hall.id}/bookings`}
                      className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      View Bookings
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
