export function isPast(deadline) {
  return Boolean(deadline) && new Date() > new Date(deadline);
}
