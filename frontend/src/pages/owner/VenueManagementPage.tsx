import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { hallApi } from '../../api/halls';
import { venueApi } from '../../api/venues';
import type { Hall, Venue } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

interface VenueFormData {
  name: string;
  description: string;
  capacity: number;
  basePricePerHour: number;
  minBookingDurationHours: number;
}

export default function VenueManagementPage() {
  const { hallId: hallIdParam } = useParams<{ hallId: string }>();
  const hallId = parseInt(hallIdParam || '0', 10);

  const [hall, setHall] = useState<Hall | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VenueFormData>();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [hallRes, venueRes] = await Promise.all([
        hallApi.get(hallId),
        venueApi.getByHall(hallId),
      ]);
      setHall(hallRes.data.data);
      setVenues(venueRes.data.data);
    } catch {
      setError('Failed to load hall and venue data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hallId) fetchData();
  }, [hallId]);

  const openCreateModal = () => {
    setEditingVenue(null);
    reset({ name: '', description: '', capacity: 0, basePricePerHour: 0, minBookingDurationHours: 1 });
    setModalOpen(true);
  };

  const openEditModal = (venue: Venue) => {
    setEditingVenue(venue);
    reset({
      name: venue.name,
      description: venue.description,
      capacity: venue.capacity,
      basePricePerHour: venue.basePricePerHour,
      minBookingDurationHours: venue.minBookingDurationHours,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: VenueFormData) => {
    setSubmitting(true);
    setError('');
    try {
      if (editingVenue) {
        await venueApi.update(hallId, editingVenue.id, data);
      } else {
        await venueApi.create(hallId, data);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Operation failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof VenueFormData) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
      errors[field] ? 'border-red-400' : 'border-slate-300'
    }`;

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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {hall?.name || 'Hall'}
              </h1>
              {hall && <StatusBadge status={hall.status} />}
            </div>
            <p className="mt-1 text-sm text-slate-500">Manage venues for this hall</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Venue
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Venues */}
        {venues.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-md ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">No venues yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add your first venue to start accepting bookings.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 font-semibold text-slate-600">Name</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Capacity</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Price/Hour</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Min Duration</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {venues.map((venue) => (
                    <tr key={venue.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{venue.name}</p>
                        {venue.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {venue.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{venue.capacity}</td>
                      <td className="px-6 py-4 text-slate-700">
                        ₹{venue.basePricePerHour.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {venue.minBookingDurationHours}h
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            venue.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {venue.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => openEditModal(venue)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-50"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Venue Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingVenue ? 'Edit Venue' : 'Add New Venue'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Venue Name *
              </label>
              <input
                type="text"
                className={inputClass('name')}
                placeholder="e.g. Grand Ballroom"
                {...register('name', { required: 'Venue name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={2}
                className={inputClass('description')}
                placeholder="Describe the venue..."
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Capacity *
                </label>
                <input
                  type="number"
                  className={inputClass('capacity')}
                  placeholder="e.g. 200"
                  {...register('capacity', {
                    required: 'Capacity is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be at least 1' },
                  })}
                />
                {errors.capacity && (
                  <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Price/Hour (₹) *
                </label>
                <input
                  type="number"
                  className={inputClass('basePricePerHour')}
                  placeholder="e.g. 5000"
                  {...register('basePricePerHour', {
                    required: 'Price is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be at least 1' },
                  })}
                />
                {errors.basePricePerHour && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.basePricePerHour.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Min Booking Duration (hours) *
              </label>
              <input
                type="number"
                className={inputClass('minBookingDurationHours')}
                placeholder="e.g. 2"
                {...register('minBookingDurationHours', {
                  required: 'Min duration is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be at least 1 hour' },
                })}
              />
              {errors.minBookingDurationHours && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.minBookingDurationHours.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving...' : editingVenue ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
