import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  target_type: string;
  is_active: boolean;
  show_from: string;
  show_until: string | null;
  priority: number;
  created_at: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'ANNOUNCEMENT',
    priority: 1,
    showUntil: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async () => {
    try {
      await api.post('/notifications', {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        priority: newNotification.priority,
        showUntil: newNotification.showUntil || null
      });
      
      setNewNotification({
        title: '',
        message: '',
        type: 'ANNOUNCEMENT',
        priority: 1,
        showUntil: ''
      });
      setShowCreateForm(false);
      fetchNotifications();
      alert('Notification created successfully!');
    } catch (error) {
      console.error('Failed to create notification:', error);
      alert('Failed to create notification');
    }
  };

  const toggleNotificationStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/notifications/${id}`, {
        isActive: !currentStatus
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to toggle notification:', error);
      alert('Failed to update notification status');
    }
  };

  const deleteNotification = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
      alert('Notification deleted successfully!');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      alert('Failed to delete notification');
    }
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      'ANNOUNCEMENT': 'bg-blue-100 text-blue-800',
      'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
      'PROMOTION': 'bg-green-100 text-green-800',
      'WARNING': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Manage app-wide notifications and announcements</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Notification</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter notification title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter notification message"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="WARNING">Warning</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({...newNotification, priority: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Until (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newNotification.showUntil}
                  onChange={(e) => setNewNotification({...newNotification, showUntil: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={createNotification}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Create Notification
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Notifications</h3>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No notifications found. Create your first notification above.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      {getTypeBadge(notification.notification_type)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        notification.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Created: {new Date(notification.created_at).toLocaleString()}</div>
                      {notification.show_until && (
                        <div>Show until: {new Date(notification.show_until).toLocaleString()}</div>
                      )}
                      <div>Priority: {notification.priority}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleNotificationStatus(notification.id, notification.is_active)}
                      className={`p-2 rounded-md ${
                        notification.is_active
                          ? 'text-gray-600 hover:text-gray-800'
                          : 'text-green-600 hover:text-green-800'
                      }`}
                      title={notification.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {notification.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
