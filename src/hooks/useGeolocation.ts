import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: true,
  });

  const getLocation = () => {
    setLocation((prev) => ({ ...prev, isLoading: true, error: null }));
    
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        let errorMessage = error.message;
        if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Position unavailable. If you are on Windows, ensure 'Location Services' are turned ON in your system settings.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Please try again.";
        } else if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied by browser.";
        }
        
        setLocation({
          latitude: null,
          longitude: null,
          error: errorMessage,
          isLoading: false,
        });
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { ...location, refetch: getLocation };
};
