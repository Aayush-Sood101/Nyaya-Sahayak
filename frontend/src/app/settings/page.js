"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'light',
    notifications: true,
    saveHistory: true,
    fontsize: 'medium'
  });
  
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210'
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };
  
  const handleProfileChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };
  
  const saveSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
      alert('Settings saved successfully!');
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back to Chat
          </Link>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy
            </button>
          </nav>
        </div>
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
            
            <div className="space-y-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
              
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={settings.theme === 'light'}
                      onChange={() => handleSettingChange('theme', 'light')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Light</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={settings.theme === 'dark'}
                      onChange={() => handleSettingChange('theme', 'dark')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Dark</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="system"
                      checked={settings.theme === 'system'}
                      onChange={() => handleSettingChange('theme', 'system')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">System</span>
                  </label>
                </div>
              </div>
              
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <select
                  value={settings.fontsize}
                  onChange={(e) => handleSettingChange('fontsize', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications}
                    onChange={() => handleSettingChange('notifications', !settings.notifications)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Change Password */}
              <div>
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => alert('Change password functionality would be implemented here')}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h2>
            
            <div className="space-y-6">
              {/* Save History */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-700">Save Conversation History</span>
                  <span className="text-xs text-gray-500">We'll store your conversations to provide better assistance</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.saveHistory}
                    onChange={() => handleSettingChange('saveHistory', !settings.saveHistory)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Data Export */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your Data</h3>
                <div className="flex space-x-4">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => alert('Export data functionality would be implemented here')}
                  >
                    Export All Data
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={() => alert('Delete data functionality would be implemented here')}
                  >
                    Delete All Data
                  </button>
                </div>
              </div>
              
              {/* Privacy Policy */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">
                  By using our service, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              isSaving ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
