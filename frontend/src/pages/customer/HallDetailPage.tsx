import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  PhotoIcon,
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !hall) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="mb-3 text-lg text-red-600">{error || 'Hall not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-blue-800 hover:text-blue-900"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">{hall.name}</h1>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-slate-400" />
              Address: {hall.address}, {hall.city}, {hall.state} {hall.zipcode}
            </span>
            {hall.phone && (
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                Phone: {hall.phone}
              </span>
            )}
            {hall.email && (
              <span className="flex items-center gap-1.5">
                <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                Email: {hall.email}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Venues</h2>

        {venues.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-10 text-center shadow-md ring-1 ring-slate-200">
            <p className="text-slate-500">No venues are currently available for this hall.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {venues
              .filter((v) => v.active)
              .map((venue) => (
                <div
                  key={venue.id}
                  className="overflow-hidden rounded-xl bg-white shadow-md ring-2 ring-blue-100 transition-all hover:shadow-lg hover:ring-blue-200"
                >
                  {/* Image placeholder */}
                  <div className="flex h-44 items-center justify-center bg-slate-100">
                    <PhotoIcon className="h-12 w-12 text-slate-300" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#1e3a8a]">{venue.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p><span className="font-semibold">Capacity:</span> Up to {venue.capacity} guests</p>
                      <p><span className="font-semibold">Base Price:</span> ${venue.basePricePerHour}/hr</p>
                      <p><span className="font-semibold">Minimum Booking:</span> Min {venue.minBookingDurationHours} hours</p>
                    </div>

                    {venue.description && (
                      <p className="mt-3 line-clamp-3 text-sm text-slate-500">
                        {venue.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/book/${venue.id}`, { state: { hallId: hall.id } })}
                      className="mt-4 w-full rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
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
        <section className="mx-auto max-w-5xl px-4 pb-8">
          <div className="overflow-hidden rounded-xl bg-[#1e3a8a] shadow-md">
            <button
              type="button"
              onClick={() => setShowTerms(!showTerms)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <h2 className="text-base font-bold text-white">Terms & Conditions</h2>
              <ChevronDownIcon
                className={`h-5 w-5 text-white transition-transform ${
                  showTerms ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showTerms && (
              <div className="bg-white px-6 py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {hall.termsConditions}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} BanquetBook. All rights reserved. | Privacy Policy | Terms of Service
      </footer>
    </div>
  );
}
