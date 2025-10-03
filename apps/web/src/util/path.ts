export const toAbsPath = (s: string) => (s.startsWith("/") ? s : `/${s}`);
