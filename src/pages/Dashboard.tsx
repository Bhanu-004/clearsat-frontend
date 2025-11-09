// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI } from '../services/api';
import { Analysis } from '../types';
import { 
  BarChart3, 
  Map, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Plus,
  Satellite
} from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const response = await analysisAPI.getAll();
      setAnalyses(response.data);
    } catch (error) {
      console.error('Failed to load analyses:', error);
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

  const stats = [
    {
      label: 'Total Analyses',
      value: analyses.length,
      icon: BarChart3,
      color: 'text-blue-400'
    },
    {
      label: 'Completed',
      value: analyses.filter(a => a.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      label: 'In Progress',
      value: analyses.filter(a => a.status === 'processing').length,
      icon: Clock,
      color: 'text-yellow-400'
    },
    {
      label: 'Failed',
      value: analyses.filter(a => a.status === 'failed').length,
      icon: AlertCircle,
      color: 'text-red-400'
    }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading your analyses..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-white/60">
          Here's your satellite analysis dashboard
          {user?.role === 'guest' && (
            <span className="text-yellow-400 ml-2">
              • Guest account (1 analysis limit)
            </span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card group hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/analysis">
            <div className="card bg-primary-600/20 border-primary-500/30 hover:bg-primary-600/30 cursor-pointer group transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">New Analysis</h3>
                  <p className="text-white/60 text-sm">Start a new satellite analysis</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/analysis?tab=map">
            <div className="card bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/30 cursor-pointer group transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Interactive Map</h3>
                  <p className="text-white/60 text-sm">Select location on map</p>
                </div>
              </div>
            </div>
          </Link>

          {user?.role === 'guest' && (
            <Link to="/register">
              <div className="card bg-green-600/20 border-green-500/30 hover:bg-green-600/30 cursor-pointer group transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Satellite className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Upgrade Account</h3>
                    <p className="text-white/60 text-sm">Unlock all features</p>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Analyses</h2>
          <Link to="/analysis">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/60 mb-2">
              No analyses yet
            </h3>
            <p className="text-white/40 mb-6">
              Start your first satellite imagery analysis
            </p>
            <Link to="/analysis">
              <Button>
                <Play className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.slice(0, 5).map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(analysis.status)}
                  <div>
                    <h3 className="font-semibold text-white">
                      {analysis.location.name}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {analysis.analysis_type} • {analysis.satellite_source}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                    {analysis.status}
                  </span>
                  
                  {analysis.status === 'completed' && (
                    <Link to={`/results/${analysis.id}`}>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                        View Results
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
            
            {analyses.length > 5 && (
              <div className="text-center pt-4">
                <Link to="/analysis">
                  <Button variant="outline" size="sm">
                    View All Analyses
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;