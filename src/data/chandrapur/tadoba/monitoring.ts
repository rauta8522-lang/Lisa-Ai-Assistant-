/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Wildlife Monitoring & AI Tiger Warning System
 */

export interface MachanCensus2026 {
  event: string;
  date: string;
  occasion: string;
  purpose: string;
  totalAnimalsTracked: number;
  tigerSightings: {
    total: number;
    core: number;
    buffer: number;
    notableObservation: string;
  };
  leopardSightings: number;
  sourceStatus: "provided-source";
}

export interface AITigerWarningSystem {
  deploymentDate: string;
  location: string;
  technology: string;
  mechanism: string[];
  purpose: string[];
  sourceStatus: "provided-source";
}

export const MACHAN_CENSUS_2026: MachanCensus2026 = {
  event: "Machan Census 2026",
  date: "May 1, 2026",
  occasion: "Buddha Purnima full moon night",
  purpose: "Track wildlife around summer-parched waterholes",
  totalAnimalsTracked: 5765,
  tigerSightings: {
    total: 42,
    core: 19,
    buffer: 23,
    notableObservation: "More tiger sightings were recorded in buffer areas (23) than in core areas (19) during this census."
  },
  leopardSightings: 13,
  sourceStatus: "provided-source"
};

export const AI_TIGER_WARNING_SYSTEM: AITigerWarningSystem = {
  deploymentDate: "July 2025",
  location: "20 high-risk buffer villages in Tadoba landscape",
  technology: "AI-based tiger warning camera traps connected to localized loudspeakers",
  mechanism: [
    "AI camera traps monitor tiger movements near human habitations",
    "Camera traps are connected to localized loudspeakers in villages",
    "When tiger movement is detected near human settlements, the system automatically broadcasts warning announcements to villagers"
  ],
  purpose: [
    "Human-wildlife conflict mitigation",
    "Early warning for villagers",
    "Community safety and livestock protection"
  ],
  sourceStatus: "provided-source"
};
