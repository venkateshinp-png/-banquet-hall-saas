import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserCircleIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
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
      const { accessToken, refreshToken, user } = res.data.data;
      auth.login(accessToken, refreshToken, user);
      navigate(getRedirectPath(user.role), { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-800 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <BuildingOffice2Icon className="h-8 w-8 text-[#1e3a8a]" />
            <span className="text-2xl font-bold text-[#1e3a8a]">BanquetBook</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                    errors.fullName ? 'border-red-400' : 'border-slate-300'
                  }`}
                  {...register('fullName', { required: 'Full name is required' })}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="e.g., +1 234 567 8900"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                  errors.phone ? 'border-red-400' : 'border-slate-300'
                }`}
                {...register('phone', { required: 'Phone number is required' })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Email (optional) */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
                {...register('email')}
              />
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
                    className={`w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                      errors.password ? 'border-red-400' : 'border-slate-300'
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Min 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
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
                    className={`w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                      errors.confirmPassword ? 'border-red-400' : 'border-slate-300'
                    }`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Role selector with icons */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Register as</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'CUSTOMER')}
                  className={`relative flex flex-col items-center rounded-xl border-2 px-4 py-5 text-center transition-all ${
                    selectedRole === 'CUSTOMER'
                      ? 'border-[#1e3a8a] bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {selectedRole === 'CUSTOMER' && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a8a] text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </span>
                  )}
                  <UserCircleIcon className={`mb-2 h-10 w-10 ${selectedRole === 'CUSTOMER' ? 'text-[#1e3a8a]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${selectedRole === 'CUSTOMER' ? 'text-[#1e3a8a]' : 'text-slate-700'}`}>
                    Customer
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Book banquet halls and manage your events.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'OWNER')}
                  className={`relative flex flex-col items-center rounded-xl border-2 px-4 py-5 text-center transition-all ${
                    selectedRole === 'OWNER'
                      ? 'border-[#1e3a8a] bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {selectedRole === 'OWNER' && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#1e3a8a] text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </span>
                  )}
                  <BuildingOffice2Icon className={`mb-2 h-10 w-10 ${selectedRole === 'OWNER' ? 'text-[#1e3a8a]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${selectedRole === 'OWNER' ? 'text-[#1e3a8a]' : 'text-slate-700'}`}>
                    Hall Owner
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    List and manage your banquet halls.
                  </span>
                </button>
              </div>
              <input type="hidden" {...register('role')} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#1e3a8a] hover:text-blue-900">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
