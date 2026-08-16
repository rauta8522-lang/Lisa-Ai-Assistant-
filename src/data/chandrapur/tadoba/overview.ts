/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Overview, Etymology & Basic Identity
 */

export interface TadobaOverview {
  id: string;
  name: string;
  commonDescription: string;
  location: string;
  district: string;
  state: string;
  etymologyLegend: {
    chiefName: string;
    story: string;
    shrineLocation: string;
    nature: string;
  };
  andhariRiver: {
    description: string;
  };
  areaData: {
    coreAreaSqKm: number;
    bufferAreaSqKm: number;
    totalAreaSqKm: number;
    bufferVillagesCount: number;
    sourceNote: string;
  };
}

export const TADOBA_OVERVIEW: TadobaOverview = {
  id: "tatr_overview",
  name: "Tadoba-Andhari Tiger Reserve (TATR)",
  commonDescription: "The Pride of Vidarbha",
  location: "Chandrapur District, Maharashtra, India",
  district: "Chandrapur",
  state: "Maharashtra",
  etymologyLegend: {
    chiefName: "Taru (also called Tadoba)",
    story: "Taru was a legendary Gond tribal village chief who was tragically killed in a heroic battle with a wild tiger. Local indigenous communities deified him, and built a sacred shrine in his honour beneath a large tree on the banks of Tadoba Lake.",
    shrineLocation: "Beneath a large tree on the banks of Tadoba Lake",
    nature: "Local legend and traditional Gond cultural account"
  },
  andhariRiver: {
    description: "The word 'Andhari' refers to the Andhari River, which winds through the dense woodland of the reserve."
  },
  areaData: {
    coreAreaSqKm: 625.40,
    bufferAreaSqKm: 1101.77,
    totalAreaSqKm: 1727.59,
    bufferVillagesCount: 79,
    sourceNote: "According to provided source data (Total: 1,727.59 sq km, Core: 625.40 sq km, Buffer: 1,101.77 sq km across 79 villages)."
  }
};
