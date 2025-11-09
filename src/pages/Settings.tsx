// frontend/src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { UserPreferences } from '../types';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Satellite, 
  Map,
  Save,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    default_satellite_source: 'landsat',
    default_analysis_type: 'NDVI',
    default_buffer_km: 10,
    email_notifications: true,
    newsletter_subscription: false,
    map_auto_zoom: true,
  });

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name,
        email: user.email,
      });
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const response = await profileAPI.getPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const showSaveStatus = (status: 'success' | 'error') => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const response = await profileAPI.updateProfile(profileForm);
      updateUser(response.data);
      showSaveStatus('success');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    setSaving(true);
    try {
      await profileAPI.updatePreferences(preferences);
      showSaveStatus('success');
    } catch (error: any) {
      console.error('Failed to update preferences:', error);
      showSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityForm.new_password !== securityForm.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    if (securityForm.new_password.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await profileAPI.changePassword({
        current_password: securityForm.current_password,
        new_password: securityForm.new_password,
      });
      
      setSecurityForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      showSaveStatus('success');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      alert(error.response?.data?.detail || 'Failed to change password');
      showSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Bell },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading settings..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/60">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="card bg-green-600/20 border-green-500/30 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Settings saved successfully!</span>
              </div>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="card bg-red-600/20 border-red-500/30 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Failed to save settings. Please try again.</span>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field w-full"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleProfileSave}
                    loading={saving}
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeTab === 'preferences' && (
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">Analysis Preferences</h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Default Satellite Source
                    </label>
                    <select
                      value={preferences.default_satellite_source}
                      onChange={(e) => setPreferences(prev => ({ ...prev, default_satellite_source: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="landsat">Landsat 8/9</option>
                      <option value="sentinel">Sentinel-2</option>
                      <option value="modis">MODIS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Default Analysis Type
                    </label>
                    <select
                      value={preferences.default_analysis_type}
                      onChange={(e) => setPreferences(prev => ({ ...prev, default_analysis_type: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="NDVI">NDVI - Vegetation Index</option>
                      <option value="NDWI">NDWI - Water Index</option>
                      <option value="EVI">EVI - Enhanced Vegetation</option>
                      <option value="BUI">BUI - Built-up Index</option>
                      <option value="NDBI">NDBI - Built-up Density</option>
                      <option value="LST">LST - Land Surface Temperature</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Default Analysis Radius (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={preferences.default_buffer_km}
                    onChange={(e) => setPreferences(prev => ({ ...prev, default_buffer_km: parseInt(e.target.value) }))}
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-white/80">
                        Email Notifications
                      </label>
                      <p className="text-white/60 text-xs">
                        Receive email notifications when analyses complete
                      </p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.email_notifications ? 'bg-primary-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-white/80">
                        Newsletter Subscription
                      </label>
                      <p className="text-white/60 text-xs">
                        Receive updates about new features and improvements
                      </p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, newsletter_subscription: !prev.newsletter_subscription }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.newsletter_subscription ? 'bg-primary-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.newsletter_subscription ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-white/80">
                        Map Auto-zoom
                      </label>
                      <p className="text-white/60 text-xs">
                        Automatically zoom to selected location on map
                      </p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, map_auto_zoom: !prev.map_auto_zoom }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.map_auto_zoom ? 'bg-primary-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.map_auto_zoom ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handlePreferencesSave}
                    loading={saving}
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={securityForm.current_password}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, current_password: e.target.value }))}
                      className="input-field w-full pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={securityForm.new_password}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, new_password: e.target.value }))}
                      className="input-field w-full pr-10"
                      placeholder="Enter new password"
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={securityForm.confirm_password}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="input-field w-full pr-10"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handlePasswordChange}
                    loading={saving}
                    className="flex items-center"
                    disabled={!securityForm.current_password || !securityForm.new_password || !securityForm.confirm_password}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
