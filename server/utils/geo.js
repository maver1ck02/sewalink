/**
 * GeoJSON uses [longitude, latitude].
 * Distance helpers use the Haversine formula so nearby results
 * are never fake hardcoded values.
 */
export function toGeoPoint(lng, lat) {
  return {
    type: 'Point',
    coordinates: [Number(lng), Number(lat)],
  };
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

export const NEPAL_CITIES = [
  { label: 'Kathmandu', lat: 27.7172, lng: 85.324 },
  { label: 'Lalitpur', lat: 27.6588, lng: 85.3247 },
  { label: 'Bhaktapur', lat: 27.671, lng: 85.4298 },
  { label: 'Pokhara', lat: 28.2096, lng: 83.9856 },
  { label: 'Biratnagar', lat: 26.4525, lng: 87.2718 },
  { label: 'Birgunj', lat: 27.012, lng: 84.877 },
  { label: 'Butwal', lat: 27.7006, lng: 83.4483 },
  { label: 'Chitwan', lat: 27.5291, lng: 84.3542 },
];
