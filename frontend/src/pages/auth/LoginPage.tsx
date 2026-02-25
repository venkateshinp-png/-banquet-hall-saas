import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, BuildingOffice2Icon, SparklesIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline';
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
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      authApi.me().then((res) => {
        auth.login(token, res.data.data);
        navigate(getRedirectPath(res.data.data.role), { replace: true });
      }).catch(() => {
        localStorage.removeItem('accessToken');
        setError('OAuth login failed. Please try again.');
      });
    }
  }, [searchParams, auth, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await authApi.login({ phone: data.phone, password: data.password });
      const { accessToken, user } = res.data.data;
      auth.login(accessToken, user);
      navigate(getRedirectPath(user.role), { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
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
              Book Your Perfect
              <span className="mt-2 block bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                Event Venue
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-blue-100/80">
              Discover stunning banquet halls and function venues for your special occasions.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-100/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <span>500+ Premium Venues</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <span>Verified & Trusted Halls</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <StarIcon className="h-5 w-5" />
              </div>
              <span>10,000+ Happy Customers</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-blue-200/60">
          &copy; {new Date().getFullYear()} Veduka. All rights reserved.
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 flex-col justify-center bg-slate-50 px-4 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Veduka</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">Sign in to continue to your account</p>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-4 text-slate-400">or sign in with phone</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
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
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.password ? 'border-red-400' : 'border-slate-200'
                  }`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
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
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
