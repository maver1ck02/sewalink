/**
 * SewaLink Smart Match (transparent scoring, not machine learning).
 *
 * matchScore =
 *   serviceScore * 0.40 +
 *   distanceScore * 0.25 +
 *   ratingScore * 0.20 +
 *   availabilityScore * 0.10 +
 *   priceScore * 0.05
 *
 * Each factor is normalized to 0–1 before weighting.
 */
export function smartMatch({
  serviceRelevance = 0,
  distanceKm = null,
  rating = 0,
  isAvailable = true,
  price = null,
  minPrice = null,
  maxPrice = null,
}) {
  const serviceScore = Math.max(0, Math.min(1, serviceRelevance));

  let distanceScore = 0.5;
  if (distanceKm != null) {
    distanceScore = Math.max(0, 1 - distanceKm / 25);
  }

  const ratingScore = Math.max(0, Math.min(1, rating / 5));
  const availabilityScore = isAvailable ? 1 : 0.2;

  let priceScore = 0.5;
  if (price != null && minPrice != null && maxPrice != null && maxPrice > minPrice) {
    priceScore = 1 - (price - minPrice) / (maxPrice - minPrice);
    priceScore = Math.max(0, Math.min(1, priceScore));
  }

  const match =
    serviceScore * 0.4 +
    distanceScore * 0.25 +
    ratingScore * 0.2 +
    availabilityScore * 0.1 +
    priceScore * 0.05;

  return Math.round(match * 100);
}

export function serviceRelevance(query, provider, services) {
  if (!query) return 0.7;
  const q = query.toLowerCase();
  const hay = [
    provider.businessName,
    provider.description,
    ...(provider.serviceAreas || []),
    ...services.map((s) => `${s.title} ${s.description}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (hay.includes(q)) return 1;
  const tokens = q.split(/\s+/).filter(Boolean);
  const hits = tokens.filter((t) => hay.includes(t)).length;
  return tokens.length ? hits / tokens.length : 0.5;
}
