/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Safari Structure & Gates
 */

export interface SafariZone {
  id: string;
  name: string;
  location: string;
  character: string;
  coreGates: string[];
  bufferGates: string[];
  recommendedFor: string;
}

export interface SafariOverview {
  totalCoreGates: number;
  totalBufferGates: number;
  zones: SafariZone[];
  sourceDisclaimer: string;
}

export const TADOBA_SAFARI_ZONES: SafariOverview = {
  totalCoreGates: 6,
  totalBufferGates: 16,
  zones: [
    {
      id: "moharli",
      name: "Moharli Zone",
      location: "Southwest",
      character: "Oldest and most popular hub with high-activity waterholes",
      coreGates: ["Moharli", "Khutwanda"],
      bufferGates: ["Devada", "Agarzari", "Junona", "Adegaon", "Mamla", "Ramdegi-Navegaon"],
      recommendedFor: "High tiger movement, waterhole sightings, popular safari experience"
    },
    {
      id: "kolara",
      name: "Kolara Zone",
      location: "North",
      character: "Remote, rugged wilderness offering a core safari experience",
      coreGates: ["Kolara"],
      bufferGates: ["Madnapur", "Alizanza", "Sirkada", "Palasgaon", "Chauradeo", "Belara"],
      recommendedFor: "Rugged wilderness core safaris, territory of Maya & Chota Matka"
    },
    {
      id: "navegaon",
      name: "Navegaon Zone",
      location: "Northern remote reaches",
      character: "Quieter, remote northern landscape",
      coreGates: ["Navegaon"],
      bufferGates: ["Nimdela/Navegaon Ramdegi"],
      recommendedFor: "Peaceful remote safaris, landscape wilderness"
    },
    {
      id: "kolsa",
      name: "Kolsa Zone",
      location: "South",
      character: "Relaxed trail area, good for sloth bears and bird sightings",
      coreGates: ["Pangadi", "Zari"],
      bufferGates: ["Pangadi Aswal Chuha", "Kesalghat", "Zari Peth"],
      recommendedFor: "Sloth bear sightings, birdwatching, relaxed wilderness trails"
    }
  ],
  sourceDisclaimer: "Gate allocations and zone descriptions reflect source-provided data. Booking availability and current timings must be checked on the official forest booking portal."
};
