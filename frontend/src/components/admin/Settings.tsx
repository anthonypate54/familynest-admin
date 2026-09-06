import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, UserPlus, Users, Ban, RotateCcw } from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

const Settings: React.FC = () => {
  const { admin } = useAuth();

  // Change password state
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin management state (SUPER_ADMIN only)
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('ADMIN');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const response = await api.get('/admins');
      setAdmins(response.data.admins);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (pwNew !== pwConfirm) {
      setPwMessage({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }
    if (pwNew.length < 8) {
      setPwMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    try {
      setPwSaving(true);
      await api.post('/auth/change-password', {
        currentPassword: pwCurrent,
        newPassword: pwNew
      });
      setPwMessage({ type: 'success', text: 'Password changed successfully' });
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
    } catch (error: any) {
      setPwMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setPwSaving(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(null);

    if (newAdminPassword.length < 8) {
      setAdminMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setAddingAdmin(true);
      await api.post('/admins', {
        email: newAdminEmail,
        password: newAdminPassword,
        role: newAdminRole
      });
      setAdminMessage({ type: 'success', text: `Admin ${newAdminEmail} created successfully` });
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminRole('ADMIN');
      fetchAdmins();
    } catch (error: any) {
      setAdminMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to create admin'
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleToggleAdminActive = async (adminUser: AdminUser) => {
    try {
      const action = adminUser.is_active ? 'deactivate' : 'reactivate';
      await api.put(`/admins/${adminUser.id}/${action}`);
      fetchAdmins();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Lock className="h-6 w-6 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Change Your Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwMessage && (
            <div className={`px-4 py-3 rounded text-sm ${
              pwMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {pwMessage.text}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                required
                minLength={8}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                required
                minLength={8}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {pwSaving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Admin User Management (SUPER_ADMIN only) - full width, has a table */}
      {isSuperAdmin && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Admin Users</h3>
          </div>

          {adminsLoading ? (
            <div className="flex items-center justify-center h-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{a.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{a.role}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          a.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {a.is_active ? 'active' : 'deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {a.last_login ? new Date(a.last_login).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {a.id !== admin?.id && (
                          <button
                            onClick={() => handleToggleAdminActive(a)}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            {a.is_active ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                            {a.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Add New Admin
            </h4>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              {adminMessage && (
                <div className={`px-4 py-3 rounded text-sm ${
                  adminMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {adminMessage.text}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    required
                    autoComplete="off"
                    name="new-admin-email"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    name="new-admin-password"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPPORT">SUPPORT</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={addingAdmin}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {addingAdmin ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Information - full width */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Version</dt>
            <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Environment</dt>
            <dd className="mt-1 text-sm text-gray-900">Development</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Database</dt>
            <dd className="mt-1 text-sm text-gray-900">PostgreSQL</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Admin API</dt>
            <dd className="mt-1 text-sm text-gray-900">Node.js + Express</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
