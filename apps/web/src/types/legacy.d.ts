// Legacy types - deprecated, use domain-specific types instead
//
// These types have been moved to:
// - WorkHistoryProps, ProjectExperienceProps -> types/contact.ts
// - Destination, MapDestinationMarker -> types/travel.ts
// - GitItem -> types/common.ts (as GitHubFile)
//
// This file is kept for backward compatibility and will be removed in future versions.

export type {
  WorkHistory as WorkHistoryProps,
  ProjectExperience as ProjectExperienceProps,
} from "./contact";

export type { Destination, MapDestinationMarker } from "./travel";

export type { GitHubFile as GitItem } from "./common";
