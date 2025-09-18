import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface UserStats {
  total_users: number;
  trial_users: number;
  active_users: number;
  expired_users: number;
  cancelled_users: number;
  new_users_7d: number;
  new_users_30d: number;
  monthly_revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/stats');
      setStats(response.data.stats);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.new_users_7d || 0} this week`,
    },
    {
      name: 'Active Subscriptions',
      value: stats?.active_users || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: `${Math.round(((stats?.active_users || 0) / (stats?.total_users || 1)) * 100)}% conversion`,
    },
    {
      name: 'Monthly Revenue',
      value: `$${(stats?.monthly_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      change: `$${((stats?.monthly_revenue || 0) / (stats?.active_users || 1)).toFixed(2)} per user`,
    },
    {
      name: 'Trial Users',
      value: stats?.trial_users || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: `${stats?.expired_users || 0} expired`,
    },
  ];

  return (
    <div className="h-full p-6 space-y-6 bg-gray-50">
      {/* Application Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">System Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time monitoring and user management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
          <button
            onClick={fetchStats}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {stat.change}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Subscription Status Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trial Users</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats?.trial_users || 0) / (stats?.total_users || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats?.trial_users || 0}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Subscriptions</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats?.active_users || 0) / (stats?.total_users || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats?.active_users || 0}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expired</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-red-400 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats?.expired_users || 0) / (stats?.total_users || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats?.expired_users || 0}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cancelled</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-gray-400 h-2 rounded-full" 
                    style={{ 
                      width: `${((stats?.cancelled_users || 0) / (stats?.total_users || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats?.cancelled_users || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={fetchStats}
              className="w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
            >
              🔄 Refresh Dashboard
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
              👥 View All Users
            </button>
            <button className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
              ⚙️ System Settings
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors">
              📢 Send Notification
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-sm text-gray-500 text-center py-8">
          Activity tracking coming soon...
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
