import profilesRaw from "@/data/profiles.json";
import wisetvDigital from "@/data/wisetv_digital.json";

import { computeMetrics, type ProfileMetrics } from "@/lib/metrics";
import type { Profile, ProfileMap } from "@/lib/types";

/**
 * The profile dump is bundled directly into the app (see src/data/profiles.json),
 * so the data is available synchronously on the client without any server round-trip.
 * wisetv_digital.json is a separately-scraped account merged in as its own entry.
 */

const MAP: ProfileMap = {
  ...(profilesRaw as ProfileMap),
  [wisetvDigital.username]: wisetvDigital as Profile,
};

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
