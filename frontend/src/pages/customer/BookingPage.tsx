import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { venueApi } from '../../api/venues';
import { bookingApi } from '../../api/bookings';
import { paymentApi } from '../../api/payments';
import { PaymentMode, PaymentType } from '../../types';
import type { Venue } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

interface BookingForm {
  bookingDate: string;
  startTime: string;
  endTime: string;
  paymentMode: 'FULL' | 'INSTALLMENT';
  acceptTerms: boolean;
}

export default function BookingPage() {
  const { venueId: venueIdParam } = useParams<{ venueId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const hallId = (location.state as any)?.hallId as number | undefined;
  const venueId = parseInt(venueIdParam || '0', 10);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    defaultValues: { paymentMode: 'FULL' },
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const paymentMode = watch('paymentMode');

  useEffect(() => {
    if (!hallId || !venueId) {
      setError('Missing booking information. Please select a venue from the hall page.');
      setLoading(false);
      return;
    }

    venueApi
      .get(hallId, venueId)
      .then((res) => setVenue(res.data.data))
      .catch(() => setError('Failed to load venue details.'))
      .finally(() => setLoading(false));
  }, [hallId, venueId]);

  const hours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return diff > 0 ? diff : 0;
  }, [startTime, endTime]);

  const totalAmount = useMemo(() => {
    if (!venue || hours <= 0) return 0;
    return venue.basePricePerHour * hours;
  }, [venue, hours]);

  const payableNow = useMemo(() => {
    if (paymentMode === 'INSTALLMENT') return Math.ceil(totalAmount * 0.5);
    return totalAmount;
  }, [totalAmount, paymentMode]);

  const today = new Date().toISOString().split('T')[0];

  const onSubmit = async (data: BookingForm) => {
    if (!venue || !hallId) return;
    setError('');
    setSubmitting(true);

    try {
      const bookingRes = await bookingApi.create({
        venueId: venue.id,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        paymentMode: data.paymentMode,
      });
      const booking = bookingRes.data.data;
      setCreatedBookingId(booking.id);

      const paymentType =
        data.paymentMode === 'FULL' ? PaymentType.FULL : PaymentType.INSTALLMENT_1;
      const intentRes = await paymentApi.createIntent({
        bookingId: booking.id,
        amount: payableNow,
        paymentType,
      });
      const payment = intentRes.data.data;

      await paymentApi.confirm(payment.stripePaymentIntentId);

      setSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Booking failed. The time slot may already be taken.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Booking Confirmed!</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your booking #{createdBookingId} has been placed successfully.
            {paymentMode === 'INSTALLMENT' && ' The remaining 50% is due before the event.'}
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-left text-sm">
            <p className="text-slate-600">
              <span className="font-medium text-slate-900">Venue:</span> {venue?.name}
            </p>
            <p className="mt-1 text-slate-600">
              <span className="font-medium text-slate-900">Amount Paid:</span> ${payableNow.toLocaleString()}
            </p>
            <p className="mt-1 text-slate-600">
              <span className="font-medium text-slate-900">Total:</span> ${totalAmount.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/my-bookings')}
            className="mt-6 w-full rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (error && !venue) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="mb-3 text-lg text-red-600">{error}</p>
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
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-[#1e3a8a]">Book {venue?.name}</h1>

        {/* Venue Info Bar */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1e3a8a]">Venue Info</p>
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
            <span><span className="font-semibold">{venue?.name}</span></span>
            <span>Capacity: {venue?.capacity} guests</span>
            <span>Price: ${venue?.basePricePerHour}/hr</span>
            <span>Min Booking: {venue?.minBookingDurationHours} hours</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left: Form */}
            <div className="flex-1 space-y-5 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
              {/* Booking Date */}
              <div>
                <label htmlFor="bookingDate" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Booking Date
                </label>
                <input
                  id="bookingDate"
                  type="date"
                  min={today}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                    errors.bookingDate ? 'border-red-400' : 'border-slate-300'
                  }`}
                  {...register('bookingDate', { required: 'Booking date is required' })}
                />
                {errors.bookingDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.bookingDate.message}</p>
                )}
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                      errors.startTime ? 'border-red-400' : 'border-slate-300'
                    }`}
                    {...register('startTime', { required: 'Start time is required' })}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="endTime" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    End Time
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                      errors.endTime ? 'border-red-400' : 'border-slate-300'
                    }`}
                    {...register('endTime', {
                      required: 'End time is required',
                      validate: (value) => {
                        if (!startTime) return true;
                        return value > startTime || 'End time must be after start time';
                      },
                    })}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Payment Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex cursor-pointer flex-col rounded-lg border-2 px-4 py-3 transition-all ${
                      paymentMode === 'FULL'
                        ? 'border-[#1e3a8a] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" value="FULL" className="sr-only" {...register('paymentMode')} />
                    <div className="flex items-center gap-2">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        paymentMode === 'FULL' ? 'border-[#1e3a8a] bg-[#1e3a8a]' : 'border-slate-300'
                      }`}>
                        {paymentMode === 'FULL' && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${paymentMode === 'FULL' ? 'text-[#1e3a8a]' : 'text-slate-700'}`}>
                        Full Payment
                      </span>
                    </div>
                    <span className="mt-1 pl-7 text-xs text-slate-500">Pay the entire amount upfront.</span>
                  </label>
                  <label
                    className={`flex cursor-pointer flex-col rounded-lg border-2 px-4 py-3 transition-all ${
                      paymentMode === 'INSTALLMENT'
                        ? 'border-[#1e3a8a] bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input type="radio" value="INSTALLMENT" className="sr-only" {...register('paymentMode')} />
                    <div className="flex items-center gap-2">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        paymentMode === 'INSTALLMENT' ? 'border-[#1e3a8a] bg-[#1e3a8a]' : 'border-slate-300'
                      }`}>
                        {paymentMode === 'INSTALLMENT' && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${paymentMode === 'INSTALLMENT' ? 'text-[#1e3a8a]' : 'text-slate-700'}`}>
                        Pay in Installments (50%)
                      </span>
                    </div>
                    <span className="mt-1 pl-7 text-xs text-slate-500">Pay 50% now, balance later.</span>
                  </label>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-blue-800"
                  {...register('acceptTerms', { required: 'You must accept the terms & conditions' })}
                />
                <label htmlFor="acceptTerms" className="text-sm text-slate-600">
                  I accept the{' '}
                  <span className="font-medium text-blue-800 underline">Terms & Conditions</span>
                  {' '}and{' '}
                  <span className="font-medium text-blue-800 underline">Cancellation Policy</span>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="-mt-3 text-xs text-red-500">{errors.acceptTerms.message}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || totalAmount <= 0}
                className="w-full rounded-lg bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Processing Payment...' : 'Confirm Booking & Pay'}
              </button>
            </div>

            {/* Right: Booking Summary */}
            <div className="w-full lg:w-72">
              <div className="sticky top-20 rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
                <div className="rounded-t-xl bg-[#1e3a8a] px-5 py-3">
                  <h3 className="text-sm font-bold text-white">Booking Summary</h3>
                </div>
                <div className="space-y-3 p-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-medium text-slate-900">
                      {hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rate:</span>
                    <span className="font-medium text-slate-900">
                      ${venue?.basePricePerHour}/hr
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total:</span>
                      <span className="font-bold text-slate-900">
                        ${totalAmount > 0 ? totalAmount.toLocaleString() : '--'}
                      </span>
                    </div>
                  </div>
                  {totalAmount > 0 && (
                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
                      <p className="text-xs font-semibold text-[#1e3a8a]">Amount Due Now</p>
                      <p className="text-lg font-bold text-[#1e3a8a]">${payableNow.toLocaleString()}</p>
                    </div>
                  )}
                  {hours > 0 && venue && hours < venue.minBookingDurationHours && (
                    <p className="text-xs text-red-500">
                      Minimum {venue.minBookingDurationHours}h booking required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
