export default function MapPlaceholder({ label, lat, lng }) {
  return (
    <div className="card" aria-label="Map placeholder">
      <strong>Service area map</strong>
      <p className="muted">
        {label || 'Nepal'} {lat && lng ? `(${Number(lat).toFixed(3)}, ${Number(lng).toFixed(3)})` : ''}
      </p>
      <p className="muted">A map provider can be connected later using MAP_API_KEY. Distances already use real coordinates.</p>
    </div>
  );
}
