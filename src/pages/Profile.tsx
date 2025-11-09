// frontend/src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { ProfileOverview, Analysis } from '../types';
import { 
  User, 
  BarChart3, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Settings,
  Edit3,
  Satellite
} from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getOverview();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-white/60 mb-6">
            There was an error loading your profile.
          </p>
          <Button onClick={loadProfile}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-white/60">
            Manage your account and view your activity
          </p>
        </div>
        <Link to="/settings">
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Card */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile.user.full_name}</h2>
                <p className="text-white/60">{profile.user.email}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block ${
                  profile.user.role === 'admin' 
                    ? 'bg-red-500/20 text-red-400' 
                    : profile.user.role === 'user'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {profile.user.role}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Member Since</span>
                <span className="text-white font-semibold">
                  {new Date(profile.user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/60">Last Login</span>
                <span className="text-white font-semibold">
                  {profile.user.last_login 
                    ? new Date(profile.user.last_login).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/60">Analyses</span>
                <span className="text-white font-semibold">
                  {profile.statistics.total_analyses}
                </span>
              </div>
            </div>
          </div>

          {/* Account Health */}
          <div className="card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Account Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Email Verified</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  profile.account_health.email_verified
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {profile.account_health.email_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Account Active</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  profile.account_health.is_active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {profile.account_health.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Recent Activity</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  profile.account_health.recent_activity
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {profile.account_health.recent_activity ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Statistics & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="p-2 bg-blue-600/20 rounded-lg w-fit mx-auto mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white/60 text-sm">Total Analyses</p>
              <p className="text-2xl font-bold text-white">{profile.statistics.total_analyses}</p>
            </div>

            <div className="card text-center">
              <div className="p-2 bg-green-600/20 rounded-lg w-fit mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-white/60 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(profile.statistics.completion_rate * 100)}%
              </p>
            </div>

            <div className="card text-center">
              <div className="p-2 bg-purple-600/20 rounded-lg w-fit mx-auto mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white/60 text-sm">Account Age</p>
              <p className="text-2xl font-bold text-white">{profile.statistics.account_age_days}d</p>
            </div>

            <div className="card text-center">
              <div className="p-2 bg-orange-600/20 rounded-lg w-fit mx-auto mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-white/60 text-sm">Last Active</p>
              <p className="text-2xl font-bold text-white">{profile.statistics.days_since_last_login}d</p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Analysis Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(profile.statistics.analysis_status).map(
                ([status, count]: [string, number]) => (
                <div key={status} className="text-center p-4 bg-white/5 rounded-lg">
                  <div className={`p-2 rounded-lg w-fit mx-auto mb-2 ${
                    status === 'completed' ? 'bg-green-600/20' :
                    status === 'processing' ? 'bg-yellow-600/20' :
                    status === 'failed' ? 'bg-red-600/20' :
                    'bg-gray-600/20'
                  }`}>
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-white/60 text-sm capitalize">{status}</p>
                  <p className="text-xl font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Recent Analyses</h3>
              <Link to="/analysis">
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </Link>
            </div>

            {profile.recent_analyses.length === 0 ? (
              <div className="text-center py-8">
                <Satellite className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No analyses yet</p>
                <p className="text-white/40 text-sm mt-1">Start your first analysis to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.recent_analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-primary-400" />
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {analysis.location_name}
                        </h4>
                        <p className="text-white/60 text-xs">
                          {analysis.analysis_type} • {analysis.satellite_source}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(analysis.status)}`}>
                        {analysis.status}
                      </span>
                      <span className="text-white/40 text-xs">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
