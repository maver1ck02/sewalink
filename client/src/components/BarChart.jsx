export default function BarChart({ items, valueKey = 'count', labelKey = 'month' }) {
  const max = Math.max(...items.map((i) => i[valueKey] || 0), 1);
  return (
    <div className="card">
      {items.length === 0 && <p className="muted">No data yet.</p>}
      {items.map((item) => (
        <div key={item[labelKey]} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{item[labelKey]}</span>
            <span>{item[valueKey]}</span>
          </div>
          <div className="bar">
            <i style={{ width: `${((item[valueKey] || 0) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
