import profilesRaw from "@/data/profiles.json";

import { computeMetrics, type ProfileMetrics } from "@/lib/metrics";
import type { Profile, ProfileMap } from "@/lib/types";

/**
 * The profile dump is bundled directly into the app (see src/data/profiles.json),
 * so the data is available synchronously on the client without any server round-trip.
 */

const MAP = profilesRaw as ProfileMap;

const PROFILES: Profile[] = Object.values(MAP).sort((a, b) => b.followers - a.followers);

const METRICS: ProfileMetrics[] = PROFILES.map(computeMetrics);

export interface LoadedData {
  profiles: Profile[];
  metrics: ProfileMetrics[];
  map: ProfileMap;
}

const DATA: LoadedData = {
  profiles: PROFILES,
  metrics: METRICS,
  map: MAP,
};

export function useProfiles(): { data: LoadedData; error: null } {
  return { data: DATA, error: null };
}
