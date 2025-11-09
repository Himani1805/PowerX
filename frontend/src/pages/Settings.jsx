import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyDigest: true,
    leadAssigned: true,
    leadUpdated: true,
    newMessages: true,
  });
  
  const [preferences, setPreferences] = useState({
    theme: 'light',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    itemsPerPage: 25,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // In a real app, you would dispatch an action to update the settings
      // await dispatch(updateSettings({ notifications, preferences })).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Settings
          </h2>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8 divide-y divide-gray-200">
          {/* Notification Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Notification Preferences
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure how you receive notifications.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email-notifications"
                    name="email"
                    type="checkbox"
                    checked={notifications.email}
                    onChange={handleNotificationChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-notifications" className="font-medium text-gray-700">
                    Email notifications
                  </label>
                  <p className="text-gray-500">Get notified via email.</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="push-notifications"
                    name="push"
                    type="checkbox"
                    checked={notifications.push}
                    onChange={handleNotificationChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="push-notifications" className="font-medium text-gray-700">
                    Push notifications
                  </label>
                  <p className="text-gray-500">Get push notifications on your device.</p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="weekly-digest"
                    name="weeklyDigest"
                    type="checkbox"
                    checked={notifications.weeklyDigest}
                    onChange={handleNotificationChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="weekly-digest" className="font-medium text-gray-700">
                    Weekly digest
                  </label>
                  <p className="text-gray-500">Get a weekly summary of your account activity.</p>
                </div>
              </div>
              
              <div className="ml-6 pl-5 border-l-2 border-gray-200 space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Activity Notifications</h4>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="lead-assigned"
                      name="leadAssigned"
                      type="checkbox"
                      checked={notifications.leadAssigned}
                      onChange={handleNotificationChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      disabled={!notifications.email && !notifications.push}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="lead-assigned" className="font-medium text-gray-700">
                      New leads assigned
                    </label>
                    <p className="text-gray-500">When a new lead is assigned to you.</p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="lead-updated"
                      name="leadUpdated"
                      type="checkbox"
                      checked={notifications.leadUpdated}
                      onChange={handleNotificationChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      disabled={!notifications.email && !notifications.push}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="lead-updated" className="font-medium text-gray-700">
                      Lead updates
                    </label>
                    <p className="text-gray-500">When a lead you're following is updated.</p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="new-messages"
                      name="newMessages"
                      type="checkbox"
                      checked={notifications.newMessages}
                      onChange={handleNotificationChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      disabled={!notifications.email && !notifications.push}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="new-messages" className="font-medium text-gray-700">
                      New messages
                    </label>
                    <p className="text-gray-500">When you receive a new message.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Display & Preferences */}
          <div className="pt-8 space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Display & Preferences
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Customize how information is displayed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={preferences.theme}
                  onChange={handlePreferenceChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={preferences.timezone}
                  onChange={handlePreferenceChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="UTC">UTC</option>
                  <option value="PST">Pacific Time (PST/PDT)</option>
                  <option value="MST">Mountain Time (MST/MDT)</option>
                  <option value="CST">Central Time (CST/CDT)</option>
                  <option value="EST">Eastern Time (EST/EDT)</option>
                </select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  name="dateFormat"
                  value={preferences.dateFormat}
                  onChange={handlePreferenceChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
                  Time Format
                </label>
                <select
                  id="timeFormat"
                  name="timeFormat"
                  value={preferences.timeFormat}
                  onChange={handlePreferenceChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="12h">12-hour (2:30 PM)</option>
                  <option value="24h">24-hour (14:30)</option>
                </select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700">
                  Items per page
                </label>
                <select
                  id="itemsPerPage"
                  name="itemsPerPage"
                  value={preferences.itemsPerPage}
                  onChange={handlePreferenceChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="10">10 items</option>
                  <option value="25">25 items</option>
                  <option value="50">50 items</option>
                  <option value="100">100 items</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Account Settings */}
          <div className="pt-8 space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account preferences and security.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h4 className="text-base font-medium text-gray-900">Change Password</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your account password.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <a
                    href="/change-password"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Change Password
                  </a>
                </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h4 className="text-base font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {user?.twoFactorEnabled ? 'Enabled' : 'Not set up'}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {user?.twoFactorEnabled ? 'Manage' : 'Set up'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Deactivating or deleting your account will permanently remove all of your data and cannot be undone.
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Deactivate Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
