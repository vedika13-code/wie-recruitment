// Shared between the Dashboard's Interview card and the Interview page/booking action
// itself — kept in one place on purpose. A past bug (see docs/ROADMAP.md Stretch 7) was
// caused by these two checks living separately and drifting out of sync: the Dashboard
// card was hardcoded to "locked" while the real unlock logic lived only in interview.js,
// so a shortlisted applicant could never even navigate to the real Interview page.
export const INTERVIEW_UNLOCKED_STATUSES = ["shortlisted", "selected"] as const;

export function isInterviewUnlocked(applicationStatus: string | undefined | null): boolean {
  if (!applicationStatus) return false;
  return (INTERVIEW_UNLOCKED_STATUSES as readonly string[]).includes(applicationStatus);
}
