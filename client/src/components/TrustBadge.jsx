export default function TrustBadge({ score, verified }) {
  return (
    <span className="chips">
      {verified && <span className="badge badge-ok">Verified</span>}
      <span className="trust-pill">SewaTrust {score ?? 0}%</span>
    </span>
  );
}
