import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import { Search, Filter, Calendar, ChevronUp, ChevronDown, ChevronsUpDown, ShieldCheck, X } from 'lucide-react';

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscription_status: string | null;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  platform: string | null;
  current_monthly_price: number | null;
  total_paid: number | null;
  created_at: string;
}

// --- Helpers for rendering the "Verify with platform" result cleanly, instead
// of dumping raw JSON. Shared by the "our record" grid and the platform
// summary grid below, since both are just flat key/value objects.

/** "subscription_end_date" / "expiresDate" -> "Subscription End Date" / "Expires Date" */
const formatFieldLabel = (key: string): string =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Dates come back as either epoch-millis numbers (Apple/our DB) or ISO strings (Google) - handle both. */
const formatFieldValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '\u2014';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (/date|time/i.test(key)) {
    const d = new Date(value as string | number);
    if (!isNaN(d.getTime())) return d.toLocaleString();
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const STATUS_KEYS = new Set(['status', 'subscription_status']);

const statusPillClass = (value: string): string => {
  const v = value.toLowerCase();
  if (v.includes('active')) return 'bg-green-100 text-green-800';
  if (v.includes('expired') || v.includes('revoked') || v.includes('not found')) return 'bg-red-100 text-red-800';
  if (v.includes('cancel')) return 'bg-gray-100 text-gray-800';
  return 'bg-yellow-100 text-yellow-800';
};

/** Renders a flat object as a clean two-column label/value grid, with status-like fields shown as colored pills. */
const KeyValueGrid: React.FC<{ data: Record<string, unknown>; skipKeys?: string[] }> = ({ data, skipKeys = [] }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
    {Object.entries(data)
      .filter(([k]) => !skipKeys.includes(k))
      .map(([k, v]) => (
        <React.Fragment key={k}>
          <div className="text-gray-500">{formatFieldLabel(k)}</div>
          <div className="text-gray-900 font-medium break-all">
            {STATUS_KEYS.has(k) && v ? (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusPillClass(String(v))}`}>
                {String(v)}
              </span>
            ) : (
              formatFieldValue(k, v)
            )}
          </div>
        </React.Fragment>
      ))}
  </div>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // "Verify with platform" modal state - read-only check of what Apple/Google's
  // own servers currently say about a user's subscription, vs our DB.
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, statusFilter, currentPage, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/search', {
        params: {
          q: searchQuery,
          status: statusFilter,
          page: currentPage,
          size: 20,
          sortBy,
          sortOrder
        }
      });
      
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clicking a column: same column toggles direction, different column
  // switches to it (defaulting to ascending) and resets to page 1, since
  // the old page offset is meaningless under a new sort order.
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(0);
  };

  const SortableHeader: React.FC<{ column: string; children: React.ReactNode }> = ({ column, children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-1 hover:text-gray-700"
      >
        {children}
        {sortBy === column ? (
          sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />
        )}
      </button>
    </th>
  );

  const getStatusBadge = (status: string | null) => {
    const statusColors = {
      'trial': 'bg-yellow-100 text-yellow-800',
      'platform_trial': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
    };

    const label = status || 'unknown';
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[label as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {label.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleVerifyPlatform = async (userId: number) => {
    setVerifyResult(null);
    setVerifyError(null);
    setVerifyLoading(true);
    try {
      const response = await api.get(`/users/${userId}/verify-with-platform`);
      setVerifyResult(response.data);
    } catch (error: any) {
      console.error('Failed to verify with platform:', error);
      setVerifyError(error.response?.data?.message || 'Failed to verify with platform');
    } finally {
      setVerifyLoading(false);
    }
  };

  const closeVerifyModal = () => {
    setVerifyResult(null);
    setVerifyError(null);
    setVerifyLoading(false);
  };

  const handleExtendTrial = async (userId: number, days: number) => {
    try {
      await api.post(`/users/${userId}/extend-trial`, { days });
      fetchUsers(); // Refresh the list
      alert(`Trial extended by ${days} days successfully!`);
    } catch (error) {
      console.error('Failed to extend trial:', error);
      alert('Failed to extend trial');
    }
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {users.length} users loaded
            </span>
            <button
              onClick={fetchUsers}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="trial">Trial</option>
              <option value="platform_trial">Platform Trial</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button
            onClick={fetchUsers}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            User Management
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            View and manage user accounts and subscriptions
          </p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader column="name">User</SortableHeader>
                  <SortableHeader column="subscription_status">Status</SortableHeader>
                  <SortableHeader column="trial_end_date">Trial End</SortableHeader>
                  <SortableHeader column="platform">Platform</SortableHeader>
                  <SortableHeader column="current_monthly_price">Monthly</SortableHeader>
                  <SortableHeader column="total_paid">Total Paid</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.subscription_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.trial_end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.platform || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.current_monthly_price !== null ? `$${user.current_monthly_price.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.total_paid !== null ? `$${user.total_paid.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {(user.subscription_status === 'trial' || user.subscription_status === 'platform_trial') && (
                        <button
                          onClick={() => handleExtendTrial(user.id, 7)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Extend trial by 7 days"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          +7d
                        </button>
                      )}
                      <button
                        onClick={() => handleVerifyPlatform(user.id)}
                        className="text-emerald-600 hover:text-emerald-900 flex items-center"
                        title="Verify subscription status directly with Apple/Google"
                      >
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page {currentPage + 1} of {totalPages}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* "Verify with platform" modal */}
      {(verifyLoading || verifyError || verifyResult) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-emerald-600" />
                Platform Verification
              </h3>
              <button onClick={closeVerifyModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {verifyLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-500">Checking with Apple/Google...</p>
                </div>
              )}
              {verifyError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-4">
                  {verifyError}
                </div>
              )}
              {verifyResult && !verifyLoading && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Our record</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <KeyValueGrid data={verifyResult.our_record} skipKeys={['id']} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      payment_transactions rows on file:{' '}
                      <span className="font-medium text-gray-700">{verifyResult.our_payment_transactions_count}</span>
                    </p>
                  </div>

                  {verifyResult.platform_check && (
                    <div className="text-sm text-gray-600 italic">{verifyResult.platform_check}</div>
                  )}

                  {verifyResult.platform_check_error && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md p-4">
                      {verifyResult.platform_check_error}
                    </div>
                  )}

                  {verifyResult.platform_response && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Live check &mdash; {verifyResult.platform_response.source}
                      </h4>
                      {verifyResult.platform_response.summary ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
                          <KeyValueGrid data={verifyResult.platform_response.summary} />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          Couldn't build a summary - see raw response below.
                        </div>
                      )}
                      {verifyResult.platform_response.raw && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Show raw platform response
                          </summary>
                          <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs overflow-x-auto mt-1.5 max-h-64 overflow-y-auto">
                            {typeof verifyResult.platform_response.raw === 'string'
                              ? verifyResult.platform_response.raw
                              : JSON.stringify(verifyResult.platform_response.raw, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
