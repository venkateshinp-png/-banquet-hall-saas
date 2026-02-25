import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, BuildingOffice2Icon, UsersIcon, StarIcon, AdjustmentsHorizontalIcon, ArrowTopRightOnSquareIcon, ShieldCheckIcon, Squares2X2Icon, MapIcon } from '@heroicons/react/24/outline';
import { searchApi } from '../../api/search';
import type { Hall, PageResponse, ExternalHall } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const VenueMap = lazy(() => import('../../components/VenueMap'));

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Any Budget' },
  { value: '5000', label: 'Under $5,000' },
  { value: '10000', label: 'Under $10,000' },
  { value: '25000', label: 'Under $25,000' },
  { value: '50000', label: 'Under $50,000' },
  { value: '100000', label: 'Under $100,000' },
];

type ViewMode = 'list' | 'map';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [results, setResults] = useState<PageResponse<Hall> | null>(null);
  const [externalHalls, setExternalHalls] = useState<ExternalHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const city = searchParams.get('city') || '';
  const pincode = searchParams.get('pincode') || '';
  const lat = searchParams.get('lat') || '';
  const lng = searchParams.get('lng') || '';
  const radius = searchParams.get('radius') || '';
  const date = searchParams.get('date') || '';
  const minCapacity = searchParams.get('minCapacity') || '';
  const maxBudget = searchParams.get('maxBudget') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const isLocationSearch = lat && lng;

  const [filterCity, setFilterCity] = useState(city || pincode);
  const [filterDate, setFilterDate] = useState(date);
  const [filterMinCapacity, setFilterMinCapacity] = useState(minCapacity);
  const [filterMaxBudget, setFilterMaxBudget] = useState(maxBudget);
  const [filterSort, setFilterSort] = useState(sort);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    setExternalHalls([]);
    try {
      const params: Record<string, any> = { page: page - 1, size: 9 };
      if (lat && lng) {
        params.latitude = lat;
        params.longitude = lng;
        if (radius) params.radius = radius;
      } else if (pincode) {
        params.pincode = pincode;
      } else if (city) {
        params.city = city;
      }
      if (date) params.date = date;
      if (minCapacity) params.minCapacity = minCapacity;
      if (maxBudget) params.maxBudget = maxBudget;
      if (sort) params.sort = sort;

      const res = await searchApi.searchHalls(params);
      setResults(res.data.data);

      if (lat && lng && res.data.data.content.length < 6) {
        try {
          const externalRes = await searchApi.searchExternalHalls(
            parseFloat(lat), 
            parseFloat(lng), 
            radius ? parseInt(radius) * 1000 : 10000
          );
          setExternalHalls(externalRes.data.data || []);
        } catch {
          console.warn('Failed to load external halls');
        }
      }
    } catch {
      setError('Failed to load search results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [city, pincode, lat, lng, radius, date, minCapacity, maxBudget, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    setFilterCity(city || pincode);
    setFilterDate(date);
    setFilterMinCapacity(minCapacity);
    setFilterMaxBudget(maxBudget);
    setFilterSort(sort);
  }, [city, pincode, date, minCapacity, maxBudget, sort]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filterCity.trim()) {
      if (/^\d{5,6}$/.test(filterCity.trim())) {
        params.set('pincode', filterCity.trim());
      } else {
        params.set('city', filterCity.trim());
      }
    }
    if (filterDate) params.set('date', filterDate);
    if (filterMinCapacity) params.set('minCapacity', filterMinCapacity);
    if (filterMaxBudget) params.set('maxBudget', filterMaxBudget);
    if (filterSort) params.set('sort', filterSort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      {/* Enhanced Filter Bar */}
      <div className="sticky top-14 z-30 border-b border-slate-200 bg-white/95 shadow-md backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3">
            {/* City */}
            <div className="min-w-[130px] flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <MapPinIcon className="h-3.5 w-3.5" />
                Location
              </label>
              <input
                type="text"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Enter city"
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Date */}
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Event Date</label>
              <input
                type="date"
                value={filterDate}
                min={today}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Capacity */}
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <UsersIcon className="h-3.5 w-3.5" />
                Guests
              </label>
              <input
                type="number"
                value={filterMinCapacity}
                onChange={(e) => setFilterMinCapacity(e.target.value)}
                placeholder="Min guests"
                min={1}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Budget dropdown */}
            <div className="min-w-[150px] flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Budget</label>
              <select
                value={filterMaxBudget}
                onChange={(e) => setFilterMaxBudget(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="min-w-[160px] flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <AdjustmentsHorizontalIcon className="h-3.5 w-3.5" />
                Sort By
              </label>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Results header */}
        {results && results.content.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isLocationSearch ? (
                  <span className="flex items-center gap-2">
                    <MapPinIcon className="h-6 w-6 text-blue-600" />
                    Venues Near You
                  </span>
                ) : city ? (
                  `Venues in ${city}`
                ) : pincode ? (
                  `Venues in ${pincode}`
                ) : (
                  'All Venues'
                )}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {results.totalElements} venue{results.totalElements !== 1 ? 's' : ''} found
                {isLocationSearch && radius && ` within ${radius}km`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isLocationSearch && (
                <button
                  type="button"
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear location
                </button>
              )}
              {/* View mode toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    viewMode === 'map' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  Map
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-slate-500">Searching for venues...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 px-6 py-12 text-center ring-1 ring-red-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <MagnifyingGlassIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchResults}
              className="mt-4 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : !results || results.content.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-lg ring-1 ring-slate-100">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <BuildingOffice2Icon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No venues found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              We couldn't find any venues matching your criteria. Try adjusting your filters or search in a different location.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterCity('');
                setFilterDate('');
                setFilterMinCapacity('');
                setFilterMaxBudget('');
                setSearchParams(new URLSearchParams());
              }}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Map View */}
            {viewMode === 'map' && (
              <div className="mb-8">
                <Suspense fallback={
                  <div className="flex h-[500px] items-center justify-center rounded-2xl bg-slate-100">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <VenueMap 
                    halls={results.content}
                    externalHalls={externalHalls}
                    userLocation={isLocationSearch ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null}
                  />
                </Suspense>
              </div>
            )}

            {/* List View */}
            <div className={viewMode === 'map' ? 'mt-6' : ''}>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.content.map((hall, index) => (
                  <div
                    key={hall.id}
                    className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image placeholder with gradient overlay */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100">
                      <div className="flex h-full flex-col items-center justify-center">
                        <BuildingOffice2Icon className="h-16 w-16 text-slate-300" />
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      {/* Partner badge */}
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                          <ShieldCheckIcon className="h-3.5 w-3.5" />
                          Partner Venue
                        </span>
                      </div>
                      {/* Distance badge */}
                      {hall.distance !== null && (
                        <div className="absolute right-3 top-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow backdrop-blur-sm">
                            <MapPinIcon className="h-3.5 w-3.5 text-blue-600" />
                            {hall.distance} km
                          </span>
                        </div>
                      )}
                      {/* Quick view button */}
                      <button
                        type="button"
                        onClick={() => navigate(`/halls/${hall.id}`)}
                        className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-4 py-2 text-xs font-bold text-slate-900 opacity-0 shadow-lg backdrop-blur-sm transition-all group-hover:opacity-100"
                      >
                        View Details
                      </button>
                    </div>

                    {/* Card body */}
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                            {hall.name}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                            <MapPinIcon className="h-4 w-4" />
                            {hall.city}, {hall.state}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
                          <StarIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-bold text-amber-700">4.8</span>
                        </div>
                      </div>

                      <p className="mb-4 line-clamp-2 text-sm text-slate-500">
                        {hall.description || hall.address}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <span className="text-xs text-slate-400">Starting from</span>
                          <p className="text-lg font-bold text-slate-900">$150<span className="text-sm font-normal text-slate-500">/hr</span></p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/halls/${hall.id}`)}
                          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {results.totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={results.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* External Halls from Google Places */}
            {externalHalls.length > 0 && (
              <div className="mt-12">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">More Venues Nearby</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Additional venues found via Google Maps. Contact directly to book.
                  </p>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {externalHalls.map((hall) => (
                    <div
                      key={hall.placeId}
                      className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Image placeholder */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100">
                        <div className="flex h-full flex-col items-center justify-center">
                          <BuildingOffice2Icon className="h-16 w-16 text-slate-300" />
                        </div>
                        {/* External badge */}
                        <div className="absolute left-3 top-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            Listed Venue
                          </span>
                        </div>
                        {hall.openNow !== null && (
                          <div className="absolute right-3 top-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                              hall.openNow ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {hall.openNow ? 'Open Now' : 'Closed'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {hall.name}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                              <MapPinIcon className="h-4 w-4" />
                              {hall.address}
                            </p>
                          </div>
                          {hall.rating && (
                            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
                              <StarIcon className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-bold text-amber-700">{hall.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {hall.userRatingsTotal && (
                          <p className="mb-4 text-sm text-slate-500">
                            {hall.userRatingsTotal} review{hall.userRatingsTotal !== 1 ? 's' : ''} on Google
                          </p>
                        )}

                        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                          <a
                            href={hall.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            Get Directions
                          </a>
                          {hall.phoneNumber && (
                            <a
                              href={`tel:${hall.phoneNumber}`}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100"
                            >
                              Contact
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
