/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Famous Tigers (2026 Source Data)
 */

export interface FamousTiger {
  id: string;
  name: string;
  nickname?: string;
  description: string;
  sourceAssociatedTerritory: string[];
  sourceStatus: "provided-source";
}

export const FAMOUS_TIGERS_2026: FamousTiger[] = [
  {
    id: "maya",
    name: "Maya",
    nickname: "Queen of Tadoba",
    description: "Famous resident tigress known for bold, close-range appearances.",
    sourceAssociatedTerritory: ["Kolara core", "Navegaon core"],
    sourceStatus: "provided-source"
  },
  {
    id: "chota_matka",
    name: "Chota Matka",
    description: "Powerful dominant young male.",
    sourceAssociatedTerritory: ["Nimdhela", "Alizanza", "Navegaon buffer", "Kaala Ambaa core"],
    sourceStatus: "provided-source"
  },
  {
    id: "bajrang",
    name: "Bajrang",
    description: "Iconic wide-ranging male.",
    sourceAssociatedTerritory: ["Moharli range", "Core and buffer sections"],
    sourceStatus: "provided-source"
  },
  {
    id: "matkasur",
    name: "Matkasur",
    description: "Aging legendary male historically associated with Belara and Madnapur.",
    sourceAssociatedTerritory: ["Belara", "Madnapur"],
    sourceStatus: "provided-source"
  },
  {
    id: "choti_tara",
    name: "Choti Tara",
    description: "Frequently spotted with cubs in Kolara core and buffer.",
    sourceAssociatedTerritory: ["Kolara core", "Kolara buffer"],
    sourceStatus: "provided-source"
  }
];

export const TIGER_ACCURACY_RULE = "SAFETY RULE: Tigers are wild animals. Do not guarantee tiger presence at any specific gate or date. Describe ranges as source-associated territories.";
