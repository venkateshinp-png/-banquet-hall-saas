import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { hallApi } from '../../api/halls';
import type { Hall } from '../../types';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [pendingHalls, setPendingHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    hallApi
      .getPending()
      .then((res) => setPendingHalls(res.data.data))
      .catch(() => setError('Failed to load pending registrations.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.fullName || 'Admin'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <ClipboardDocumentListIcon className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending Registrations</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pendingHalls.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>

          <Link
            to="/admin/approvals"
            className="group flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-800" />
              </div>
              <div>
                <p className="font-medium text-slate-900 group-hover:text-blue-800">
                  Review Registrations
                </p>
                <p className="text-sm text-slate-500">
                  {pendingHalls.length > 0
                    ? `${pendingHalls.length} hall${pendingHalls.length > 1 ? 's' : ''} awaiting review`
                    : 'No pending registrations'}
                </p>
              </div>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-800" />
          </Link>
        </div>
      </div>
    </div>
  );
}
