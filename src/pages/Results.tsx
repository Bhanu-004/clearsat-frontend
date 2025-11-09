// frontend/src/pages/Results.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI, reportsAPI } from '../services/api';
import { Analysis, AnalysisResults } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Download,
  ArrowLeft,
  Satellite,
  MapPin,
  Calendar,
  BarChart3,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadAnalysis();
    }
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const response = await analysisAPI.getById(id!);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalysis = async () => {
    setRefreshing(true);
    await loadAnalysis();
    setRefreshing(false);
  };

  const exportPDF = async () => {
    if (!analysis) return;
    
    setExporting(true);
    try {
      const response = await reportsAPI.generatePDF(analysis.id);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clearsat-report-${analysis.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('Guest users cannot export PDF reports. Please register for full access.');
      } else {
        alert('Failed to generate PDF report');
      }
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20';
      case 'processing':
        return 'text-yellow-400 bg-yellow-500/20 animate-pulse';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading analysis results..." />;
  }

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analysis Not Found</h2>
          <p className="text-white/60 mb-6">
            The requested analysis could not be found or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const results = analysis.results as AnalysisResults;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Analysis Results</h1>
            <p className="text-white/60">
              {analysis.location.name} • {analysis.analysis_type}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(analysis.status)}`}>
            {getStatusIcon(analysis.status)}
            <span>{analysis.status}</span>
          </span>

          {analysis.status === 'completed' && (
            <Button
              onClick={exportPDF}
              loading={exporting}
              disabled={user?.role === 'guest'}
              title={user?.role === 'guest' ? 'Guest users cannot export PDF' : 'Export PDF Report'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          )}

          <Button
            variant="outline"
            onClick={refreshAnalysis}
            loading={refreshing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {analysis.status === 'processing' && (
        <div className="card bg-blue-600/20 border-blue-500/30 mb-8">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <div>
              <h3 className="font-semibold text-white">Processing Satellite Data</h3>
              <p className="text-blue-300 text-sm">
                Your analysis is being processed. This may take a few minutes. 
                The page will update automatically when complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {analysis.status === 'failed' && (
        <div className="card bg-red-600/20 border-red-500/30 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="font-semibold text-white">Analysis Failed</h3>
              <p className="text-red-300 text-sm">
                {analysis.error_message || 'An error occurred while processing your analysis.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {analysis.status === 'completed' && results && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-600/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Location</p>
                  <p className="text-white font-semibold">{analysis.location.name}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Analysis Period</p>
                  <p className="text-white font-semibold">
                    {new Date(analysis.start_date).toLocaleDateString()} - {new Date(analysis.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Satellite className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Satellite</p>
                  <p className="text-white font-semibold">{analysis.satellite_source.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Data Points</p>
                  <p className="text-white font-semibold">{results.statistics.count}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-8">
              {/* Time Series Chart */}
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Time Series Analysis
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.time_series}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0EA5E9" 
                        strokeWidth={2}
                        dot={{ fill: '#0EA5E9', strokeWidth: 2 }}
                        name={analysis.analysis_type}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Statistics Chart */}
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4">Statistical Summary</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Mean', value: results.statistics.mean },
                      { name: 'Median', value: results.statistics.median },
                      { name: 'Min', value: results.statistics.min },
                      { name: 'Max', value: results.statistics.max },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        formatter={(value) => [value.toFixed(4), analysis.analysis_type]}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#0EA5E9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column - Insights & Details */}
            <div className="space-y-8">
              {/* Key Insights */}
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {results.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/80 text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="card">
                <h3 className="text-xl font-bold text-white mb-4">Detailed Statistics</h3>
                <div className="space-y-3">
                  {Object.entries(results.statistics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                      <span className="text-white/60 capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-white font-semibold">
                        {typeof value === 'number' ? value.toFixed(4) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Satellite Image */}
              {results.images?.satellite && (
                <div className="card">
                  <h3 className="text-xl font-bold text-white mb-4">Satellite Imagery</h3>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <img 
                      src={results.images.satellite} 
                      alt="Satellite view"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    True color composite of the analyzed area
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Raw Data Table */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Time Series Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-white/60 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-white/60 font-semibold">{analysis.analysis_type} Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.time_series.slice(0, 10).map((data, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white/80">
                        {new Date(data.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">
                        {data.value.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.time_series.length > 10 && (
                <div className="p-4 text-center border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    Showing 10 of {results.time_series.length} data points
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {analysis.status === 'completed' && !results && (
        <div className="card text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Results Available</h2>
          <p className="text-white/60 mb-6">
            The analysis completed but no results were generated. This might be due to insufficient satellite data for the selected parameters.
          </p>
          <Link to="/analysis">
            <Button>
              Start New Analysis
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Results;