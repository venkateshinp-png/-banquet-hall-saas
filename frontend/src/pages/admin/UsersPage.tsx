import { useState, useEffect } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

interface User {
  id: number;
  phone: string;
  email: string | null;
  fullName: string;
  role: string;
  phoneVerified: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Users Management</h1>

        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-12 text-center shadow-md ring-1 ring-slate-200">
            <UserGroupIcon className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="text-slate-500">User management coming soon</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e3a8a] text-white">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{user.fullName}</td>
                    <td className="px-5 py-4 text-slate-700">{user.phone}</td>
                    <td className="px-5 py-4 text-slate-700">{user.email || '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{user.role}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                          user.phoneVerified
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {user.phoneVerified ? 'Verified' : 'Pending'}
                      </span>
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
