/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Conservation History & Timeline
 */

export interface ConservationMilestone {
  year: number;
  event: string;
  areaDescription: string;
  significance: string;
}

export const TADOBA_HISTORY: ConservationMilestone[] = [
  {
    year: 1879,
    event: "Reserved Forest Designation",
    areaDescription: "Forests around Tadoba region",
    significance: "Forest designated as Reserved Forest primarily to secure timber resources."
  },
  {
    year: 1935,
    event: "Sanctuary Formation",
    areaDescription: "45 square miles (~116.55 sq km) around Tadoba Lake",
    significance: "A 45 sq mile wildlife sanctuary was officially formed around Tadoba Lake."
  },
  {
    year: 1955,
    event: "Tadoba National Park Established",
    areaDescription: "116.54 sq km",
    significance: "Tadoba National Park was formally established as Maharashtra's oldest national park."
  },
  {
    year: 1986,
    event: "Andhari Wildlife Sanctuary Created",
    areaDescription: "508.85 sq km in adjacent forests",
    significance: "Andhari Wildlife Sanctuary created in the adjacent forested tracts of Chandrapur."
  },
  {
    year: 1995,
    event: "Tadoba-Andhari Tiger Reserve (TATR) Created",
    areaDescription: "Merged National Park + Wildlife Sanctuary (~625.40 sq km core)",
    significance: "Tadoba National Park and Andhari Wildlife Sanctuary were merged to form TATR."
  },
  {
    year: 2007,
    event: "Critical Tiger Habitat (CTH) Declaration",
    areaDescription: "625.40 sq km core area",
    significance: "Central core area declared as Critical Tiger Habitat under Project Tiger."
  },
  {
    year: 2010,
    event: "Buffer Zone Notification",
    areaDescription: "1,101.77 sq km surrounding core (including 79 villages)",
    significance: "Surrounding buffer zone established, bringing total protected landscape to 1,727.59 sq km."
  }
];
