/**
 * SewaTrust score (0–100).
 *
 * Weights:
 * - Identity/business verification   25
 * - Completed jobs                   20  (full at 50 jobs)
 * - Average rating                   20
 * - Review count                     10  (full at 30 reviews)
 * - Response rate                    15
 * - Account age                       5  (full at 365 days)
 * - Report history                 −5 each upheld/resolved-against report (floor 0)
 */
export function calculateTrustScore(profile, { accountCreatedAt, reportCount = 0 } = {}) {
  const verified = profile.verificationStatus === 'approved' ? 25 : 0;
  const jobs = Math.min((profile.completedJobs || 0) / 50, 1) * 20;
  const rating = ((profile.averageRating || 0) / 5) * 20;
  const reviews = Math.min((profile.totalReviews || 0) / 30, 1) * 10;
  const response = ((profile.responseRate || 0) / 100) * 15;
  const ageDays = accountCreatedAt
    ? Math.min((Date.now() - new Date(accountCreatedAt).getTime()) / 86400000, 365) / 365
    : 0;
  const age = ageDays * 5;
  const penalty = Math.min(reportCount * 5, 25);
  const raw = verified + jobs + rating + reviews + response + age - penalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}
