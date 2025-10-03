export function initials(addr?: string) {
  if (!addr) return "?";
  const name = addr.split("@")[0] || addr;
  return name.slice(0, 1).toUpperCase();
}
