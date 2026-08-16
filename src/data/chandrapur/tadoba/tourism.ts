/**
 * Tadoba-Andhari Tiger Reserve (TATR) - VANDARSHAN Integrated Tourism (2026)
 */

export interface VandarshanTourism {
  name: string;
  launchDate: string;
  occasion: string;
  partnerOrganizations: string[];
  dedicatedTrain: string;
  concept: string;
  integratedDestinations: string[];
  sourceDisclaimer: string;
}

export const VANDARSHAN_TOURISM_2026: VandarshanTourism = {
  name: "VANDARSHAN Integrated Tourism",
  launchDate: "July 29, 2026",
  occasion: "International Tiger Day",
  partnerOrganizations: ["IRCTC", "Maharashtra Forest Department"],
  dedicatedTrain: "Vidarbha Express",
  concept: "Integrated rail-based wildlife tourism package combining train travel, core safari permit bookings, and luxury accommodation.",
  integratedDestinations: [
    "Tadoba-Andhari Tiger Reserve",
    "Pench Tiger Reserve",
    "Bor Tiger Reserve",
    "Navegaon-Nagzira Tiger Reserve",
    "Umred-Karhandla Wildlife Sanctuary",
    "Tipeshwar Wildlife Sanctuary"
  ],
  sourceDisclaimer: "Source-provided package description. Specific ticket prices, departure schedules, package duration, and booking URLs must be verified on official IRCTC / Forest portals."
};
