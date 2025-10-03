// Re-export from theme constants for backward compatibility
export {
  statusColors as statusColor,
  typeStyles as typeStyle,
  typeEmojis as typeEmoji,
  categoryEmojis as categoryLabelEmoji,
  confettiColors,
} from "@/constants/theme";

// Import animation variants directly
import { animations } from "@/constants/theme";
export const { containerVariants, tabVariants, cardVariants } = animations;
