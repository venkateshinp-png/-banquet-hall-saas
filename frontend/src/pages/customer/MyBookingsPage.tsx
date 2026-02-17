import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { bookingApi } from '../../api/bookings';
import { BookingStatus } from '../../types';
import type { Booking } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

function BookingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-emerald-500 text-white',
    PENDING: 'bg-amber-400 text-white',
    COMPLETED: 'bg-slate-500 text-white',
    CANCELLED: 'bg-red-500 text-white',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ${styles[status] || 'bg-slate-200 text-slate-700'}`}>
      {status}
    </span>
  );
}

export default function MyBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getMy();
      setBookings(res.data.data);
    } catch {
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking: Booking) => {
    setCancelTarget(booking);
    setCancelReason('');
    setCancelError('');
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setCancelReason('');
    setCancelError('');
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      setCancelError('Please provide a reason for cancellation.');
      return;
    }

    setCancelling(true);
    setCancelError('');
    try {
      await bookingApi.cancel(cancelTarget.id, cancelReason.trim());
      closeCancelModal();
      fetchBookings();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to cancel booking. Please try again.';
      setCancelError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (status: BookingStatus) =>
    status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[#1e3a8a]">My Bookings</h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
            <button
              type="button"
              onClick={fetchBookings}
              className="ml-2 font-semibold text-blue-800 hover:text-blue-900"
            >
              Retry
            </button>
          </div>
        )}

        {bookings.length === 0 && !error ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-md ring-1 ring-slate-200">
            <CalendarDaysIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">No bookings yet</h3>
            <p className="mt-1 text-sm text-slate-500">Start searching for the perfect venue!</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 inline-flex rounded-lg bg-[#1e3a8a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
            >
              Search Halls
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200 md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1e3a8a] text-white">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Hall Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Venue</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Time</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">Paid</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-900">{b.hallName}</td>
                      <td className="px-5 py-4 text-slate-600">{b.venueName}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(b.bookingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        ${b.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-600">
                        ${b.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        {canCancel(b.status) ? (
                          <button
                            type="button"
                            onClick={() => openCancelModal(b)}
                            className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="space-y-4 md:hidden">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{b.hallName}</h3>
                      <p className="text-sm text-slate-500">{b.venueName}</p>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Date</span>
                      <p className="font-medium text-slate-700">{b.bookingDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Time</span>
                      <p className="font-medium text-slate-700">
                        {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Amount</span>
                      <p className="font-medium text-slate-900">${b.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Paid</span>
                      <p className="font-medium text-slate-600">${b.paidAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {canCancel(b.status) && (
                    <button
                      type="button"
                      onClick={() => openCancelModal(b)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={closeCancelModal}
        title="Cancel Booking"
      >
        <p className="mb-4 text-sm text-slate-600">
          Are you sure you want to cancel your booking at{' '}
          <span className="font-semibold text-slate-900">{cancelTarget?.hallName}</span>{' '}
          ({cancelTarget?.venueName}) on {cancelTarget?.bookingDate}?
        </p>

        {cancelError && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {cancelError}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="cancelReason" className="mb-1.5 block text-sm font-medium text-slate-700">
            Reason for cancellation
          </label>
          <textarea
            id="cancelReason"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={closeCancelModal}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
