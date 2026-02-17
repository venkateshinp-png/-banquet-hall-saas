import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PlusIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { hallApi } from '../../api/halls';
import type { Hall } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

interface StaffMember {
  id: number;
  phone: string;
  email: string | null;
  fullName: string;
  role: string;
  phoneVerified: boolean;
}

interface StaffFormData {
  phone: string;
  role: string;
}

export default function StaffManagementPage() {
  const { hallId: hallIdParam } = useParams<{ hallId: string }>();
  const hallId = parseInt(hallIdParam || '0', 10);

  const [hall, setHall] = useState<Hall | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({ defaultValues: { role: 'MANAGER' } });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [hallRes, staffRes] = await Promise.all([
        hallApi.get(hallId),
        api.get(`/halls/${hallId}/staff`),
      ]);
      setHall(hallRes.data.data);
      setStaff(staffRes.data.data || []);
    } catch {
      setError('Failed to load staff data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hallId) fetchData();
  }, [hallId]);

  const openAddModal = () => {
    reset({ phone: '', role: 'MANAGER' });
    setModalOpen(true);
  };

  const onSubmit = async (data: StaffFormData) => {
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/halls/${hallId}/staff`, data);
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to add staff member.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (staffId: number) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    setError('');
    try {
      await api.delete(`/halls/${hallId}/staff/${staffId}`);
      await fetchData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to remove staff member.';
      setError(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {hall?.name || 'Hall'} — Staff
              </h1>
              {hall && <StatusBadge status={hall.status} />}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage staff members for this hall
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
          >
            <PlusIcon className="h-5 w-5" />
            Add Staff
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Staff List */}
        {staff.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-md ring-1 ring-slate-200">
            <UserGroupIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">No staff members</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add managers and assistants to help manage this hall.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 font-semibold text-slate-600">Name</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Phone</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Role</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((member) => (
                    <tr
                      key={member.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {member.fullName}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {member.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            member.role === 'MANAGER'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleRemove(member.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Staff Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Staff Member"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone Number *
              </label>
              <input
                type="tel"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
                  errors.phone ? 'border-red-400' : 'border-slate-300'
                }`}
                placeholder="e.g. +91 9876543210"
                {...register('phone', { required: 'Phone number is required' })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                The user must already be registered with this phone number.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Role *
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
                {...register('role', { required: 'Role is required' })}
              >
                <option value="MANAGER">Manager</option>
                <option value="ASSISTANT">Assistant</option>
              </select>
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
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
