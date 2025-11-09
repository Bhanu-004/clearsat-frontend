// frontend/src/config.ts
export const config = {
  API_BASE_URL: 'https://clearsat-backend.onrender.com/api', // Hardcoded for now
  APP_VERSION: '1.0.0',
  
  // Analysis defaults
  DEFAULT_LOCATION: {
    latitude: 28.6139,
    longitude: 77.2090,
    name: 'New Delhi, India'
  },
  
  // Map settings
  MAP: {
    defaultCenter: [20.5937, 78.9629] as [number, number],
    defaultZoom: 5,
    maxZoom: 18
  },
  
  // Feature flags
  FEATURES: {
    EXPORT_PDF: true,
    GUEST_ACCESS: true,
    REAL_TIME_UPDATES: true
  }
};