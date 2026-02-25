import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserCircleIcon, BuildingOffice2Icon, SparklesIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RegisterForm {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'CUSTOMER' | 'OWNER';
}

function getRedirectPath(role: UserRole): string {
  switch (role) {
    case UserRole.CUSTOMER:
      return '/';
    case UserRole.OWNER:
      return '/owner/dashboard';
    default:
      return '/';
  }
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({ defaultValues: { role: 'CUSTOMER' } });

  const password = watch('password');
  const selectedRole = watch('role');

  useEffect(() => {
    if (!auth.loading && auth.user) {
      navigate(getRedirectPath(auth.user.role), { replace: true });
    }
  }, [auth.loading, auth.user, navigate]);

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.register({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        role: data.role,
      });
      const { accessToken, user } = res.data.data;
      auth.login(accessToken, user);
      navigate(getRedirectPath(user.role), { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/oauth2/authorization/google';
  };

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 p-12 lg:flex">
        <div>
          <Link to="/" className="flex items-center gap-3 text-white">
            <BuildingOffice2Icon className="h-10 w-10" />
            <span className="text-2xl font-bold">Veduka</span>
          </Link>
        </div>
        
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              Join Veduka
              <span className="mt-2 block bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                Today
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-blue-100/80">
              Create an account to book amazing venues or list your banquet halls.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-100/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <span>Instant Booking Confirmation</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <span>Secure Payment Processing</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <StarIcon className="h-5 w-5" />
              </div>
              <span>24/7 Customer Support</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-blue-200/60">
          &copy; {new Date().getFullYear()} Veduka. All rights reserved.
        </p>
      </div>

      {/* Right side - Register Form */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto bg-slate-50 px-4 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Veduka</span>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-2 text-slate-500">Start booking or listing venues today</p>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-4 text-slate-400">or register with phone</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                  errors.fullName ? 'border-red-400' : 'border-slate-200'
                }`}
                {...register('fullName', { required: 'Full name is required' })}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone & Email row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +1 234 567 8900"
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.phone ? 'border-red-400' : 'border-slate-200'
                  }`}
                  {...register('phone', { required: 'Phone number is required' })}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  {...register('email')}
                />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                      errors.password ? 'border-red-400' : 'border-slate-200'
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Min 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                      errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                    }`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Role selector with icons */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'CUSTOMER')}
                  className={`group relative flex flex-col items-center rounded-2xl border-2 px-4 py-5 text-center transition-all ${
                    selectedRole === 'CUSTOMER'
                      ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {selectedRole === 'CUSTOMER' && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </span>
                  )}
                  <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl transition-all ${selectedRole === 'CUSTOMER' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <UserCircleIcon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-bold ${selectedRole === 'CUSTOMER' ? 'text-blue-700' : 'text-slate-700'}`}>
                    Book Venues
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Find and book halls for events
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'OWNER')}
                  className={`group relative flex flex-col items-center rounded-2xl border-2 px-4 py-5 text-center transition-all ${
                    selectedRole === 'OWNER'
                      ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {selectedRole === 'OWNER' && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </span>
                  )}
                  <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl transition-all ${selectedRole === 'OWNER' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <BuildingOffice2Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-bold ${selectedRole === 'OWNER' ? 'text-blue-700' : 'text-slate-700'}`}>
                    List My Hall
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Manage and rent out venues
                  </span>
                </button>
              </div>
              <input type="hidden" {...register('role')} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-700">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-700">Privacy Policy</a>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
