import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { searchApi } from '../../api/search';
import type { Hall, PageResponse } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'popularity', label: 'Popularity' },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Price - Range' },
  { value: '5000', label: 'Under $5,000' },
  { value: '10000', label: 'Under $10,000' },
  { value: '25000', label: 'Under $25,000' },
  { value: '50000', label: 'Under $50,000' },
  { value: '100000', label: 'Under $100,000' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [results, setResults] = useState<PageResponse<Hall> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const city = searchParams.get('city') || '';
  const date = searchParams.get('date') || '';
  const minCapacity = searchParams.get('minCapacity') || '';
  const maxBudget = searchParams.get('maxBudget') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [filterCity, setFilterCity] = useState(city);
  const [filterDate, setFilterDate] = useState(date);
  const [filterMinCapacity, setFilterMinCapacity] = useState(minCapacity);
  const [filterMaxBudget, setFilterMaxBudget] = useState(maxBudget);
  const [filterSort, setFilterSort] = useState(sort);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page: page - 1, size: 9 };
      if (city) params.city = city;
      if (date) params.date = date;
      if (minCapacity) params.minCapacity = minCapacity;
      if (maxBudget) params.maxBudget = maxBudget;
      if (sort) params.sort = sort;

      const res = await searchApi.searchHalls(params);
      setResults(res.data.data);
    } catch {
      setError('Failed to load search results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [city, date, minCapacity, maxBudget, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    setFilterCity(city);
    setFilterDate(date);
    setFilterMinCapacity(minCapacity);
    setFilterMaxBudget(maxBudget);
    setFilterSort(sort);
  }, [city, date, minCapacity, maxBudget, sort]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filterCity.trim()) params.set('city', filterCity.trim());
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
    <div className="min-h-screen bg-slate-50">
      {/* Horizontal Filter Bar */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="px-4 py-4">
          <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3">
            {/* City */}
            <div className="min-w-[130px] flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-600">City</label>
              <input
                type="text"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Enter City"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-800/20"
              />
            </div>

            {/* Date */}
            <div className="min-w-[140px] flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
              <input
                type="date"
                value={filterDate}
                min={today}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-800/20"
              />
            </div>

            {/* Capacity with Guests suffix */}
            <div className="min-w-[140px] flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Capacity</label>
              <div className="flex overflow-hidden rounded-lg border border-slate-300 focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-blue-800/20">
                <input
                  type="number"
                  value={filterMinCapacity}
                  onChange={(e) => setFilterMinCapacity(e.target.value)}
                  placeholder=""
                  min={1}
                  className="w-full border-none px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                />
                <span className="flex items-center border-l border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-500">
                  Guests
                </span>
              </div>
            </div>

            {/* Budget dropdown */}
            <div className="min-w-[140px] flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Budget</label>
              <select
                value={filterMaxBudget}
                onChange={(e) => setFilterMaxBudget(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-800/20"
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
              <label className="mb-1 block text-xs font-semibold text-slate-600">Sort By</label>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-800/20"
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
              className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 px-6 py-10 text-center text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchResults}
              className="mt-3 text-sm font-semibold text-blue-800 hover:text-blue-900"
            >
              Try Again
            </button>
          </div>
        ) : !results || results.content.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-md ring-1 ring-slate-200">
            <MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">No results found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your filters or search in a different city.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.content.map((hall) => (
                <div
                  key={hall.id}
                  className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-slate-200 transition-all hover:shadow-lg hover:ring-blue-200"
                >
                  {/* Image placeholder */}
                  <div className="flex h-40 flex-col items-center justify-center bg-slate-100">
                    <PhotoIcon className="h-10 w-10 text-slate-300" />
                    <span className="mt-1 text-xs text-slate-400">Image Placeholder</span>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-900">{hall.name}</h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-600">
                      {hall.city}, {hall.state}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {hall.address}
                    </p>

                    {/* Bottom row: status + price + link */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 ring-1 ring-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {hall.status}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          $150-$300/hr
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/halls/${hall.id}`)}
                        className="text-xs font-semibold text-[#1e3a8a] hover:underline"
                      >
                        View Details &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {results.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={results.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
