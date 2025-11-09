// frontend/src/components/map/InteractiveMap.tsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface InteractiveMapProps {
  onLocationSelect: (location: Location) => void;
  onBoundsSelect?: (bounds: Bounds) => void;
  initialLocation?: Location;
}

// Search component
const SearchBox: React.FC<{ onLocationFound: (location: Location) => void }> = ({ onLocationFound }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const map = useMap();

  const searchLocation = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        const location: Location = {
          latitude: lat,
          longitude: lng,
          name: result.display_name
        };
        
        map.setView([lat, lng], 12);
        onLocationFound(location);
      } else {
        alert('Location not found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 min-w-64">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search location..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isSearching}
        />
        <button
          onClick={searchLocation}
          disabled={isSearching || !query.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </div>
    </div>
  );
};

// Rectangle drawing handler
const RectangleHandler: React.FC<{ 
  onBoundsSelect: (bounds: Bounds) => void;
  enabled: boolean;
}> = ({ onBoundsSelect, enabled }) => {
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<L.LatLng | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useMapEvents({
    click: (e) => {
      if (!enabled) return;
      
      if (!isDrawing) {
        // Start drawing
        setStartPoint(e.latlng);
        setEndPoint(e.latlng);
        setIsDrawing(true);
      } else {
        // Finish drawing
        setEndPoint(e.latlng);
        setIsDrawing(false);
        
        if (startPoint) {
          const bounds = {
            north: Math.max(startPoint.lat, e.latlng.lat),
            south: Math.min(startPoint.lat, e.latlng.lat),
            east: Math.max(startPoint.lng, e.latlng.lng),
            west: Math.min(startPoint.lng, e.latlng.lng)
          };
          onBoundsSelect(bounds);
        }
        
        // Reset after a short delay
        setTimeout(() => {
          setStartPoint(null);
          setEndPoint(null);
        }, 1000);
      }
    },
    
    mousemove: (e) => {
      if (isDrawing && startPoint) {
        setEndPoint(e.latlng);
      }
    }
  });

  if (!startPoint || !endPoint) return null;

  const bounds = new L.LatLngBounds(
    [Math.min(startPoint.lat, endPoint.lat), Math.min(startPoint.lng, endPoint.lng)],
    [Math.max(startPoint.lat, endPoint.lat), Math.max(startPoint.lng, endPoint.lng)]
  );

  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        color: '#3b82f6',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        dashArray: '5, 5'
      }}
    />
  );
};

// Mode selector component
const ModeSelector: React.FC<{
  mode: 'point' | 'rectangle';
  onModeChange: (mode: 'point' | 'rectangle') => void;
}> = ({ mode, onModeChange }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('point')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            mode === 'point'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📍 Point
        </button>
        <button
          onClick={() => onModeChange('rectangle')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            mode === 'rectangle'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🟦 Rectangle
        </button>
      </div>
    </div>
  );
};

const MapClickHandler: React.FC<{ 
  onLocationSelect: (location: Location) => void;
  enabled: boolean;
}> = ({ onLocationSelect, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (!enabled) return;
      
      const { lat, lng } = e.latlng;
      const locationName = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        name: locationName
      });
    },
  });

  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  onLocationSelect, 
  onBoundsSelect,
  initialLocation 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [mapReady, setMapReady] = useState(false);
  const [mode, setMode] = useState<'point' | 'rectangle'>('point');
  const mapRef = useRef<L.Map | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleBoundsSelect = (bounds: Bounds) => {
    if (onBoundsSelect) {
      onBoundsSelect(bounds);
    }
    
    // Also set the center point for display
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    
    const location: Location = {
      latitude: centerLat,
      longitude: centerLng,
      name: `Area (${bounds.south.toFixed(4)} to ${bounds.north.toFixed(4)})`
    };
    
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleSearchResult = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  // Default center (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  // Update map when initialLocation changes
  useEffect(() => {
    if (initialLocation && mapRef.current) {
      mapRef.current.setView([initialLocation.latitude, initialLocation.longitude], 10);
    }
  }, [initialLocation]);

  if (typeof window === 'undefined') {
    return (
      <div className="h-96 rounded-lg overflow-hidden border border-white/10 bg-dark-700 flex items-center justify-center">
        <p className="text-white/60">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-white/10 relative">
      <MapContainer
        center={selectedLocation ? [selectedLocation.latitude, selectedLocation.longitude] : defaultCenter}
        zoom={selectedLocation ? 10 : 5}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-dark"
        ref={mapRef}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Search Box */}
        <SearchBox onLocationFound={handleSearchResult} />
        
        {/* Mode Selector */}
        <ModeSelector mode={mode} onModeChange={setMode} />
        
        {/* Map Click Handlers */}
        <MapClickHandler 
          onLocationSelect={handleLocationSelect} 
          enabled={mode === 'point'} 
        />
        
        {/* Rectangle Drawing */}
        <RectangleHandler 
          onBoundsSelect={handleBoundsSelect}
          enabled={mode === 'rectangle'}
        />
        
        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker
            key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
            position={[selectedLocation.latitude, selectedLocation.longitude]}
          >
            <Popup>
              <div className="text-dark-900 p-2">
                <strong className="text-sm">Selected Location:</strong><br />
                <span className="text-xs">{selectedLocation.name}</span><br />
                <span className="text-xs">Lat: {selectedLocation.latitude.toFixed(4)}</span><br />
                <span className="text-xs">Lng: {selectedLocation.longitude.toFixed(4)}</span>
                {mode === 'rectangle' && (
                  <div className="mt-1">
                    <span className="text-xs text-blue-600">🟦 Rectangle mode active</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center">
          <p className="text-white/60">Loading map...</p>
        </div>
      )}
      
      {/* Mode Indicator */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2">
        <span className="text-sm text-dark-900">
          Mode: <strong>{mode === 'point' ? '📍 Point Selection' : '🟦 Rectangle Selection'}</strong>
        </span>
      </div>
    </div>
  );
};

export default InteractiveMap;