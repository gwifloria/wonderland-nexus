import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export function fmtDateTime(iso?: string | null) {
  if (!iso) return "";
  try {
    return format(new Date(iso), "PP", { locale: zhCN });
  } catch {
    return iso || "";
  }
}
