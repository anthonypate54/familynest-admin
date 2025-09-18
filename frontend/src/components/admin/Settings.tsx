import React, { useState, useEffect } from 'react';
import { api } from '../../contexts/AuthContext';
import { Save, DollarSign, Settings as SettingsIcon } from 'lucide-react';

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string;
  updated_at: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState('2.99');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setSettings(response.data.settings);
      
      // Find subscription price setting
      const priceSetting = response.data.settings.find(
        (s: Setting) => s.setting_key === 'subscription.monthly.price'
      );
      if (priceSetting) {
        setSubscriptionPrice(priceSetting.setting_value);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionPrice = async () => {
    try {
      setSaving(true);
      await api.put('/settings/subscription-price', {
        price: parseFloat(subscriptionPrice)
      });
      
      alert('Subscription price updated successfully!');
      fetchSettings(); // Refresh settings
    } catch (error) {
      console.error('Failed to update subscription price:', error);
      alert('Failed to update subscription price');
    } finally {
      setSaving(false);
    }
  };

  // Future use for individual setting updates
  // const updateSetting = async (key: string, value: string) => {
  //   try {
  //     await api.put(`/settings/${key}`, { value });
  //     alert('Setting updated successfully!');
  //     fetchSettings();
  //   } catch (error) {
  //     console.error('Failed to update setting:', error);
  //     alert('Failed to update setting');
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Pricing */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-6 w-6 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Subscription Pricing</h3>
        </div>
        
        <div className="max-w-md">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Subscription Price (USD)
          </label>
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="price"
                value={subscriptionPrice}
                onChange={(e) => setSubscriptionPrice(e.target.value)}
                step="0.01"
                min="0"
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="2.99"
              />
            </div>
            <button
              onClick={updateSubscriptionPrice}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2 inline" />
                  Save
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This price will be applied to all new subscriptions. Existing subscriptions are not affected.
          </p>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
        </div>

        {settings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No settings found</p>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {setting.setting_key}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {setting.description || 'No description available'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Last updated: {new Date(setting.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {setting.setting_value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
