// frontend/src/types/index.ts
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user' | 'guest';
  created_at: string;
  last_login?: string;
  analysis_count: number;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  default_satellite_source: string;
  default_analysis_type: string;
  default_buffer_km: number;
  email_notifications: boolean;
  newsletter_subscription: boolean;
  map_auto_zoom: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  state?: string;
  district?: string;
}

export type AnalysisType = 'NDVI' | 'NDWI' | 'EVI' | 'BUI' | 'NDBI' | 'LST' | 'LAND_COVER' | 'ESA_LAND_COVER';
export type SatelliteSource = 'landsat' | 'sentinel' | 'modis';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisCreate {
  location: Location;
  start_date: string;
  end_date: string;
  analysis_type: AnalysisType;
  satellite_source: SatelliteSource;
  buffer_km: number;
  cloud_cover: number;
}

export interface Analysis {
  id: string;
  user_id: string;
  location: Location;
  start_date: string;
  end_date: string;
  analysis_type: AnalysisType;
  satellite_source: SatelliteSource;
  status: AnalysisStatus;
  results?: AnalysisResults;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface AnalysisResults {
  time_series: TimeSeriesData[];
  statistics: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    count: number;
  };
  insights: string[];
  images: {
    satellite?: string;
  };
  report_data: {
    location_name: string;
    analysis_period: string;
    satellite_used: string;
    area_covered: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  register: (userData: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (user: User) => void;
}

export interface ProfileStats {
  total_analyses: number;
  analysis_status: Record<string, number>;
  account_age_days: number;
  days_since_last_login: number;
  completion_rate: number;
}

export interface ProfileOverview {
  user: User;
  statistics: ProfileStats;
  recent_analyses: any[];
  account_health: {
    email_verified: boolean;
    is_active: boolean;
    has_strong_password: boolean;
    recent_activity: boolean;
  };
}