import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, CalendarDaysIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (date) params.set('date', date);
    if (minCapacity) params.set('minCapacity', minCapacity);
    if (maxBudget) params.set('maxBudget', maxBudget);
    navigate(`/search?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-800 to-blue-600 pb-32 pt-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptLTYtNHYySDI0di0yaDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Perfect Banquet Hall
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Discover and book stunning venues for your special events. Easy search, instant booking,
            unforgettable celebrations.
          </p>
        </div>
      </section>

      {/* Search Card (overlapping hero) */}
      <section className="relative z-10 mx-auto -mt-16 max-w-4xl px-4">
        <form
          onSubmit={handleSearch}
          className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-slate-700">
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
              />
            </div>
            <div>
              <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
              />
            </div>
            <div>
              <label htmlFor="minCapacity" className="mb-1.5 block text-sm font-medium text-slate-700">
                Min Capacity
              </label>
              <input
                id="minCapacity"
                type="number"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                placeholder="e.g. 100"
                min={1}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
              />
            </div>
            <div>
              <label htmlFor="maxBudget" className="mb-1.5 block text-sm font-medium text-slate-700">
                Max Budget
              </label>
              <input
                id="maxBudget"
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="e.g. 50000"
                min={0}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800/50 focus:ring-offset-2 sm:w-auto"
          >
            Search Halls
          </button>
        </form>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          How it works
        </h2>
        <p className="mb-12 text-center text-slate-500">
          Book your perfect venue in three simple steps
        </p>

        <div className="grid gap-8 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-xl bg-white p-6 text-center shadow-md ring-1 ring-slate-100">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-800">
              <MagnifyingGlassIcon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Search</h3>
            <p className="text-sm text-slate-500">
              Browse through hundreds of verified banquet halls filtered by your preferences.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl bg-white p-6 text-center shadow-md ring-1 ring-slate-100">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-800">
              <CalendarDaysIcon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Book</h3>
            <p className="text-sm text-slate-500">
              Pick your date, choose a venue, and book instantly with secure online payment.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl bg-white p-6 text-center shadow-md ring-1 ring-slate-100">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-800">
              <SparklesIcon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Celebrate</h3>
            <p className="text-sm text-slate-500">
              Show up and enjoy your event. Everything is taken care of for you.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
