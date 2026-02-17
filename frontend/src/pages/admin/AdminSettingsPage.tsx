import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Cog6ToothIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Admin Settings</h1>

        {/* Profile section */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheckIcon className="h-6 w-6 text-[#1e3a8a]" />
            <h2 className="text-lg font-semibold text-slate-900">Admin Profile</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500">Name:</span>{' '}
              <span className="font-medium text-slate-900">{user?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>{' '}
              <span className="font-medium text-slate-900">{user?.phone}</span>
            </div>
            <div>
              <span className="text-slate-500">Email:</span>{' '}
              <span className="font-medium text-slate-900">{user?.email || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-500">Role:</span>{' '}
              <span className="inline-flex rounded bg-[#1e3a8a] px-2 py-0.5 text-xs font-bold text-white">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications section */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-3">
            <BellIcon className="h-6 w-6 text-[#1e3a8a]" />
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">System Notifications</span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-2 focus:ring-blue-800/20"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Email Alerts</span>
              <input
                type="checkbox"
                checked={emailUpdates}
                onChange={(e) => setEmailUpdates(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-2 focus:ring-blue-800/20"
              />
            </label>
          </div>
        </div>

        {/* Platform settings */}
        <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-200">
          <div className="mb-4 flex items-center gap-3">
            <Cog6ToothIcon className="h-6 w-6 text-[#1e3a8a]" />
            <h2 className="text-lg font-semibold text-slate-900">Platform Settings</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Default Approval Mode
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20">
                <option>Manual Review</option>
                <option>Auto-Approve</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Commission Rate (%)
              </label>
              <input
                type="number"
                defaultValue="10"
                min="0"
                max="100"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
