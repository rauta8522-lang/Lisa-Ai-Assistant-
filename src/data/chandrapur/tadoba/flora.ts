/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Flora & Forest Canopy
 */

export interface TadobaFlora {
  forestType: string;
  teakCanopyPercentage: string;
  majorTrees: string[];
  panchadharaFreshwaterSprings: {
    associatedTree: string;
    description: string;
  };
  sourceDisclaimer: string;
}

export const TADOBA_FLORA: TadobaFlora = {
  forestType: "Southern Tropical Dry Deciduous Forest",
  teakCanopyPercentage: "87% of the protected canopy",
  majorTrees: [
    "Teak (Tectona grandis)",
    "Ain / crocodile bark (Terminalia elliptica)",
    "Bija (Pterocarpus marsupium)",
    "Dhauda (Anogeissus latifolia)",
    "Salai (Boswellia serrata)",
    "Tendu (Diospyros melanoxylon)",
    "Semal (Bombax ceiba)",
    "Arjun (Terminalia arjuna)"
  ],
  panchadharaFreshwaterSprings: {
    associatedTree: "Arjun trees (Terminalia arjuna)",
    description: "Large Arjun trees are particularly associated with freshwater springs around Panchadhara inside the core area."
  },
  sourceDisclaimer: "According to the provided source, teak represents approximately 87% of the protected forest canopy."
};
