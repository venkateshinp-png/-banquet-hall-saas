import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { bookingApi } from '../../api/bookings';
import { paymentApi } from '../../api/payments';
import { BookingStatus } from '../../types';
import type { Booking } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: BookingStatus.PENDING, label: 'Pending' },
  { value: BookingStatus.CONFIRMED, label: 'Confirmed' },
  { value: BookingStatus.CANCELLED, label: 'Cancelled' },
  { value: BookingStatus.COMPLETED, label: 'Completed' },
];

export default function BookingManagementPage() {
  const { hallId: hallIdParam } = useParams<{ hallId: string }>();
  const hallId = parseInt(hallIdParam || '0', 10);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Refund modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundBookingId, setRefundBookingId] = useState<number | null>(null);
  const [refunding, setRefunding] = useState(false);

  const cancelForm = useForm<{ reason: string }>();
  const refundForm = useForm<{ amount: number }>();

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await bookingApi.getByHall(hallId);
      setBookings(res.data.data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hallId) fetchBookings();
  }, [hallId]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'ALL') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const openCancelModal = (bookingId: number) => {
    setCancelBookingId(bookingId);
    cancelForm.reset({ reason: '' });
    setCancelModalOpen(true);
  };

  const handleCancel = async (data: { reason: string }) => {
    if (!cancelBookingId) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(cancelBookingId, data.reason);
      setCancelModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to cancel booking.';
      setError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const openRefundModal = (bookingId: number) => {
    setRefundBookingId(bookingId);
    refundForm.reset({ amount: 0 });
    setRefundModalOpen(true);
  };

  const handleRefund = async (data: { amount: number }) => {
    if (!refundBookingId) return;
    setRefunding(true);
    try {
      await paymentApi.refund(refundBookingId, data.amount);
      setRefundModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to process refund.';
      setError(msg);
    } finally {
      setRefunding(false);
    }
  };

  const canCancel = (status: BookingStatus) =>
    status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED;

  const canRefund = (status: BookingStatus) =>
    status === BookingStatus.CONFIRMED || status === BookingStatus.CANCELLED;

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
            <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage bookings for your hall
            </p>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-md ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold text-slate-700">No bookings found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter !== 'ALL'
                ? 'No bookings match the selected filter.'
                : 'No bookings have been made yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 font-semibold text-slate-600">Customer</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Venue</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Date</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Time</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Amount</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Paid</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                    <th className="px-5 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {booking.customerName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {booking.venueName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {booking.bookingDate}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                        {booking.startTime} – {booking.endTime}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        ₹{booking.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        ₹{booking.paidAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          {canCancel(booking.status) && (
                            <button
                              type="button"
                              onClick={() => openCancelModal(booking.id)}
                              className="rounded px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                          {canRefund(booking.status) && (
                            <button
                              type="button"
                              onClick={() => openRefundModal(booking.id)}
                              className="rounded px-2.5 py-1 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-50"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Booking"
        >
          <form onSubmit={cancelForm.handleSubmit(handleCancel)} className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to cancel this booking? Please provide a reason.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Cancellation Reason *
              </label>
              <textarea
                rows={3}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                  cancelForm.formState.errors.reason ? 'border-red-400' : 'border-slate-300'
                }`}
                placeholder="Enter reason for cancellation..."
                {...cancelForm.register('reason', {
                  required: 'Cancellation reason is required',
                })}
              />
              {cancelForm.formState.errors.reason && (
                <p className="mt-1 text-xs text-red-500">
                  {cancelForm.formState.errors.reason.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={cancelling}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Refund Modal */}
        <Modal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          title="Process Refund"
        >
          <form onSubmit={refundForm.handleSubmit(handleRefund)} className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter the amount to refund to the customer.
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Refund Amount (₹) *
              </label>
              <input
                type="number"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                  refundForm.formState.errors.amount ? 'border-red-400' : 'border-slate-300'
                }`}
                placeholder="Enter refund amount"
                {...refundForm.register('amount', {
                  required: 'Refund amount is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Amount must be at least ₹1' },
                })}
              />
              {refundForm.formState.errors.amount && (
                <p className="mt-1 text-xs text-red-500">
                  {refundForm.formState.errors.amount.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={refunding}
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refunding ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
