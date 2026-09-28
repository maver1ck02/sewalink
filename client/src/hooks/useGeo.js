import { useCallback, useState } from 'react';

export function useGeo() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError('');
      },
      () => setError('Location permission was denied')
    );
  }, []);

  return { coords, error, request };
}
