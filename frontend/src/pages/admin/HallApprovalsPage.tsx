import { useState, useEffect } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { hallApi } from '../../api/halls';
import { HallStatus } from '../../types';
import type { Hall } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HallApprovalsPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await hallApi.getPending();
      setHalls(res.data.data);
    } catch {
      setError('Failed to load pending registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAction = async (hallId: number, status: 'APPROVED' | 'REJECTED' | 'ON_HOLD') => {
    setSubmitting(hallId);
    setError('');
    try {
      await hallApi.updateStatus(hallId, {
        status,
        notes: adminNotes[hallId] || undefined,
      });
      await fetchPending();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update hall status.';
      setError(msg);
    } finally {
      setSubmitting(null);
    }
  };

  const maskAccountNumber = (num: string | undefined) => {
    if (!num || num.length < 4) return '****';
    return '****' + num.slice(-4);
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
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Pending Hall Registrations</h1>
          {halls.length > 0 && (
            <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#1e3a8a] px-2 text-xs font-bold text-white">
              {halls.length}
            </span>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {halls.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-md ring-1 ring-slate-200">
            <ClipboardDocumentListIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-700">
              No pending registrations
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              All hall registrations have been reviewed. Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {halls.map((hall) => {
              const isExpanded = expandedId === hall.id;
              const isProcessing = submitting === hall.id;

              return (
                <div
                  key={hall.id}
                  className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200"
                >
                  {/* Collapsed header row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(hall.id)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="grid flex-1 grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{hall.name}</p>
                        <p className="text-xs text-slate-400">Hall Name</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{hall.owner?.fullName || 'N/A'}</p>
                        <p className="text-xs text-slate-400">Owner</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{hall.city}</p>
                        <p className="text-xs text-slate-400">City</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(hall.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-400">Date</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="ml-4 h-5 w-5 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="ml-4 h-5 w-5 shrink-0 text-slate-400" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 px-6 py-5">
                      <div className="grid gap-6 lg:grid-cols-3">
                        {/* Hall Info */}
                        <div>
                          <h4 className="mb-3 text-sm font-bold text-slate-900">
                            Hall Details
                          </h4>
                          <dl className="space-y-1.5 text-sm">
                            <div>
                              <dt className="text-xs text-slate-400">Full Address</dt>
                              <dd className="font-medium text-slate-700">
                                {hall.address}, {hall.city}, {hall.state} {hall.zipcode}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-slate-400">Phone</dt>
                              <dd className="font-medium text-slate-700">{hall.phone}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-slate-400">Email</dt>
                              <dd className="font-medium text-slate-700">{hall.email}</dd>
                            </div>
                          </dl>
                        </div>

                        {/* Bank Info */}
                        <div>
                          <h4 className="mb-3 text-sm font-bold text-slate-900">
                            Bank Details
                          </h4>
                          <dl className="space-y-1.5 text-sm">
                            <div>
                              <dt className="text-xs text-slate-400">Account Number</dt>
                              <dd className="font-medium text-slate-700">
                                {maskAccountNumber((hall as any).bankAccountNumber)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-slate-400">Bank Name</dt>
                              <dd className="font-medium text-slate-700">
                                {(hall as any).bankAccountName || 'N/A'}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        {/* Documents */}
                        <div>
                          <h4 className="mb-3 text-sm font-bold text-slate-900">
                            Uploaded Documents
                          </h4>
                          {hall.documents && hall.documents.length > 0 ? (
                            <div className="space-y-2">
                              {hall.documents.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.filePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 hover:underline"
                                >
                                  <DocumentIcon className="h-4 w-4 shrink-0 text-blue-600" />
                                  {doc.documentType}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">No documents uploaded.</p>
                          )}
                        </div>
                      </div>

                      {/* Inline Admin Notes */}
                      <div className="mt-6">
                        <label className="mb-1.5 block text-sm font-bold text-slate-900">
                          Admin Notes
                        </label>
                        <textarea
                          rows={2}
                          value={adminNotes[hall.id] || ''}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({ ...prev, [hall.id]: e.target.value }))
                          }
                          placeholder="Admin Notes"
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
                        />
                      </div>

                      {/* Inline Action Buttons */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(hall.id, 'APPROVED')}
                          className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {isProcessing ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(hall.id, 'REJECTED')}
                          className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction(hall.id, 'ON_HOLD')}
                          className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
                        >
                          Hold
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
