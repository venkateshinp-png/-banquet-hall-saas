import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  CalendarDaysIcon, 
  SparklesIcon,
  BuildingOffice2Icon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useGeolocation } from '../../hooks/useGeolocation';

type SearchMode = 'city' | 'pincode' | 'location';

export default function HomePage() {
  const navigate = useNavigate();
  const { getCurrentLocation, loading: locationLoading } = useGeolocation();
  
  const [searchMode, setSearchMode] = useState<SearchMode>('city');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [date, setDate] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchMode === 'city' && city.trim()) {
      params.set('city', city.trim());
    } else if (searchMode === 'pincode' && pincode.trim()) {
      params.set('pincode', pincode.trim());
    }
    if (date) params.set('date', date);
    if (minCapacity) params.set('minCapacity', minCapacity);
    if (maxBudget) params.set('maxBudget', maxBudget);
    navigate(`/search?${params.toString()}`);
  };

  const handleUseCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      const params = new URLSearchParams();
      params.set('lat', location.latitude.toString());
      params.set('lng', location.longitude.toString());
      params.set('radius', '25');
      if (date) params.set('date', date);
      if (minCapacity) params.set('minCapacity', minCapacity);
      if (maxBudget) params.set('maxBudget', maxBudget);
      navigate(`/search?${params.toString()}`);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with enhanced gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 pb-40 pt-24">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2MkgyNHYtMmgxMnptMC00VjI4SDI0djJoMTJ6bS02LTR2MkgyNHYtMmg2eiIvPjwvZz48L2c+PC9zdmc+')]" />
        </div>
        {/* Decorative circles */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur-sm">
            <SparklesIcon className="h-4 w-4" />
            Discover 500+ Premium Venues
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Perfect
            <span className="mt-2 block bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              Banquet Hall
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/90">
            Discover and book stunning venues for your special events. Easy search, instant booking,
            unforgettable celebrations with Veduka.
          </p>
          
          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100/80">
            <span className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
              Verified Venues
            </span>
            <span className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-amber-400" />
              4.8 Average Rating
            </span>
            <span className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-300" />
              Instant Confirmation
            </span>
          </div>
        </div>
      </section>

      {/* Search Card (overlapping hero) */}
      <section className="relative z-10 mx-auto -mt-20 max-w-4xl px-4">
        <form
          onSubmit={handleSearch}
          className="rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/50 backdrop-blur-sm sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <MagnifyingGlassIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Search Venues</h2>
                <p className="text-sm text-slate-500">Find the perfect hall for your event</p>
              </div>
            </div>
            
            {/* Search mode toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSearchMode('city')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  searchMode === 'city' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                City
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('pincode')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  searchMode === 'pincode' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pincode
              </button>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group">
              <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {searchMode === 'city' ? 'City' : 'Pincode'}
              </label>
              {searchMode === 'city' ? (
                <input
                  id="location"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              ) : (
                <input
                  id="location"
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400001"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              )}
            </div>
            <div className="group">
              <label htmlFor="date" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Event Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div className="group">
              <label htmlFor="minCapacity" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Guest Count
              </label>
              <input
                id="minCapacity"
                type="number"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                placeholder="e.g. 100"
                min={1}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div className="group">
              <label htmlFor="maxBudget" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Budget Limit
              </label>
              <input
                id="maxBudget"
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="e.g. 50000"
                min={0}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/50 sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <MagnifyingGlassIcon className="h-5 w-5" />
                Search Halls
              </span>
            </button>
            
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locationLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-6 py-4 text-sm font-semibold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <MapPinIcon className={`h-5 w-5 ${locationLoading ? 'animate-pulse' : ''}`} />
              {locationLoading ? 'Getting Location...' : 'Use Current Location'}
            </button>
          </div>
        </form>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: '500+', label: 'Venues' },
            { value: '50+', label: 'Cities' },
            { value: '10K+', label: 'Events Hosted' },
            { value: '4.8', label: 'Avg Rating' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 text-center shadow-md ring-1 ring-slate-100 transition-transform hover:scale-105">
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="mt-1 text-sm font-medium text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              Simple Process
            </span>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Book your perfect venue in three simple steps
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="group relative rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-100 transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-bold text-white">
                Step 1
              </div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 transition-transform group-hover:scale-110">
                <MagnifyingGlassIcon className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Search</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Browse through hundreds of verified banquet halls filtered by your preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-100 transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-bold text-white">
                Step 2
              </div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 transition-transform group-hover:scale-110">
                <CalendarDaysIcon className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Book</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Pick your date, choose a venue, and book instantly with secure online payment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-100 transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-bold text-white">
                Step 3
              </div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 transition-transform group-hover:scale-110">
                <SparklesIcon className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Celebrate</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Show up and enjoy your event. Everything is taken care of for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <BuildingOffice2Icon className="mx-auto mb-4 h-12 w-12 text-blue-200" />
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Own a Banquet Hall?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100/90">
            List your venue on Veduka and reach thousands of potential customers. 
            Easy management, secure payments, and dedicated support.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="mt-8 rounded-xl bg-white px-8 py-4 text-sm font-bold text-blue-800 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
          >
            Register Your Hall
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-xl font-bold text-slate-900">
            <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
            Veduka
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Veduka. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  );
}
