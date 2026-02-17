import { useState } from 'react';
import { ChartBarIcon, CalendarDaysIcon, BanknotesIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Platform Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            View platform-wide analytics and insights
          </p>
        </div>

        {/* Period selector */}
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              period === 'weekly'
                ? 'bg-[#1e3a8a] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              period === 'monthly'
                ? 'bg-[#1e3a8a] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPeriod('yearly')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              period === 'yearly'
                ? 'bg-[#1e3a8a] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <BuildingOffice2Icon className="h-6 w-6 text-[#1e3a8a]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Halls</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <CalendarDaysIcon className="h-6 w-6 text-[#1e3a8a]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-3">
                <BanknotesIcon className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Platform Revenue</p>
                <p className="text-2xl font-bold text-slate-900">$0</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-3">
                <ChartBarIcon className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Avg Transaction</p>
                <p className="text-2xl font-bold text-slate-900">$0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for chart */}
        <div className="rounded-xl bg-white p-8 text-center shadow-md ring-1 ring-slate-200">
          <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <p className="text-lg font-semibold text-slate-700">No data available</p>
          <p className="mt-1 text-sm text-slate-500">
            Platform reports will appear here once you have data
          </p>
        </div>
      </div>
    </div>
  );
}
