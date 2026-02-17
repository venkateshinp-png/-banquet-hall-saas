import { useEffect, useState } from 'react';
import { bookingApi } from '../../api/bookings';
import type { Booking } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

function BookingStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-700' },
    CONFIRMED: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
    COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  };
  const { bg, text } = config[status] || config.PENDING;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${bg} ${text}`}>
      {status}
    </span>
  );
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingApi.getAll();
        setBookings(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">All Bookings</h1>

        {bookings.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-12 text-center shadow-md ring-1 ring-slate-200">
            <p className="text-slate-500">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e3a8a] text-white">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Hall/Venue
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{booking.hallName}</div>
                      <div className="text-xs text-slate-500">{booking.venueName}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{booking.customerName || 'N/A'}</td>
                    <td className="px-5 py-4 text-slate-700">{booking.bookingDate}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      ${booking.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
