import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface LoginForm {
  phone: string;
  password: string;
}

function getRedirectPath(role: UserRole): string {
  switch (role) {
    case UserRole.CUSTOMER:
      return '/';
    case UserRole.OWNER:
      return '/owner/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.MANAGER:
      return '/owner/bookings';
    default:
      return '/';
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (!auth.loading && auth.user) {
      navigate(getRedirectPath(auth.user.role), { replace: true });
    }
  }, [auth.loading, auth.user, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.login({ phone: data.phone, password: data.password });
      const { accessToken, refreshToken, user } = res.data.data;
      auth.login(accessToken, refreshToken, user);
      navigate(getRedirectPath(user.role), { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
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
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800">Welcome to BanquetBook</h1>
          <p className="mt-2 text-slate-500">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                  errors.phone ? 'border-red-400' : 'border-slate-300'
                }`}
                {...register('phone', { required: 'Phone number is required' })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full rounded-lg border px-4 py-2.5 pr-11 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                    errors.password ? 'border-red-400' : 'border-slate-300'
                  }`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-800 hover:text-blue-900">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
