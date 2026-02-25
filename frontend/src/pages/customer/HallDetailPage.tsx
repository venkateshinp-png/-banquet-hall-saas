import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { hallApi } from '../../api/halls';
import { venueApi } from '../../api/venues';
import type { Hall, Venue } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hall, setHall] = useState<Hall | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (!id) return;
    const hallId = parseInt(id, 10);
    setLoading(true);
    setError('');

    Promise.all([hallApi.get(hallId), venueApi.getByHall(hallId)])
      .then(([hallRes, venuesRes]) => {
        setHall(hallRes.data.data);
        setVenues(venuesRes.data.data);
      })
      .catch(() => setError('Failed to load hall details. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500">Loading venue details...</p>
      </div>
    );
  }

  if (error || !hall) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <BuildingOffice2Icon className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Venue Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">{error || 'This venue may have been removed or is unavailable.'}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900">
        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-6xl px-4 py-12">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-blue-200 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Search
          </button>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  Verified Venue
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                  4.8 Rating
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-white md:text-5xl">{hall.name}</h1>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
                <span className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  {hall.address}, {hall.city}, {hall.state} {hall.zipcode}
                </span>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3">
                {hall.phone && (
                  <a
                    href={`tel:${hall.phone}`}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {hall.phone}
                  </a>
                )}
                {hall.email && (
                  <a
                    href={`mailto:${hall.email}`}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    {hall.email}
                  </a>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="rounded-2xl bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">{venues.filter(v => v.active).length}</div>
                <div className="text-xs text-blue-200">Venues</div>
              </div>
              <div className="rounded-2xl bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
                <div className="text-3xl font-bold text-white">
                  {Math.max(...venues.map(v => v.capacity), 0)}
                </div>
                <div className="text-xs text-blue-200">Max Capacity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      {hall.description && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <h2 className="mb-3 text-lg font-bold text-slate-900">About This Venue</h2>
            <p className="leading-relaxed text-slate-600">{hall.description}</p>
          </div>
        </section>
      )}

      {/* Venues */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Available Spaces</h2>
            <p className="mt-1 text-sm text-slate-500">Choose from {venues.filter(v => v.active).length} venue{venues.filter(v => v.active).length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {venues.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-lg ring-1 ring-slate-200">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <BuildingOffice2Icon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Venues Available</h3>
            <p className="mt-2 text-sm text-slate-500">This hall currently has no venues listed. Please check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues
              .filter((v) => v.active)
              .map((venue, index) => (
                <div
                  key={venue.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image placeholder with gradient */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100">
                    <div className="flex h-full flex-col items-center justify-center">
                      <BuildingOffice2Icon className="h-16 w-16 text-blue-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {/* Price tag */}
                    <div className="absolute right-3 top-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                      <span className="text-lg font-bold text-blue-600">${venue.basePricePerHour}</span>
                      <span className="text-xs text-slate-500">/hr</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                      {venue.name}
                    </h3>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <UsersIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-slate-600">Up to <strong>{venue.capacity}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-slate-600">Min <strong>{venue.minBookingDurationHours}h</strong></span>
                      </div>
                    </div>

                    {venue.description && (
                      <p className="mt-4 line-clamp-2 text-sm text-slate-500">
                        {venue.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/book/${venue.id}`, { state: { hallId: hall.id } })}
                      className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/40"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Terms & Conditions */}
      {hall.termsConditions && (
        <section className="mx-auto max-w-6xl px-4 pb-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 shadow-xl">
            <button
              type="button"
              onClick={() => setShowTerms(!showTerms)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheckIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Terms & Conditions</h2>
              </div>
              <ChevronDownIcon
                className={`h-5 w-5 text-white transition-transform duration-300 ${
                  showTerms ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${showTerms ? 'max-h-96' : 'max-h-0'}`}>
              <div className="border-t border-white/10 bg-white px-6 py-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {hall.termsConditions}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
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
