export function isPast(deadline) {
  return Boolean(deadline) && new Date() > new Date(deadline);
}

// Slot dates/times are stored as literal UTC values representing wall-clock time (see
// server/src/routes/admin.js), not real timezone-aware instants — so these must always
// format using timeZone: "UTC", or the displayed value would shift with the viewer's
// local timezone even though nothing about the actual slot changed.
export function formatSlotDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { timeZone: "UTC" });
}

export function formatSlotTime(timeStr) {
  return new Date(timeStr).toLocaleTimeString([], {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
}
