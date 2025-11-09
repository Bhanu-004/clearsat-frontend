// frontend/src/pages/Analysis.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI } from '../services/api';
import { AnalysisCreate, Location } from '../types';
import InteractiveMap from '../components/map/InteractiveMap';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Map, BarChart3, Settings, CheckCircle } from 'lucide-react';

const Analysis: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [loading, setLoading] = useState(false);
  const [analysisCreated, setAnalysisCreated] = useState(false);

  // Form state
  const [location, setLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Omit<AnalysisCreate, 'location'>>({
    start_date: '2024-01-01',  // Changed from 2023
    end_date: '2024-12-31',
    analysis_type: 'NDVI',
    satellite_source: 'landsat',
    buffer_km: 10,
    cloud_cover: 20
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'map') {
      setActiveTab('map');
    }
  }, [searchParams]);

  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualLocation = () => {
    const manualLocation: Location = {
      latitude: 28.6139, // Delhi
      longitude: 77.2090,
      name: 'New Delhi, India'
    };
    setLocation(manualLocation);
    setActiveTab('map');
  };

  const canCreateAnalysis = () => {
    if (user?.role === 'guest') {
      // For demo, we'll allow guests to create analyses
      return true;
    }
    return location !== null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateAnalysis() || !location) {
      alert('Please select a location first');
      return;
    }

    setLoading(true);

    try {
      const analysisData: AnalysisCreate = {
        ...formData,
        location: location
      };

      const response = await analysisAPI.create(analysisData);
      setAnalysisCreated(true);
      
      // Redirect to results page after a short delay
      setTimeout(() => {
        navigate(`/results/${response.data.id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Analysis creation failed:', error);
      alert(error.response?.data?.detail || 'Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  if (analysisCreated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analysis Started!</h2>
          <p className="text-white/60 mb-6">
            Your satellite analysis is being processed. This may take a few minutes.
            You'll be redirected to the results page shortly.
          </p>
          <LoadingSpinner text="Processing satellite data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">New Satellite Analysis</h1>
        <p className="text-white/60">
          Configure your analysis parameters and select a location
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Analysis Configuration
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Analysis Type */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Analysis Type
                </label>
                <select
                  value={formData.analysis_type}
                  onChange={(e) => handleInputChange('analysis_type', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="NDVI">NDVI - Vegetation Index</option>
                  <option value="NDWI">NDWI - Water Index</option>
                  <option value="EVI">EVI - Enhanced Vegetation</option>
                  <option value="BUI">BUI - Built-up Index</option>
                  <option value="NDBI">NDBI - Built-up Density</option>
                  <option value="LST">LST - Land Surface Temperature</option>
                  <option value="LAND_COVER">Land Cover - Basic Classification</option>
                  <option value="ESA_LAND_COVER">Land Cover - ESA Advanced</option>
                </select>
              </div>

              {/* Satellite Source */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Satellite Source
                </label>
                <select
                  value={formData.satellite_source}
                  onChange={(e) => handleInputChange('satellite_source', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="landsat">Landsat 8/9</option>
                  <option value="sentinel">Sentinel-2</option>
                  <option value="modis">MODIS</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Analysis Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Radius (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.buffer_km}
                    onChange={(e) => handleInputChange('buffer_km', parseInt(e.target.value))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Max Cloud Cover (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.cloud_cover}
                    onChange={(e) => handleInputChange('cloud_cover', parseInt(e.target.value))}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Selected Location Display */}
              {location && (
                <div className="p-3 bg-primary-600/20 rounded-lg border border-primary-500/30">
                  <h4 className="font-semibold text-white text-sm mb-1">Selected Location</h4>
                  <p className="text-primary-300 text-sm">{location.name}</p>
                  <p className="text-primary-400/80 text-xs">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                disabled={!canCreateAnalysis()}
                className="w-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>

              {user?.role === 'guest' && (
                <p className="text-yellow-400 text-xs text-center">
                  Guest account: Limited to 1 analysis
                </p>
              )}
            </form>
          </div>

          {/* Quick Location Buttons */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Quick Locations</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualLocation}
                className="w-full justify-start"
              >
                📍 New Delhi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocation({
                    latitude: 19.0760,
                    longitude: 72.8777,
                    name: 'Mumbai, India'
                  });
                }}
                className="w-full justify-start"
              >
                📍 Mumbai
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocation({
                    latitude: 12.9716,
                    longitude: 77.5946,
                    name: 'Bengaluru, India'
                  });
                }}
                className="w-full justify-start"
              >
                📍 Bengaluru
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocation({
                    latitude: 17.3850,
                    longitude: 78.4867,
                    name: 'Hyderabad, India'
                  });
                }}
                className="w-full justify-start"
              >
                📍 Hyderabad
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Map className="w-5 h-5 mr-2" />
                Select Location
              </h2>
              <div className="flex space-x-1 bg-dark-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'map'
                      ? 'bg-primary-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Interactive Map
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'manual'
                      ? 'bg-primary-600 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Manual Input
                </button>
              </div>
            </div>

            {activeTab === 'map' ? (
              <InteractiveMap
                onLocationSelect={handleLocationSelect}
                initialLocation={location || undefined}
              />
            ) : (
              <div className="space-y-4 p-4 bg-dark-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input-field w-full"
                      placeholder="e.g., 28.6139"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input-field w-full"
                      placeholder="e.g., 77.2090"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManualLocation}
                >
                  Use Current Map Location
                </Button>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Click anywhere on the map in India to select a location. 
                The coordinates and location name will update automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
