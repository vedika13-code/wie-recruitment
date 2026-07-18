export function isPast(deadline: Date | string | null | undefined): boolean {
  return Boolean(deadline) && new Date() > new Date(deadline as Date | string);
}

// Slot dates/times are stored as literal UTC values representing wall-clock time (see
// the interview-slot creation logic), not real timezone-aware instants — so these must
// always format using timeZone: "UTC", or the displayed value would shift with the
// viewer's local timezone even though nothing about the actual slot changed.
export function formatSlotDate(dateStr: Date | string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { timeZone: "UTC" });
}

export function formatSlotTime(timeStr: Date | string): string {
  return new Date(timeStr).toLocaleTimeString([], {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
}
