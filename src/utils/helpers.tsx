// frontend/src/utils/helpers.ts
import { config } from '../config';

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatNumber = (num: number, decimals: number = 4): string => {
  return num.toFixed(decimals);
};

export const getAnalysisColor = (analysisType: string): string => {
  const colors: { [key: string]: string } = {
    NDVI: '#10b981',
    NDWI: '#3b82f6',
    EVI: '#8b5cf6',
    BUI: '#f59e0b',
    NDBI: '#ef4444',
    LST: '#dc2626',
    LAND_COVER: '#059669',
    ESA_LAND_COVER: '#7c3aed'
  };
  
  return colors[analysisType] || '#6b7280';
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};